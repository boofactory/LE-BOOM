<div class="card-content">
    <?php if (!empty($note['Info importante'])): ?>
        <div class="warning-banner">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p class="truncate-3-lines">
                <?php echo htmlspecialchars($note['Info importante']); ?>
            </p>
        </div>
    <?php endif; ?>

    <div class="info-section">
        <?php include 'info-items.php'; ?>
    </div>

    <div class="staff-section">
        <?php include 'staff-items.php'; ?>
    </div>

    <div class="action-buttons">
        <button onclick="openModal('modal-<?php echo $note['id']; ?>')" class="btn btn-coral">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Détails
        </button>
        <a href="<?php echo getGoogleMapsUrl($note['lieu de l\'évenement'] ?? ''); ?>" target="_blank" class="btn btn-skyblue">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Itinéraire
        </a>
    </div>
</div>