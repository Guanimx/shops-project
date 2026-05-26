<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

$routes = [
    'POST /api/auth/login' => __DIR__ . '/api/auth/login.php',
    'GET /api/auth/me' => __DIR__ . '/api/auth/me.php',
    'POST /api/auth/profile' => __DIR__ . '/api/auth/profile.php',
    'POST /api/auth/logout' => __DIR__ . '/api/auth/logout.php',
];

$route = $_SERVER['REQUEST_METHOD'] . ' ' . rtrim($path, '/');
$route = $route === $_SERVER['REQUEST_METHOD'] . ' ' ? $_SERVER['REQUEST_METHOD'] . ' /' : $route;

if (isset($routes[$route])) {
    require $routes[$route];
    return true;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['message' => 'Not found']);
return true;
