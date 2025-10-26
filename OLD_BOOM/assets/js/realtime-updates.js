// Intervalle de mise à jour en millisecondes (5 secondes)
const UPDATE_INTERVAL = 5000;

function updatePhotomatonData() {
    fetch('api/get_photomaton_data.php')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                result.data.forEach(photomaton => {
                    updatePhotomatonCard(photomaton);
                });
            }
        })
        .catch(error => console.error('Erreur lors de la mise à jour:', error));
}

function updatePhotomatonCard(photomaton) {
    const card = document.querySelector(`[data-photomaton-id="${photomaton.id}"]`);
    if (!card) return;

    // Mise à jour du titre de l'événement
    const eventTitle = card.querySelector('.event-title');
    if (eventTitle) {
        eventTitle.textContent = photomaton.current_event || 'Aucun événement';
    }

    // Mise à jour du niveau de papier
    const remainingPrints = card.querySelector('.remaining-prints');
    if (remainingPrints) {
        remainingPrints.textContent = `${photomaton.remaining_prints} / 700`;
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${(photomaton.remaining_prints / 700) * 100}%`;
        }
    }

    // Mise à jour des statistiques
    const stats = {
        numerique: photomaton.total_numerique || 0,
        imprimee: photomaton.total_imprimee || 0,
        gifs: photomaton.total_gifs || 0
    };

    Object.entries(stats).forEach(([key, value]) => {
        const element = card.querySelector(`.stat-${key}`);
        if (element) {
            element.textContent = value;
        }
    });

    // Mise à jour du total
    const total = card.querySelector('.stat-total');
    if (total) {
        total.textContent = Object.values(stats).reduce((a, b) => a + b, 0);
    }

    // Mise à jour des états de connexion
    const routerConnected = Boolean(parseInt(photomaton.router_connected));
    const pcConnected = Boolean(parseInt(photomaton.pc_connected));
    
    // Mise à jour de l'indicateur de routeur
    const routerStatus = card.querySelector('.router-status');
    if (routerStatus) {
        if (!routerConnected) {
            routerStatus.style.display = 'flex';
        } else {
            routerStatus.style.display = 'none';
        }
    }
    
    // Affichage/masquage des contrôles selon l'état
    const controls = card.querySelector('.controls-section');
    if (controls) {
        if (!routerConnected) {
            controls.innerHTML = `
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <div class="flex items-center justify-center gap-2 text-gray-500 mb-2">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="1" y1="1" x2="23" y2="23"/>
                            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
                            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                            <line x1="12" y1="20" x2="12.01" y2="20"/>
                        </svg>
                        <span class="font-medium">Routeur déconnecté</span>
                    </div>
                    <p class="text-sm text-gray-600">Les contrôles ne sont pas disponibles lorsque le routeur est déconnecté.</p>
                </div>
            `;
        } else if (!pcConnected) {
            controls.innerHTML = `
                <button onclick="triggerAction('${photomaton.id}', 'power_on')" 
                        class="w-full btn bg-emerald-500 hover:bg-emerald-600 text-white py-3">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                        <line x1="12" y1="2" x2="12" y2="12"/>
                    </svg>
                    Allumer le PC
                </button>
            `;
        } else {
            controls.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="triggerAction('${photomaton.id}', 'power_off')" 
                            class="btn bg-rose-500 hover:bg-rose-600 text-white">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                            <line x1="12" y1="2" x2="12" y2="12"/>
                        </svg>
                        Éteindre le PC
                    </button>
                    <button onclick="triggerAction('${photomaton.id}', 'print')" 
                            class="btn bg-indigo-500 hover:bg-indigo-600 text-white">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"/>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect x="6" y="14" width="12" height="8"/>
                        </svg>
                        Imprimer
                    </button>
                    <button onclick="triggerAction('${photomaton.id}', 'lock')" 
                            class="btn bg-amber-500 hover:bg-amber-600 text-white">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Verrouiller
                    </button>
                    <button onclick="triggerAction('${photomaton.id}', 'unlock')" 
                            class="btn bg-sky-500 hover:bg-sky-600 text-white">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                        </svg>
                        Déverrouiller
                    </button>
                </div>
            `;
        }
    }

    // Mise à jour des données de speedtest
    const speedtestSection = card.querySelector('.speedtest-section');
    if (speedtestSection) {
        const downloadSpeed = speedtestSection.querySelector('.download-speed');
        const uploadSpeed = speedtestSection.querySelector('.upload-speed');
        const ping = speedtestSection.querySelector('.ping');
        const lastMeasure = speedtestSection.querySelector('.last-measure');

        if (downloadSpeed) downloadSpeed.textContent = `${Math.round(photomaton.download_speed * 10) / 10} Mbps`;
        if (uploadSpeed) uploadSpeed.textContent = `${Math.round(photomaton.upload_speed * 10) / 10} Mbps`;
        if (ping) ping.textContent = `${Math.round(photomaton.ping)} ms`;
        if (lastMeasure) lastMeasure.textContent = `Dernière mesure : ${new Date(photomaton.last_updated).toLocaleString()}`;
    }

    // Mise à jour de la dernière mise à jour
    const lastUpdate = card.querySelector('.last-update');
    if (lastUpdate) {
        lastUpdate.textContent = new Date(photomaton.last_updated).toLocaleString();
    }
}

// Démarrer les mises à jour automatiques
setInterval(updatePhotomatonData, UPDATE_INTERVAL);

// Première mise à jour immédiate
updatePhotomatonData();