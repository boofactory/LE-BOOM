<!-- Lieu -->
<div class="info-item">
    <svg class="w-5 h-5 text-coral flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
    <div class="info-content">
        <h3 class="text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1">Lieu</h3>
        <p class="text-gray-600 truncate-2-lines text-sm">
            <?php echo htmlspecialchars($note['lieu de l\'évenement'] ?? '-'); ?>
        </p>
    </div>
</div>

<!-- Prestations -->
<div class="info-item">
    <svg class="w-5 h-5 text-coral flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.29 7 12 12 20.71 7"/>
        <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
    <div class="info-content">
        <h3 class="text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1">Prestations</h3>
        <p class="text-gray-600 truncate-2-lines text-sm">
            <?php 
            if (isset($note['Prestations']) && is_array($note['Prestations'])) {
                echo !empty($note['Prestations']) ? htmlspecialchars(implode(' • ', $note['Prestations'])) : '-';
            } else {
                echo htmlspecialchars($note['Prestations'] ?? '-');
            }
            ?>
        </p>
    </div>
</div>