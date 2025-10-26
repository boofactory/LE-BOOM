<?php
require_once 'auth.php';
requireAuth();

require_once 'config/database.php';
require_once 'includes/utils.php';
require_once 'includes/photomaton.php';
require_once 'templates/photomaton-card.php';

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
    
    $photomatonModel = new Photomaton($pdo);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_thresholds') {
        $photomatonId = $_POST['photomaton_id'] ?? null;
        $warningThreshold = $_POST['warning_threshold'] ?? 350;
        $criticalThreshold = $_POST['critical_threshold'] ?? 275;
        
        if ($photomatonId) {
            $photomatonModel->updateThresholds($photomatonId, $warningThreshold, $criticalThreshold);
        }
        
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }

    $photomatons = $photomatonModel->getAllData();
} catch (PDOException $e) {
    error_log("Erreur de base de données : " . $e->getMessage());
    $photomatons = [];
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BooFactory - Papier restant</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'coral': '#FF7B7B',
                        'coral-light': '#FF9B9B',
                        'skyblue': '#7BD4FF',
                        'skyblue-light': '#9BE0FF',
                        'dark': '#1F2937',
                    },
                    boxShadow: {
                        'card': '0 8px 24px rgba(0, 0, 0, 0.12)',
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'templates/header.php'; ?>
    
    <main class="max-w-7xl mx-auto py-8 px-4">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Papier restant</h2>
            <p class="text-gray-600 mt-2">État des stocks et statistiques des photomatons</p>
        </div>

        <?php if (empty($photomatons)): ?>
            <div class="text-center p-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4">
                    <svg class="w-8 h-8 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Aucun photomaton disponible</h2>
                <p class="text-gray-600">Les données des photomatons ne sont pas accessibles pour le moment.</p>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <?php 
                foreach ($photomatons as $photomaton) {
                    $warningThreshold = $photomaton['warning_threshold'] ?? 350;
                    $criticalThreshold = $photomaton['critical_threshold'] ?? 275;
                    renderPhotomatonCard($photomaton, $warningThreshold, $criticalThreshold, $photomatonModel);
                }
                ?>
            </div>
        <?php endif; ?>
    </main>

    <!-- Charger les scripts -->
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/photomaton-controls.js"></script>
    <script src="assets/js/realtime-updates.js"></script>
</body>
</html>