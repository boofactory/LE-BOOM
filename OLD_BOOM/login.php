<?php
require_once 'auth.php';

// Si déjà connecté, rediriger vers l'accueil
if (isAuthenticated()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (authenticate($username, $password)) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Identifiants incorrects';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BooFactory - Connexion</title>
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
<body class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <div class="text-center mb-8">
            <div class="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF7B7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
                    <path d="M2 13h10"/>
                    <path d="m9 16 3-3-3-3"/>
                </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">BOOM</h2>
            <p class="mt-2 text-sm text-gray-600">Connectez-vous pour accéder à l'application</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <div class="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
            <form method="POST" class="space-y-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">
                        Nom d'utilisateur
                    </label>
                    <div class="mt-1">
                        <input id="username" name="username" type="text" required 
                               class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                                      shadow-sm placeholder-gray-400 focus:outline-none focus:ring-coral 
                                      focus:border-coral sm:text-sm">
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Mot de passe
                    </label>
                    <div class="mt-1">
                        <input id="password" name="password" type="password" required 
                               class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                                      shadow-sm placeholder-gray-400 focus:outline-none focus:ring-coral 
                                      focus:border-coral sm:text-sm">
                    </div>
                </div>

                <div>
                    <button type="submit" 
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                                   shadow-sm text-sm font-medium text-white bg-coral hover:bg-coral-light 
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral">
                        Se connecter
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>