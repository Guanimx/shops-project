<?php

require_once __DIR__ . '/../../helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if ($name === '') {
    jsonResponse(['message' => 'Name is required'], 400);
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Valid email is required'], 400);
}

if ($username === '') {
    jsonResponse(['message' => 'Username is required'], 400);
}

if ($password !== '' && strlen($password) < 4) {
    jsonResponse(['message' => 'Password must be at least 4 characters'], 400);
}

$userId = (int)$payload['sub'];

try {
    $stmt = db()->prepare('SELECT * FROM users WHERE id = :id AND status = 1 AND delete_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        clearAuthCookie();
        jsonResponse(['message' => 'Unauthorized'], 401);
    }

    $stmt = db()->prepare('SELECT id FROM users WHERE email = :email AND id <> :id AND delete_at IS NULL LIMIT 1');
    $stmt->execute(['email' => $email, 'id' => $userId]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'Email is already used'], 409);
    }

    $stmt = db()->prepare('SELECT id FROM users WHERE username = :username AND id <> :id AND delete_at IS NULL LIMIT 1');
    $stmt->execute(['username' => $username, 'id' => $userId]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'Username is already used'], 409);
    }

    $image = $user['image'] ?? '';
    if (isset($_FILES['image']) && is_array($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(['message' => 'Profile image upload failed'], 400);
        }

        if ($_FILES['image']['size'] > 2 * 1024 * 1024) {
            jsonResponse(['message' => 'Profile image must not exceed 2MB'], 400);
        }

        $mime = mime_content_type($_FILES['image']['tmp_name']);
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (!isset($extensions[$mime])) {
            jsonResponse(['message' => 'Profile image must be JPG, PNG, or WEBP'], 400);
        }

        $uploadDir = dirname(__DIR__, 2) . '/uploads/profile';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
            jsonResponse(['message' => 'Unable to prepare upload directory'], 500);
        }

        $fileName = 'user-' . $userId . '-' . bin2hex(random_bytes(8)) . '.' . $extensions[$mime];
        $target = $uploadDir . '/' . $fileName;

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            jsonResponse(['message' => 'Unable to save profile image'], 500);
        }

        $image = '/uploads/profile/' . $fileName;
    }

    $params = [
        'id' => $userId,
        'updated_by' => $userId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'username' => $username,
        'image' => $image,
    ];

    $passwordSql = '';
    if ($password !== '') {
        $passwordSql = ', password = :password';
        $params['password'] = password_hash($password, PASSWORD_DEFAULT);
    }

    $stmt = db()->prepare(
        "UPDATE users
         SET name = :name,
             email = :email,
             phone = :phone,
             username = :username,
             image = :image,
             updated_by = :updated_by,
             updated_at = CURRENT_TIMESTAMP
             {$passwordSql}
         WHERE id = :id"
    );
    $stmt->execute($params);

    $stmt = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $updatedUser = $stmt->fetch();

    setAuthCookie(createAuthToken($updatedUser));

    jsonResponse([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => publicUser($updatedUser),
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'message' => 'Profile update failed',
        'detail' => appDebug() ? $e->getMessage() : null,
    ], 500);
}
