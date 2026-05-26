<?php

require_once __DIR__ . '/../helpers.php';

$pdo = db();
$now = date('Y-m-d H:i:s');

$pdo->beginTransaction();

try {
    $roleStmt = $pdo->prepare(
        'INSERT INTO roles (id, name, code, created_at, updated_at)
         VALUES (:id, :name, :code, :created_at, :updated_at)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             code = EXCLUDED.code,
             updated_at = EXCLUDED.updated_at'
    );

    foreach ([
        ['id' => 1, 'name' => 'Admin', 'code' => 'admin'],
        ['id' => 2, 'name' => 'User', 'code' => 'user'],
    ] as $role) {
        $roleStmt->execute([
            'id' => $role['id'],
            'name' => $role['name'],
            'code' => $role['code'],
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    $userStmt = $pdo->prepare(
        'INSERT INTO users (role_id, name, email, phone, image, username, status, password, created_at, updated_at)
         VALUES (:role_id, :name, :email, :phone, :image, :username, :status, :password, :created_at, :updated_at)
         ON CONFLICT (username) DO UPDATE
         SET role_id = EXCLUDED.role_id,
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             phone = EXCLUDED.phone,
             status = EXCLUDED.status,
             updated_at = EXCLUDED.updated_at'
    );

    $userStmt->execute([
        'role_id' => 1,
        'name' => 'SystemAdmin',
        'email' => 'SystemAdmin@example.com',
        'phone' => '0838865052',
        'image' => null,
        'username' => 'Admin',
        'status' => 1,
        'password' => password_hash('SystemAdmin', PASSWORD_DEFAULT),
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $pdo->exec("SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM roles))");
    $pdo->exec("SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))");

    $pdo->commit();
    echo "Database seeded.\n";
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
