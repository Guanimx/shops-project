<?php

function loadEnv(): void {
    static $loaded = false;
    if ($loaded) {
        return;
    }

    $loaded = true;
    $paths = [
        dirname(__DIR__) . '/.env',
        __DIR__ . '/.env',
    ];

    foreach ($paths as $path) {
        if (!is_file($path)) {
            continue;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");

            if ($key !== '' && getenv($key) === false) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
            }
        }
    }
}

function envValue(string $key, ?string $default = null): ?string {
    loadEnv();
    $value = getenv($key);
    return $value === false ? $default : $value;
}

function appDebug(): bool {
    return in_array(strtolower((string)envValue('APP_DEBUG', 'false')), ['1', 'true', 'yes', 'on'], true);
}

function setCorsHeaders(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? envValue('FRONTEND_URL', 'http://localhost:3000');
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (!extension_loaded('pdo_pgsql')) {
        throw new RuntimeException('PDO PostgreSQL driver is not enabled');
    }

    $host = envValue('DB_HOST', '127.0.0.1');
    $port = envValue('DB_PORT', '5432');
    $name = envValue('DB_NAME', 'shops_project');
    $user = envValue('DB_USER', 'postgres');
    $pass = envValue('DB_PASS', '');

    $dsn = "pgsql:host={$host};port={$port};dbname={$name}";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function proxyRequest(string $url, string $method = 'GET', ?array $body = null, array $headers = []): array {
    $ch = curl_init();

    $curlHeaders = ['Content-Type: application/json'];
    foreach ($headers as $key => $value) {
        $curlHeaders[] = "$key: $value";
    }

    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => $curlHeaders,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $responseBody = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['status' => 500, 'data' => ['message' => 'Proxy error: ' . $error]];
    }

    $decoded = json_decode($responseBody, true);
    return ['status' => $httpCode, 'data' => $decoded ?? ['message' => 'Invalid response']];
}

function base64UrlEncode(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string|false {
    return base64_decode(strtr($value, '-_', '+/'));
}

function authSecret(): string {
    return envValue('AUTH_SECRET', 'dev-only-change-this-secret');
}

function createAuthToken(array $user): string {
    $payload = [
        'sub' => (int)$user['id'],
        'username' => $user['username'] ?? $user['email'] ?? '',
        'exp' => time() + (int)envValue('AUTH_TOKEN_TTL', '3600'),
    ];

    $encodedPayload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', $encodedPayload, authSecret());

    return "{$encodedPayload}.{$signature}";
}

function verifyAuthToken(string $token): ?array {
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) {
        return null;
    }

    [$encodedPayload, $signature] = $parts;
    $expectedSignature = hash_hmac('sha256', $encodedPayload, authSecret());
    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $decoded = base64UrlDecode($encodedPayload);
    if ($decoded === false) {
        return null;
    }

    $payload = json_decode($decoded, true);
    if (!is_array($payload) || empty($payload['sub']) || (int)($payload['exp'] ?? 0) < time()) {
        return null;
    }

    return $payload;
}

function publicUser(array $user): array {
    $image = $user['image'] ?? '';
    if (is_string($image) && str_starts_with($image, '/')) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $image = $host !== '' ? "{$scheme}://{$host}{$image}" : $image;
    }

    return [
        'id' => (int)$user['id'],
        'username' => $user['username'] ?? '',
        'email' => $user['email'] ?? '',
        'firstName' => $user['name'] ?? '',
        'lastName' => '',
        'phone' => $user['phone'] ?? '',
        'image' => $image,
        'role' => ((int)($user['role_id'] ?? 2)) === 1 ? 'admin' : 'user',
        'gender' => '',
        'age' => 0,
    ];
}

function getAuthToken(): ?string {
    // Try from httpOnly cookie
    if (isset($_COOKIE['auth_token'])) {
        return $_COOKIE['auth_token'];
    }

    // Try from Authorization header (fallback)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($authHeader, 'Bearer ')) {
        return substr($authHeader, 7);
    }

    return null;
}

function setAuthCookie(string $token): void {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie('auth_token', $token, [
        'expires'  => time() + (int)envValue('AUTH_TOKEN_TTL', '3600'),
        'path'     => '/',
        'httponly' => true,
        'secure'   => $secure,
        'samesite' => 'Lax',
    ]);
}

function clearAuthCookie(): void {
    setcookie('auth_token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
