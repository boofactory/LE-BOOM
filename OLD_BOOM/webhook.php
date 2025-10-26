<?php
require_once 'config/database.php';

function triggerWebhook($url, $data) {
    error_log("Tentative d'appel du webhook: " . $url);
    
    $ch = curl_init($url);
    
    // Configuration comme Node-RED
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    // Options de débogage
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    $verbose = fopen('php://temp', 'w+');
    curl_setopt($ch, CURLOPT_STDERR, $verbose);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Log des informations de débogage
    rewind($verbose);
    $verboseLog = stream_get_contents($verbose);
    error_log("Détails CURL: " . $verboseLog);
    
    if (curl_errno($ch)) {
        error_log("Erreur CURL: " . curl_error($ch));
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'success' => false,
            'error' => $error,
            'debug' => $verboseLog
        ];
    }
    
    curl_close($ch);
    
    error_log("Réponse du webhook: Code HTTP " . $httpCode . ", Réponse: " . ($response ?: 'vide'));
    
    return [
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'code' => $httpCode,
        'response' => $response ?: null,
        'debug' => $verboseLog
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;
    
    error_log("Requête webhook reçue: " . json_encode($data));
    
    $photomatonId = $data['photomaton_id'] ?? null;
    $action = $data['action'] ?? null;
    
    if (!$photomatonId || !$action) {
        http_response_code(400);
        error_log("Paramètres manquants: photomaton_id=" . $photomatonId . ", action=" . $action);
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
        exit;
    }
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
        
        $stmt = $pdo->prepare('SELECT webhook_url FROM photomaton_webhooks WHERE photomaton_id = :id AND action = :action');
        $stmt->execute([
            'id' => $photomatonId,
            'action' => $action
        ]);
        
        $webhook = $stmt->fetch();
        
        if (!$webhook) {
            http_response_code(404);
            error_log("Webhook non trouvé pour photomaton_id=" . $photomatonId . ", action=" . $action);
            echo json_encode(['success' => false, 'message' => 'Webhook non trouvé']);
            exit;
        }
        
        error_log("Webhook trouvé: " . json_encode($webhook));
        
        // Envoi des données au format JSON
        $webhookData = [
            'photomaton_id' => $photomatonId,
            'action' => $action
        ];
        
        $result = triggerWebhook($webhook['webhook_url'], $webhookData);
        
        if ($result['success']) {
            echo json_encode([
                'success' => true, 
                'message' => 'Action exécutée avec succès',
                'code' => $result['code'],
                'debug' => $result['debug']
            ]);
        } else {
            http_response_code(500);
            error_log("Échec de l'exécution du webhook: " . json_encode($result));
            echo json_encode([
                'success' => false, 
                'message' => 'Erreur lors de l\'exécution du webhook',
                'error' => $result['error'] ?? 'Erreur inconnue',
                'code' => $result['code'] ?? null,
                'debug' => $result['debug']
            ]);
        }
    } catch (PDOException $e) {
        error_log("Erreur PDO: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur interne du serveur',
            'error' => $e->getMessage()
        ]);
    } catch (Exception $e) {
        error_log("Erreur générale: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur inattendue',
            'error' => $e->getMessage()
        ]);
    }
    exit;
}