<?php
function renderPhotomatonCard($photomaton, $warningThreshold, $criticalThreshold, $photomatonModel) {
    $progressBarColor = getProgressBarColor($photomaton['remaining_prints'], $warningThreshold, $criticalThreshold);
    $warning = getWarningMessage($photomaton['remaining_prints'], $warningThreshold, $criticalThreshold);
    $isRouterConnected = $photomaton['router_connected'] ?? false;
    $isPcConnected = $photomaton['pc_connected'] ?? false;
    ?>
    <div class="card rounded-xl overflow-hidden shadow-sm border border-gray-100" data-photomaton-id="<?php echo $photomaton['id']; ?>">
        <!-- En-tête -->
        <div class="bg-gradient-to-r from-coral to-coral-light p-4 text-white">
            <div class="mb-2">
                <div class="flex items-center justify-between">
                    <h2 class="font-bold text-xl truncate">
                        <?php echo htmlspecialchars($photomaton['name']); ?>
                    </h2>
                    <?php if (!$isRouterConnected): ?>
                        <div class="router-status flex items-center gap-1 text-white/80 bg-white/20 px-2 py-1 rounded text-sm">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="1" y1="1" x2="23" y2="23"/>
                                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
                                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
                                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                                <line x1="12" y1="20" x2="12.01" y2="20"/>
                            </svg>
                            Routeur déconnecté
                        </div>
                    <?php endif; ?>
                </div>
                <p class="text-sm mt-1 h-5 opacity-90 event-title">
                    <?php echo htmlspecialchars($photomaton['current_event'] ?? 'Aucun événement'); ?>
                </p>
            </div>
        </div>

        <div class="p-4 space-y-4">
            <?php include 'photomaton-card/warning.php'; ?>
            
            <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Photos restantes</span>
                    <span class="font-medium remaining-prints"><?php echo $photomaton['remaining_prints']; ?> / 700</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <?php $percentage = ($photomaton['remaining_prints'] / 700) * 100; ?>
                    <div class="progress-bar <?php echo $progressBarColor; ?> h-2.5 rounded-full transition-all duration-300" 
                         style="width: <?php echo $percentage; ?>%"></div>
                </div>
            </div>

            <div class="controls-section">
                <?php include 'photomaton-card/controls.php'; ?>
            </div>

            <div class="stats-section">
                <?php include 'photomaton-card/stats.php'; ?>
            </div>

            <div class="speedtest-section">
                <?php include 'photomaton-card/speedtest.php'; ?>
            </div>

            <?php include 'photomaton-card/config.php'; ?>
        </div>
    </div>

    <?php include 'photomaton-card/modals.php'; ?>
    <?php
}
?>