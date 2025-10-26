<?php if ($isRouterConnected): ?>
    <?php if (!$isPcConnected): ?>
        <button onclick="triggerAction('<?php echo $photomaton['id']; ?>', 'power_on')" 
                class="w-full btn bg-emerald-500 hover:bg-emerald-600 text-white py-3">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
            Allumer le PC
        </button>
    <?php else: ?>
        <div class="grid grid-cols-2 gap-2">
            <button onclick="triggerAction('<?php echo $photomaton['id']; ?>', 'power_off')" 
                    class="btn bg-rose-500 hover:bg-rose-600 text-white">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                </svg>
                Éteindre le PC
            </button>
            <button onclick="triggerAction('<?php echo $photomaton['id']; ?>', 'print')" 
                    class="btn bg-indigo-500 hover:bg-indigo-600 text-white">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Imprimer
            </button>
            <button onclick="triggerAction('<?php echo $photomaton['id']; ?>', 'lock')" 
                    class="btn bg-amber-500 hover:bg-amber-600 text-white">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Verrouiller
            </button>
            <button onclick="triggerAction('<?php echo $photomaton['id']; ?>', 'unlock')" 
                    class="btn bg-sky-500 hover:bg-sky-600 text-white">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
                Déverrouiller
            </button>
        </div>
    <?php endif; ?>
<?php else: ?>
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
<?php endif; ?>