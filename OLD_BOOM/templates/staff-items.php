<!-- Installation -->
<div class="info-item">
    <svg class="w-5 h-5 text-coral flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
    </svg>
    <div class="info-content">
        <div class="flex items-center gap-2 mb-1 sm:mb-3">
            <h3 class="text-sm font-semibold text-gray-700">Installation</h3>
            <?php if (!empty($note['Event - Heure installation'])): ?>
                <div class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-coral/10 text-coral">
                    <svg class="w-3 h-3 mr-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <?php echo htmlspecialchars($note['Event - Heure installation']); ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="flex flex-wrap gap-1">
            <?php 
            $staff = isset($note['Staff Installation']) && is_array($note['Staff Installation']) 
                ? $note['Staff Installation'] 
                : [$note['Staff Installation'] ?? '-'];
            
            foreach ($staff as $member): ?>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-coral/10 text-coral">
                    <?php echo htmlspecialchars($member); ?>
                </span>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<!-- Récupération -->
<div class="info-item">
    <svg class="w-5 h-5 text-skyblue flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
    <div class="info-content">
        <div class="flex items-center gap-2 mb-1 sm:mb-3">
            <h3 class="text-sm font-semibold text-gray-700">Récupération</h3>
            <?php if (!empty($note['Event - Heure Récupération'])): ?>
                <div class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-skyblue/10 text-skyblue">
                    <svg class="w-3 h-3 mr-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <?php echo htmlspecialchars($note['Event - Heure Récupération']); ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="flex flex-wrap gap-1">
            <?php 
            $staff = isset($note['Staff Récupération']) && is_array($note['Staff Récupération'])
                ? $note['Staff Récupération']
                : [$note['Staff Récupération'] ?? '-'];
            
            foreach ($staff as $member): ?>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-skyblue/10 text-skyblue">
                    <?php echo htmlspecialchars($member); ?>
                </span>
            <?php endforeach; ?>
        </div>
    </div>
</div>