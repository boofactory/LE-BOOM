<div class="grid grid-cols-2 gap-4">
    <div class="space-y-3">
        <div class="space-y-2">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Numériques</span>
                <span class="font-medium text-coral"><?php echo $photomaton['total_numerique'] ?? 0; ?></span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Imprimées</span>
                <span class="font-medium text-coral"><?php echo $photomaton['total_imprimee'] ?? 0; ?></span>
            </div>
        </div>
    </div>
    <div class="space-y-3">
        <div class="space-y-2">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">GIF</span>
                <span class="font-medium text-coral"><?php echo $photomaton['total_gifs'] ?? 0; ?></span>
            </div>
            <div class="flex justify-between items-center font-medium">
                <span class="text-sm text-gray-800">Total</span>
                <span class="text-coral">
                    <?php 
                        $total = ($photomaton['total_numerique'] ?? 0) + 
                                ($photomaton['total_imprimee'] ?? 0) + 
                                ($photomaton['total_gifs'] ?? 0);
                        echo $total;
                    ?>
                </span>
            </div>
        </div>
    </div>
</div>

<?php if ($photomaton['current_event_id']): ?>
<div class="mt-2 flex justify-end">
    <button onclick="openModal('photos-history-modal-<?php echo $photomaton['id']; ?>')" 
            class="text-sm text-coral hover:text-coral-light transition-colors flex items-center gap-1">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18"/>
            <path d="M3 6h18"/>
            <path d="M3 18h18"/>
        </svg>
        Historique
    </button>
</div>
<?php endif; ?>