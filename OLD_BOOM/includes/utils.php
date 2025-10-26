<?php
function formatDateTime($dateString) {
    if (!$dateString) return '-';
    $date = new DateTime($dateString);
    return $date->format('d.m.Y H:i');
}

function getProgressBarColor($remaining, $warningThreshold, $criticalThreshold) {
    if ($remaining <= $criticalThreshold) {
        return 'bg-red-500';
    } elseif ($remaining <= $warningThreshold) {
        return 'bg-yellow-500';
    }
    return 'bg-coral';
}

function getWarningMessage($remaining, $warningThreshold, $criticalThreshold) {
    if ($remaining <= $criticalThreshold) {
        return [
            'type' => 'error',
            'message' => 'Niveau critique ! Le papier doit être changé rapidement.',
            'icon' => '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
        ];
    } elseif ($remaining <= $warningThreshold) {
        return [
            'type' => 'warning',
            'message' => 'Le niveau de papier est bas, prévoyez un changement.',
            'icon' => '<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        ];
    }
    return null;
}