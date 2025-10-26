<?php
require_once 'auth.php';
requireAuth();

require_once 'config.php';
require_once 'notion.php';

$notionClient = new NotionClient(NOTION_API_KEY);
try {
    $notes = $notionClient->getNotes(NOTION_DATABASE_ID);
} catch (Exception $e) {
    $error = $e->getMessage();
}

function formatDate($dateString) {
    if (!$dateString) return '-';
    $date = new DateTime($dateString);
    return $date->format('d.m.Y');
}

function getGoogleMapsUrl($address) {
    if (!$address) return '#';
    return 'https://www.google.com/maps/dir/?api=1&destination=' . urlencode($address);
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BooFactory - Planning</title>
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
        <?php if (isset($error)): ?>
            <div class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php else: ?>
            <?php include 'templates/cards.php'; ?>
        <?php endif; ?>
    </main>

    <script src="assets/js/modal.js"></script>
</body>
</html>