<?php
require_once '../config/database.php';

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupération et validation des données
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['photomaton_id']) || !isset($input['download']) || !isset($input['upload']) || !isset($input['ping'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

$photomatonId = $input['photomaton_id'];
$download = floatval($input['download']);
$upload = floatval($input['upload']);
$ping = floatval($input['ping']);

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
    
    // Insertion des données de speedtest
    $stmt = $pdo->prepare('
        INSERT INTO speedtests (
            photomaton_id,
            download_speed,
            upload_speed,
            ping,
            created_at
        ) VALUES (
            :photomaton_id,
            :download_speed,
            :upload_speed,
            :ping,
            NOW()
        )
    ');
    
    $result = $stmt->execute([
        'photomaton_id' => $photomatonId,
        'download_speed' => $download,
        'upload_speed' => $upload,
        'ping' => $ping
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Données de speedtest enregistrées avec succès'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'enregistrement des données'
        ]);
    }
} catch (PDOException $e) {
    error_log("Erreur PDO lors de l'enregistrement du speedtest: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'enregistrement des données'
    ]);
} catch (Exception $e) {
    error_log("Erreur générale lors de l'enregistrement du speedtest: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur inattendue est survenue'
    ]);
}