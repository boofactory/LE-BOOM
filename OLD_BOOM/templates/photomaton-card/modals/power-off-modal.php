<?php
// Contenu déplacé depuis l'ancien fichier modals.php
?>
<div id="power-off-modal-<?php echo $photomaton['id']; ?>" class="modal" onclick="closePowerOffModal('<?php echo $photomaton['id']; ?>')">
    <div class="modal-content m-4 sm:m-auto max-w-lg w-full bg-white rounded-xl shadow-xl p-6" onclick="event.stopPropagation()">
        <div class="flex justify-between items-start mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Confirmer l'extinction</h3>
            <button onclick="closePowerOffModal('<?php echo $photomaton['id']; ?>')" class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <div class="mb-6">
            <div class="flex items-center gap-3 text-rose-600 mb-4">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p class="font-medium">Êtes-vous sûr de vouloir éteindre ce photomaton ?</p>
            </div>
            <p class="text-gray-600">Cette action mettra fin à toutes les opérations en cours. Assurez-vous qu'aucune session n'est active avant de continuer.</p>
        </div>

        <div class="flex justify-end gap-3">
            <button onclick="closePowerOffModal('<?php echo $photomaton['id']; ?>')" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Annuler
            </button>
            <button onclick="confirmPowerOff('<?php echo $photomaton['id']; ?>')" 
                    class="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600">
                Éteindre
            </button>
        </div>
    </div>
</div>