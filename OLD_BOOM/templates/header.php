<?php
// Vérifier si on est sur la page de login pour ne pas afficher le header
$currentFile = basename($_SERVER['PHP_SELF']);
if ($currentFile === 'login.php') {
    return;
}
?>
<header class="glass-effect sticky top-0 z-50 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-3">
        <!-- Première ligne : Logo, Date et Déconnexion -->
        <div class="flex items-center justify-between mb-2 sm:mb-0">
            <div class="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF7B7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
                    <path d="M2 13h10"/>
                    <path d="m9 16 3-3-3-3"/>
                </svg>
                <h1 class="text-2xl font-bold text-gray-900">
                    BOOM
                </h1>
            </div>

            <div class="flex items-center gap-3">
                <div class="text-sm text-gray-500 hidden sm:block">
                    <?php echo date('d.m.Y'); ?>
                </div>
                <a href="logout.php" class="text-sm text-gray-600 hover:text-coral transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span class="hidden sm:inline">Déconnexion</span>
                </a>
            </div>
        </div>

        <!-- Deuxième ligne : Navigation (visible uniquement sur mobile) -->
        <div class="sm:hidden flex items-center justify-between border-t border-gray-100 pt-2">
            <a href="index.php" class="text-gray-600 hover:text-coral transition-colors">Planning</a>
            
            <!-- Menu déroulant mobile -->
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="text-gray-600 hover:text-coral transition-colors flex items-center gap-1">
                    Photomatons
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                    <a href="papier-restant.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                        Papier restant
                    </a>
                    <a href="historique.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                        Historique
                    </a>
                    <a href="statistiques.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                        Statistiques
                    </a>
                </div>
            </div>
        </div>

        <!-- Navigation desktop -->
        <nav class="hidden sm:flex items-center space-x-6">
            <a href="index.php" class="text-gray-600 hover:text-coral transition-colors">Planning</a>
            <div class="relative group">
                <button class="text-gray-600 hover:text-coral transition-colors flex items-center gap-1 py-2">
                    Photomatons
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="absolute left-0 top-full pt-2">
                    <div class="w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible transform -translate-y-2 
                              transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                        <a href="papier-restant.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                            Papier restant
                        </a>
                        <a href="historique.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                            Historique
                        </a>
                        <a href="statistiques.php" class="block px-4 py-2 text-gray-700 hover:bg-coral/10 hover:text-coral">
                            Statistiques
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</header>

<!-- Alpine.js pour le menu mobile -->
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>