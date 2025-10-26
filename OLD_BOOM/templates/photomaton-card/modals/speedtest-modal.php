<?php if (!empty($speedtestData)): ?>
<div id="speedtest-modal-<?php echo $photomaton['id']; ?>" class="modal" onclick="closeModal(event, 'speedtest-modal-<?php echo $photomaton['id']; ?>')">
    <div class="modal-content m-4 sm:m-auto max-w-2xl w-full bg-white rounded-xl shadow-xl p-6" onclick="event.stopPropagation()">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">Historique des mesures réseau</h3>
                <p class="text-sm text-gray-600 mt-1">24 dernières heures</p>
            </div>
            <button onclick="closeModal(event, 'speedtest-modal-<?php echo $photomaton['id']; ?>')" class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50 text-left">
                        <th class="px-4 py-2 text-sm font-semibold text-gray-900">Date et heure</th>
                        <th class="px-4 py-2 text-sm font-semibold text-gray-900">Download</th>
                        <th class="px-4 py-2 text-sm font-semibold text-gray-900">Upload</th>
                        <th class="px-4 py-2 text-sm font-semibold text-gray-900">Ping</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <?php foreach (array_reverse($speedtestData) as $test): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 text-sm text-gray-600">
                                <?php echo (new DateTime($test['created_at']))->format('d.m.Y H:i'); ?>
                            </td>
                            <td class="px-4 py-2">
                                <span class="text-sm font-medium text-emerald-600">
                                    <?php echo round($test['download_speed'], 1); ?> Mbps
                                </span>
                            </td>
                            <td class="px-4 py-2">
                                <span class="text-sm font-medium text-sky-600">
                                    <?php echo round($test['upload_speed'], 1); ?> Mbps
                                </span>
                            </td>
                            <td class="px-4 py-2">
                                <span class="text-sm font-medium text-gray-900">
                                    <?php echo round($test['ping']); ?> ms
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<?php endif; ?>