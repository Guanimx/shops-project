<?php

require_once __DIR__ . '/../../helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['message' => 'Method not allowed'], 405);
}

clearAuthCookie();

jsonResponse(['success' => true, 'message' => 'Logged out successfully']);
