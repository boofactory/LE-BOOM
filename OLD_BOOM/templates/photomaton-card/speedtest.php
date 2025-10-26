<?php
$speedtestData = $photomatonModel->getSpeedtestData($photomaton['id']);
if (!empty($speedtestData)):
    $lastSpeedtest = end($speedtestData);
?>
<div class="pt-4 border-t border-gray-100">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Monitoring réseau</h3>
        <button onclick="openModal('speedtest-modal-<?php echo $photomaton['id']; ?>')" 
                class="text-sm text-coral hover:text-coral-light transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18"/>
                <path d="M3 6h18"/>
                <path d="M3 18h18"/>
            </svg>
            Historique
        </button>
    </div>

    <!-- Valeurs actuelles -->
    <div class="grid grid-cols-3 gap-2">
        <div class="bg-gray-50 rounded-lg p-2 text-center">
            <div class="text-sm text-gray-600">Download</div>
            <div class="font-semibold text-emerald-600"><?php echo round($lastSpeedtest['download_speed'], 1); ?> Mbps</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 text-center">
            <div class="text-sm text-gray-600">Upload</div>
            <div class="font-semibold text-sky-600"><?php echo round($lastSpeedtest['upload_speed'], 1); ?> Mbps</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 text-center">
            <div class="text-sm text-gray-600">Ping</div>
            <div class="font-semibold text-gray-900"><?php echo round($lastSpeedtest['ping']); ?> ms</div>
        </div>
    </div>

    <div class="mt-2 text-right text-xs text-gray-500">
        Dernière mesure : <?php echo (new DateTime($lastSpeedtest['created_at']))->format('d.m.Y H:i'); ?>
    </div>
</div>
<?php endif; ?>