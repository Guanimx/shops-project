<?php

require_once __DIR__ . '/../../helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['message' => 'Method not allowed'], 405);
}

$body = getRequestBody();
$login = trim($body['email'] ?? $body['username'] ?? '');
$password = trim($body['password'] ?? '');

// Validation
if (empty($login)) {
    jsonResponse(['message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'], 400);
}
if (empty($password)) {
    jsonResponse(['message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'], 400);
}
if (strlen($password) < 4) {
    jsonResponse(['message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'], 400);
}

try {
    $stmt = db()->prepare('SELECT * FROM users WHERE (username = :login OR email = :login) AND status = 1 AND delete_at IS NULL LIMIT 1');
    $stmt->execute(['login' => $login]);
    $user = $stmt->fetch();
} catch (Throwable $e) {
    jsonResponse([
        'message' => 'Database connection failed',
        'detail' => appDebug() ? $e->getMessage() : null,
    ], 500);
}

if (!$user || empty($user['password']) || !password_verify($password, $user['password'])) {
    jsonResponse(['message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'], 401);
}

$token = createAuthToken($user);
setAuthCookie($token);

jsonResponse([
    'success' => true,
    'user'    => publicUser($user),
]);
