<?php
$photos = $photomatonModel->getPhotosHistory($photomaton['current_event_id']);
?>
<div id="photos-history-modal-<?php echo $photomaton['id']; ?>" class="modal" onclick="closeModal(event, 'photos-history-modal-<?php echo $photomaton['id']; ?>')">
    <div class="modal-content m-4 sm:m-auto max-w-2xl w-full bg-white rounded-xl shadow-xl p-6" onclick="event.stopPropagation()">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">Historique des photos</h3>
                <p class="text-sm text-gray-600 mt-1">
                    <?php echo count($photos); ?> photos au total
                </p>
            </div>
            <button onclick="closeModal(event, 'photos-history-modal-<?php echo $photomaton['id']; ?>')" class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <?php if (empty($photos)): ?>
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <svg class="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune photo</h3>
                <p class="text-gray-600">Aucun historique de photos n'est disponible pour cet événement.</p>
            </div>
        <?php else: ?>
            <div class="overflow-y-auto max-h-[400px]">
                <table class="w-full">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50 text-left">
                            <th class="px-4 py-2 text-sm font-semibold text-gray-900">Date et heure</th>
                            <th class="px-4 py-2 text-sm font-semibold text-gray-900">Type</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <?php foreach ($photos as $photo): ?>
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-2 text-sm text-gray-600">
                                    <?php echo (new DateTime($photo['created_at']))->format('d.m.Y H:i:s'); ?>
                                </td>
                                <td class="px-4 py-2">
                                    <?php
                                    $typeClass = match(strtolower($photo['type'])) {
                                        'numerique' => 'text-emerald-600',
                                        'imprimee' => 'text-sky-600',
                                        'gif' => 'text-purple-600',
                                        default => 'text-gray-600'
                                    };
                                    ?>
                                    <span class="text-sm font-medium <?php echo $typeClass; ?>">
                                        <?php echo ucfirst($photo['type']); ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>