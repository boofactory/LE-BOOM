<?php
require_once 'config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$eventId = $_POST['event_id'] ?? null;

if (!$eventId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de l\'événement manquant']);
    exit;
}

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
    
    // Début de la transaction
    $pdo->beginTransaction();
    
    // Vérifier si l'événement existe
    $checkStmt = $pdo->prepare('SELECT id FROM events WHERE id = :id');
    $checkStmt->execute(['id' => $eventId]);
    
    if (!$checkStmt->fetch()) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Événement non trouvé']);
        exit;
    }
    
    // Supprimer d'abord les photos associées
    $deletePhotosStmt = $pdo->prepare('DELETE FROM photos WHERE event_id = :event_id');
    $deletePhotosStmt->execute(['event_id' => $eventId]);
    
    // Supprimer l'événement
    $stmt = $pdo->prepare('DELETE FROM events WHERE id = :id');
    $stmt->execute(['id' => $eventId]);
    
    if ($stmt->rowCount() > 0) {
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Événement supprimé avec succès']);
    } else {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Échec de la suppression de l\'événement']);
    }
} catch (PDOException $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    error_log("Erreur PDO lors de la suppression: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la suppression de l\'événement'
    ]);
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    error_log("Erreur générale lors de la suppression: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur inattendue est survenue'
    ]);
}