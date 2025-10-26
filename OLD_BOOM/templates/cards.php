<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    <?php foreach ($notes as $note): ?>
        <div class="card rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <!-- En-tête -->
            <div class="bg-gradient-to-r from-coral to-coral-light p-4 text-white">
                <div class="mb-2">
                    <h2 class="font-bold text-xl truncate">
                        <?php echo htmlspecialchars($note['Client'] ?? 'Sans titre'); ?>
                    </h2>
                    <p class="text-sm mt-1 h-5 opacity-90">
                        <?php echo htmlspecialchars($note['Type d\'évenement'] ?? '-'); ?>
                    </p>
                </div>
                <time class="text-sm opacity-90 flex items-center">
                    <svg class="w-4 h-4 mr-1 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <?php echo htmlspecialchars(formatDate($note['Date évènement'] ?? '')); ?>
                </time>
            </div>

            <!-- Contenu -->
            <?php include 'card-content.php'; ?>
        </div>

        <!-- Modal -->
        <?php include 'modal.php'; ?>
    <?php endforeach; ?>
</div>