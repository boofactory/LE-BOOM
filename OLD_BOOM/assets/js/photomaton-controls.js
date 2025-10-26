// Fonctions de contrôle des modals
function openThresholdModal(id) {
    const modal = document.getElementById(`threshold-modal-${id}`);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeThresholdModal(id) {
    const modal = document.getElementById(`threshold-modal-${id}`);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openPowerOffModal(id) {
    const modal = document.getElementById(`power-off-modal-${id}`);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePowerOffModal(id) {
    const modal = document.getElementById(`power-off-modal-${id}`);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Fonctions de contrôle des actions
async function triggerAction(photomatonId, action) {
    try {
        if (action === 'power_off') {
            openPowerOffModal(photomatonId);
            return;
        }

        const formData = new FormData();
        formData.append('photomaton_id', photomatonId);
        formData.append('action', action);

        const response = await fetch('webhook.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'exécution de l\'action');
    }
}

async function confirmPowerOff(photomatonId) {
    try {
        const formData = new FormData();
        formData.append('photomaton_id', photomatonId);
        formData.append('action', 'power_off');

        const response = await fetch('webhook.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        closePowerOffModal(photomatonId);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'extinction');
    }
}

// Gestionnaire d'événements pour la touche Echap
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeThresholdModal = document.querySelector('[id^="threshold-modal-"].active');
        const activePowerOffModal = document.querySelector('[id^="power-off-modal-"].active');
        
        if (activeThresholdModal) {
            const id = activeThresholdModal.id.replace('threshold-modal-', '');
            closeThresholdModal(id);
        }
        
        if (activePowerOffModal) {
            const id = activePowerOffModal.id.replace('power-off-modal-', '');
            closePowerOffModal(id);
        }
    }
});