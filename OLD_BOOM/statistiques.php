<?php
require_once 'auth.php';
requireAuth();

require_once 'config/database.php';

function getStatistics() {
    global $db_config;
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
        
        // Statistiques générales
        $stats = [
            'total_events' => 0,
            'avg_sessions' => 0,
            'avg_prints' => 0,
            'avg_gifs' => 0,
            'avg_digital' => 0
        ];
        
        // Records
        $records = [
            'most_sessions' => ['count' => 0, 'event' => ''],
            'most_prints' => ['count' => 0, 'event' => ''],
            'most_gifs' => ['count' => 0, 'event' => ''],
            'most_digital' => ['count' => 0, 'event' => '']
        ];

        // Nombre total d'événements
        $query = "SELECT COUNT(*) as total FROM events";
        $stmt = $pdo->query($query);
        $stats['total_events'] = $stmt->fetch()['total'];

        // Moyennes
        $query = "
            SELECT 
                AVG(total) as avg_sessions,
                AVG(CASE WHEN total_prints > 0 THEN total_prints END) as avg_prints,
                AVG(CASE WHEN total_gifs > 0 THEN total_gifs END) as avg_gifs,
                AVG(CASE WHEN total_numerique > 0 THEN total_numerique END) as avg_digital
            FROM events
        ";
        $stmt = $pdo->query($query);
        $averages = $stmt->fetch();
        
        $stats['avg_sessions'] = round($averages['avg_sessions']);
        $stats['avg_prints'] = round($averages['avg_prints']);
        $stats['avg_gifs'] = round($averages['avg_gifs']);
        $stats['avg_digital'] = round($averages['avg_digital']);

        // Records
        $query = "
            SELECT 
                album_name,
                total as sessions,
                total_prints as prints,
                total_gifs as gifs,
                total_numerique as digital 
            FROM events
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, MAX(total) as max_total FROM events GROUP BY id
                    UNION
                    SELECT id, MAX(total_prints) FROM events GROUP BY id
                    UNION
                    SELECT id, MAX(total_gifs) FROM events GROUP BY id
                    UNION
                    SELECT id, MAX(total_numerique) FROM events GROUP BY id
                ) tmp
            )
        ";
        $stmt = $pdo->query($query);
        $allEvents = $stmt->fetchAll();

        foreach ($allEvents as $event) {
            if ($event['sessions'] > $records['most_sessions']['count']) {
                $records['most_sessions'] = ['count' => $event['sessions'], 'event' => $event['album_name']];
            }
            if ($event['prints'] > $records['most_prints']['count']) {
                $records['most_prints'] = ['count' => $event['prints'], 'event' => $event['album_name']];
            }
            if ($event['gifs'] > $records['most_gifs']['count']) {
                $records['most_gifs'] = ['count' => $event['gifs'], 'event' => $event['album_name']];
            }
            if ($event['digital'] > $records['most_digital']['count']) {
                $records['most_digital'] = ['count' => $event['digital'], 'event' => $event['album_name']];
            }
        }

        return ['stats' => $stats, 'records' => $records];
    } catch (PDOException $e) {
        error_log("Erreur de base de données : " . $e->getMessage());
        return null;
    }
}

$data = getStatistics();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BooFactory - Statistiques</title>
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
            <h2 class="text-2xl font-bold text-gray-900">Statistiques Globales</h2>
            <p class="text-gray-600 mt-2">Vue d'ensemble des performances des photomatons</p>
        </div>

        <?php if (!$data): ?>
            <div class="text-center p-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4">
                    <svg class="w-8 h-8 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Données non disponibles</h2>
                <p class="text-gray-600">Les statistiques ne sont pas accessibles pour le moment.</p>
            </div>
        <?php else: ?>
            <!-- Statistiques générales -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <!-- Total événements -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-coral/10 rounded-lg">
                            <svg class="w-6 h-6 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M21 12H3"/>
                                <path d="M12 3v18"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Total événements</p>
                            <p class="text-2xl font-bold text-gray-900"><?php echo $data['stats']['total_events']; ?></p>
                        </div>
                    </div>
                </div>

                <!-- Moyenne sessions -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-coral/10 rounded-lg">
                            <svg class="w-6 h-6 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                                <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Moy. sessions</p>
                            <p class="text-2xl font-bold text-gray-900"><?php echo $data['stats']['avg_sessions']; ?></p>
                        </div>
                    </div>
                </div>

                <!-- Moyenne imprimées -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-coral/10 rounded-lg">
                            <svg class="w-6 h-6 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M20.4 14.5 16 10 4 20"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Moy. imprimées</p>
                            <p class="text-2xl font-bold text-gray-900"><?php echo $data['stats']['avg_prints']; ?></p>
                        </div>
                    </div>
                </div>

                <!-- Moyenne GIF -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-coral/10 rounded-lg">
                            <svg class="w-6 h-6 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m15 14 5-5-5-5"/>
                                <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Moy. GIF</p>
                            <p class="text-2xl font-bold text-gray-900"><?php echo $data['stats']['avg_gifs']; ?></p>
                        </div>
                    </div>
                </div>

                <!-- Moyenne numériques -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-coral/10 rounded-lg">
                            <svg class="w-6 h-6 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Moy. numériques</p>
                            <p class="text-2xl font-bold text-gray-900"><?php echo $data['stats']['avg_digital']; ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Records -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Records</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <?php foreach ($data['records'] as $type => $record): ?>
                        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="font-semibold text-gray-900">
                                    <?php
                                    $title = match($type) {
                                        'most_sessions' => 'Record de sessions',
                                        'most_prints' => 'Record d\'impressions',
                                        'most_gifs' => 'Record de GIFs',
                                        'most_digital' => 'Record de numériques',
                                        default => $type
                                    };
                                    echo $title;
                                    ?>
                                </h4>
                                <span class="text-2xl font-bold text-coral"><?php echo $record['count']; ?></span>
                            </div>
                            <p class="text-sm text-gray-600">
                                Événement : <span class="font-medium text-gray-900"><?php echo htmlspecialchars($record['event']); ?></span>
                            </p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>