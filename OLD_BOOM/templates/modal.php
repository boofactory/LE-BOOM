<div id="modal-<?php echo $note['id']; ?>" class="modal" onclick="closeModal(event, 'modal-<?php echo $note['id']; ?>')">
    <div class="modal-content m-auto max-w-3xl w-full bg-white rounded-xl shadow-xl overflow-hidden" onclick="event.stopPropagation()">
        <!-- En-tête -->
        <div class="bg-gradient-to-r from-coral to-coral-light p-6 text-white">
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-2xl font-bold">
                        <?php echo htmlspecialchars($note['Client'] ?? 'Sans titre'); ?>
                    </h2>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="flex items-center text-sm">
                            <svg class="w-4 h-4 mr-1 opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <?php echo htmlspecialchars(formatDate($note['Date évènement'] ?? '')); ?>
                        </span>
                        <span class="text-sm opacity-80">
                            <?php echo htmlspecialchars($note['Type d\'évenement'] ?? ''); ?>
                        </span>
                    </div>
                </div>
                <button onclick="closeModal(event, 'modal-<?php echo $note['id']; ?>')" class="text-white/80 hover:text-white">
                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Contenu -->
        <div class="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <!-- Warning -->
            <?php if (!empty($note['Info importante'])): ?>
                <div class="warning-banner">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p><?php echo nl2br(htmlspecialchars($note['Info importante'])); ?></p>
                </div>
            <?php endif; ?>

            <!-- Informations principales -->
            <div class="grid md:grid-cols-2 gap-6">
                <!-- Colonne gauche -->
                <div class="space-y-6">
                    <!-- Lieu -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Lieu de l'événement
                        </h3>
                        <p class="text-gray-700 mb-3"><?php echo nl2br(htmlspecialchars($note['lieu de l\'évenement'] ?? '-')); ?></p>
                        <a href="<?php echo getGoogleMapsUrl($note['lieu de l\'évenement'] ?? ''); ?>" target="_blank" 
                           class="inline-flex items-center text-sm text-coral hover:text-coral-light">
                            <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                            </svg>
                            Ouvrir dans Google Maps
                        </a>
                    </div>

                    <!-- Prestations -->
                    <div class="space-y-3">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.29 7 12 12 20.71 7"/>
                                <line x1="12" y1="22" x2="12" y2="12"/>
                            </svg>
                            Prestations
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            <?php 
                            if (isset($note['Prestations']) && is_array($note['Prestations'])) {
                                foreach ($note['Prestations'] as $prestation): ?>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-coral/10 text-coral">
                                        <?php echo htmlspecialchars($prestation); ?>
                                    </span>
                                <?php endforeach;
                            } else {
                                echo '<span class="text-gray-500">-</span>';
                            }
                            ?>
                        </div>
                    </div>

                    <!-- Liste matériel -->
                    <?php if (!empty($note['Event - Liste matériel'])): ?>
                    <div class="space-y-3">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/>
                                <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/>
                                <line x1="4" y1="12" x2="20" y2="12"/>
                            </svg>
                            Liste matériel
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-gray-700 whitespace-pre-line"><?php echo nl2br(htmlspecialchars($note['Event - Liste matériel'])); ?></p>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- WiFi -->
                    <?php if (!empty($note['Event -Wifi'])): ?>
                    <div class="space-y-3">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 13a10 10 0 0 1 14 0"/>
                                <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
                                <path d="M2 8.82a15 15 0 0 1 20 0"/>
                                <line x1="12" y1="20" x2="12.01" y2="20"/>
                            </svg>
                            Informations WiFi
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-gray-700 whitespace-pre-line"><?php echo nl2br(htmlspecialchars($note['Event -Wifi'])); ?></p>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Colonne droite -->
                <div class="space-y-6">
                    <!-- Contact sur place -->
                    <?php if (!empty($note['Event - Contact sur place']) || !empty($note['Event - Telephone contact'])): ?>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Contact sur place
                        </h3>
                        <?php if (!empty($note['Event - Contact sur place'])): ?>
                            <p class="text-gray-700 mb-2"><?php echo htmlspecialchars($note['Event - Contact sur place']); ?></p>
                        <?php endif; ?>
                        <?php if (!empty($note['Event - Telephone contact'])): ?>
                            <a href="tel:<?php echo htmlspecialchars($note['Event - Telephone contact']); ?>" 
                               class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-coral rounded-lg hover:bg-coral-light transition-colors">
                                <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <?php echo htmlspecialchars($note['Event - Telephone contact']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>

                    <!-- Informations client -->
                    <?php if (!empty($note['Nom']) || !empty($note['Prénom']) || !empty($note['Adresse de facturation']) || !empty($note['E-mail']) || !empty($note['Téléphone'])): ?>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Informations client
                        </h3>
                        <div class="space-y-3">
                            <?php if (!empty($note['Nom']) || !empty($note['Prénom'])): ?>
                                <p class="text-gray-700">
                                    <?php echo htmlspecialchars(trim(($note['Prénom'] ?? '') . ' ' . ($note['Nom'] ?? ''))); ?>
                                </p>
                            <?php endif; ?>

                            <?php if (!empty($note['Adresse de facturation'])): ?>
                                <p class="text-gray-700"><?php echo nl2br(htmlspecialchars($note['Adresse de facturation'])); ?></p>
                            <?php endif; ?>

                            <?php if (!empty($note['E-mail'])): ?>
                                <a href="mailto:<?php echo htmlspecialchars($note['E-mail']); ?>" 
                                   class="inline-flex items-center text-sm text-coral hover:text-coral-light">
                                    <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <?php echo htmlspecialchars($note['E-mail']); ?>
                                </a>
                            <?php endif; ?>

                            <?php if (!empty($note['Téléphone'])): ?>
                                <div>
                                    <a href="tel:<?php echo htmlspecialchars($note['Téléphone']); ?>" 
                                       class="inline-flex items-center text-sm text-coral hover:text-coral-light">
                                        <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        <?php echo htmlspecialchars($note['Téléphone']); ?>
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Infos Complémentaires -->
                    <?php if (!empty($note['Info installation'])): ?>
                    <div class="space-y-3">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            Informations Installation
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-gray-700 whitespace-pre-line"><?php echo nl2br(htmlspecialchars($note['Info installation'])); ?></p>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Staff et horaires -->
            <div class="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <!-- Installation -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-coral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                                <path d="M9 18h6"/>
                                <path d="M10 22h4"/>
                            </svg>
                            Installation
                        </h3>
                        <?php if (!empty($note['Event - Heure installation'])): ?>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-coral/10 text-coral">
                                <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <?php echo htmlspecialchars($note['Event - Heure installation']); ?>
                            </span>
                        <?php endif; ?>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <?php 
                        $staff = isset($note['Staff Installation']) && is_array($note['Staff Installation']) 
                            ? $note['Staff Installation'] 
                            : [$note['Staff Installation'] ?? '-'];
                        
                        foreach ($staff as $member): ?>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-coral/10 text-coral">
                                <?php echo htmlspecialchars($member); ?>
                            </span>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Récupération -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-skyblue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                            </svg>
                            Récupération
                        </h3>
                        <?php if (!empty($note['Event - Heure Récupération'])): ?>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-skyblue/10 text-skyblue">
                                <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <?php echo htmlspecialchars($note['Event - Heure Récupération']); ?>
                            </span>
                        <?php endif; ?>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <?php 
                        $staff = isset($note['Staff Récupération']) && is_array($note['Staff Récupération'])
                            ? $note['Staff Récupération']
                            : [$note['Staff Récupération'] ?? '-'];
                        
                        foreach ($staff as $member): ?>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-skyblue/10 text-skyblue">
                                <?php echo htmlspecialchars($member); ?>
                            </span>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>