<?php
require_once '../config/database.php';
require_once '../includes/photomaton.php';

header('Content-Type: application/json');

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
    
    $photomatonModel = new Photomaton($pdo);
    $photomatons = $photomatonModel->getAllData();
    
    echo json_encode([
        'success' => true,
        'data' => $photomatons
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des données'
    ]);
}