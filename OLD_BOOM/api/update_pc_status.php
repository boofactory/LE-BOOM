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

if (!isset($input['photomaton_id']) || !isset($input['pc_connected'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

$photomatonId = $input['photomaton_id'];
$pcConnected = (bool)$input['pc_connected'];

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
    
    // Mise à jour de l'état du PC
    $stmt = $pdo->prepare('
        UPDATE photomatons 
        SET pc_connected = :pc_connected,
            last_updated = NOW()
        WHERE id = :id
    ');
    
    $result = $stmt->execute([
        'pc_connected' => $pcConnected,
        'id' => $photomatonId
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'État du PC mis à jour avec succès'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Photomaton non trouvé'
        ]);
    }
} catch (PDOException $e) {
    error_log("Erreur PDO lors de la mise à jour de l'état du PC: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la mise à jour de l\'état du PC'
    ]);
} catch (Exception $e) {
    error_log("Erreur générale lors de la mise à jour de l'état du PC: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur inattendue est survenue'
    ]);
}