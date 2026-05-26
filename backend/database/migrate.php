<?php

require_once __DIR__ . '/../helpers.php';

$schemaPath = __DIR__ . '/schema.sql';

if (!is_file($schemaPath)) {
    fwrite(STDERR, "Schema file not found: {$schemaPath}\n");
    exit(1);
}

$schema = file_get_contents($schemaPath);
if ($schema === false || trim($schema) === '') {
    fwrite(STDERR, "Schema file is empty or unreadable.\n");
    exit(1);
}

db()->exec($schema);

echo "Database migrated.\n";
