<?php
// Configuration des logs d'erreur
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/error.log');

// Créer le dossier logs s'il n'existe pas
if (!file_exists(dirname(__DIR__) . '/logs')) {
    mkdir(dirname(__DIR__) . '/logs', 0777, true);
}

$db_config = [
    'host' => 'dv7wt.myd.infomaniak.com',
    'dbname' => 'dv7wt_booprint',
    'username' => 'dv7wt_booprint',
    'password' => 'yWU5v-JfkE8',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];