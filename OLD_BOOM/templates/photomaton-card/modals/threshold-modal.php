<?php
// Contenu déplacé depuis l'ancien fichier modals.php
?>
<div id="threshold-modal-<?php echo $photomaton['id']; ?>" class="modal" onclick="closeThresholdModal('<?php echo $photomaton['id']; ?>')">
    <div class="modal-content m-4 sm:m-auto max-w-lg w-full bg-white rounded-xl shadow-xl p-6" onclick="event.stopPropagation()">
        <div class="flex justify-between items-start mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Configuration des seuils</h3>
            <button onclick="closeThresholdModal('<?php echo $photomaton['id']; ?>')" class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="update_thresholds">
            <input type="hidden" name="photomaton_id" value="<?php echo $photomaton['id']; ?>">
            
            <div>
                <label for="warning_threshold" class="block text-sm font-medium text-gray-700 mb-1">
                    Seuil d'avertissement
                </label>
                <input type="number" id="warning_threshold" name="warning_threshold" 
                       value="<?php echo $warningThreshold; ?>" 
                       class="block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm"
                       min="0" max="700">
                <p class="mt-1 text-sm text-gray-500">Affiche un avertissement quand le niveau est inférieur à cette valeur</p>
            </div>

            <div>
                <label for="critical_threshold" class="block text-sm font-medium text-gray-700 mb-1">
                    Seuil critique
                </label>
                <input type="number" id="critical_threshold" name="critical_threshold" 
                       value="<?php echo $criticalThreshold; ?>" 
                       class="block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm"
                       min="0" max="700">
                <p class="mt-1 text-sm text-gray-500">Affiche une alerte critique quand le niveau est inférieur à cette valeur</p>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick="closeThresholdModal('<?php echo $photomaton['id']; ?>')" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Annuler
                </button>
                <button type="submit" 
                        class="px-4 py-2 text-sm font-medium text-white bg-coral rounded-lg hover:bg-coral-light">
                    Enregistrer
                </button>
            </div>
        </form>
    </div>
</div>