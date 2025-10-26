<?php
require_once 'auth.php';
requireAuth();

require_once 'config/database.php';

function getEventsData() {
    global $db_config;
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $db_config['options']);
        
        $query = "
            SELECT 
                events.id,
                events.album_name, 
                photomatons.name AS photomaton, 
                events.total AS total, 
                events.total_numerique AS total_numerique, 
                events.total_gifs AS total_gifs, 
                events.total_prints AS total_imprimee, 
                events.created_at AS date
            FROM events
            LEFT JOIN photomatons ON events.photomaton_id = photomatons.id
            ORDER BY events.created_at DESC
        ";
        
        $stmt = $pdo->query($query);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Erreur de base de données : " . $e->getMessage());
        return [];
    }
}

function formatDate($dateString) {
    if (!$dateString) return '-';
    $date = new DateTime($dateString);
    return $date->format('d.m.Y');
}

$events = getEventsData();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BooFactory - Historique des événements</title>
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
            <h2 class="text-2xl font-bold text-gray-900">Historique des événements</h2>
            <p class="text-gray-600 mt-2">Liste complète des événements et leurs statistiques d'impression</p>
        </div>

        <?php if (empty($events)): ?>
            <div class="text-center p-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4">
                    <svg class="w-8 h-8 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Aucun événement disponible</h2>
                <p class="text-gray-600">L'historique des événements n'est pas accessible pour le moment.</p>
            </div>
        <?php else: ?>
            <!-- Vue mobile : Cartes -->
            <div class="lg:hidden grid grid-cols-1 gap-4">
                <?php foreach ($events as $event): ?>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4" data-event-id="<?php echo $event['id']; ?>">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="font-medium text-gray-900"><?php echo htmlspecialchars($event['album_name']); ?></h3>
                                <p class="text-sm text-gray-600 mt-1"><?php echo formatDate($event['date']); ?></p>
                            </div>
                            <button onclick="confirmDelete(<?php echo $event['id']; ?>, '<?php echo addslashes($event['album_name']); ?>')" 
                                    class="text-red-600 hover:text-red-800">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-gray-600">Photomaton</span>
                                <span class="font-medium text-gray-900"><?php echo htmlspecialchars($event['photomaton']); ?></span>
                            </div>
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-gray-600">Numériques</span>
                                <span class="font-medium text-gray-900"><?php echo $event['total_numerique'] ?? 0; ?></span>
                            </div>
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-gray-600">Imprimées</span>
                                <span class="font-medium text-gray-900"><?php echo $event['total_imprimee'] ?? 0; ?></span>
                            </div>
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-gray-600">GIF</span>
                                <span class="font-medium text-gray-900"><?php echo $event['total_gifs'] ?? 0; ?></span>
                            </div>
                            <div class="flex justify-between items-center pt-2">
                                <span class="font-medium text-gray-900">Total</span>
                                <span class="font-medium text-coral">
                                    <?php 
                                        $total = ($event['total_numerique'] ?? 0) + 
                                                ($event['total_imprimee'] ?? 0) + 
                                                ($event['total_gifs'] ?? 0);
                                        echo $total;
                                    ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Vue desktop : Tableau -->
            <div class="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-100">
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Événement</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Photomaton</th>
                                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Numériques</th>
                                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Imprimées</th>
                                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">GIF</th>
                                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total</th>
                                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <?php foreach ($events as $event): ?>
                                <tr class="hover:bg-gray-50" data-event-id="<?php echo $event['id']; ?>">
                                    <td class="px-6 py-4 text-sm text-gray-600">
                                        <?php echo formatDate($event['date']); ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-sm font-medium text-gray-900">
                                            <?php echo htmlspecialchars($event['album_name']); ?>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-600">
                                        <?php echo htmlspecialchars($event['photomaton']); ?>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm text-gray-600">
                                        <?php echo $event['total_numerique'] ?? 0; ?>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm text-gray-600">
                                        <?php echo $event['total_imprimee'] ?? 0; ?>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm text-gray-600">
                                        <?php echo $event['total_gifs'] ?? 0; ?>
                                    </td>
                                    <td class="px-6 py-4 text-right text-sm font-medium text-coral">
                                        <?php 
                                            $total = ($event['total_numerique'] ?? 0) + 
                                                    ($event['total_imprimee'] ?? 0) + 
                                                    ($event['total_gifs'] ?? 0);
                                            echo $total;
                                        ?>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button onclick="confirmDelete(<?php echo $event['id']; ?>, '<?php echo addslashes($event['album_name']); ?>')" 
                                                class="text-red-600 hover:text-red-800">
                                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M3 6h18"/>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal de confirmation -->
            <div id="deleteModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center">
                <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
                    <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer l'événement "<span id="eventName"></span>" ?</p>
                    <div class="flex justify-end gap-4">
                        <button onclick="closeDeleteModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                            Annuler
                        </button>
                        <button onclick="deleteEvent()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </main>

    <script>
        let currentEventId = null;
        const deleteModal = document.getElementById('deleteModal');

        function confirmDelete(eventId, eventName) {
            currentEventId = eventId;
            document.getElementById('eventName').textContent = eventName;
            deleteModal.classList.remove('hidden');
            deleteModal.classList.add('flex');
        }

        function closeDeleteModal() {
            deleteModal.classList.add('hidden');
            deleteModal.classList.remove('flex');
            currentEventId = null;
        }

        async function deleteEvent() {
            if (!currentEventId) return;

            try {
                const formData = new FormData();
                formData.append('event_id', currentEventId);

                const response = await fetch('delete_event.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Supprimer la ligne du tableau
                    const elements = document.querySelectorAll(`[data-event-id="${currentEventId}"]`);
                    elements.forEach(el => el.remove());
                    closeDeleteModal();
                } else {
                    alert('Erreur lors de la suppression : ' + result.message);
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue lors de la suppression');
            }
        }

        // Fermer la modal si on clique en dehors
        deleteModal.addEventListener('click', function(event) {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });

        // Fermer la modal avec la touche Echap
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
                closeDeleteModal();
            }
        });
    </script>
</body>
</html>