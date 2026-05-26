<?php

require_once __DIR__ . '/../../helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['message' => 'Method not allowed'], 405);
}

$token = getAuthToken();

if (!$token) {
    jsonResponse(['message' => 'Unauthorized - no token'], 401);
}

$payload = verifyAuthToken($token);

if (!$payload) {
    clearAuthCookie();
    jsonResponse(['message' => 'Unauthorized'], 401);
}

try {
    $stmt = db()->prepare('SELECT * FROM users WHERE id = :id AND status = 1 AND delete_at IS NULL LIMIT 1');
    $stmt->execute(['id' => (int)$payload['sub']]);
    $user = $stmt->fetch();
} catch (Throwable $e) {
    jsonResponse([
        'message' => 'Database connection failed',
        'detail' => appDebug() ? $e->getMessage() : null,
    ], 500);
}

if (!$user) {
    clearAuthCookie();
    jsonResponse(['message' => 'Unauthorized'], 401);
}

jsonResponse(publicUser($user));
