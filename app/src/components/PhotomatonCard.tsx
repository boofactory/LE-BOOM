'use client';

import { PhotomatonWithRelations } from '@/types';
import { useState } from 'react';

interface PhotomatonCardProps {
  photomaton: PhotomatonWithRelations;
  onAction?: (action: string) => void;
}

export default function PhotomatonCard({ photomaton, onAction }: PhotomatonCardProps) {
  const [loading, setLoading] = useState(false);

  const paperPercentage = Math.round((photomaton.remainingPrints / 700) * 100);
  const isCritical = photomaton.remainingPrints <= photomaton.criticalThreshold;
  const isWarning = photomaton.remainingPrints <= photomaton.warningThreshold && !isCritical;

  const progressColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-coral';

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/webhooks/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photomatonId: photomaton.id,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      onAction?.(action);
    } catch (error) {
      console.error('Action error:', error);
      alert('Erreur lors de l\'exécution de l\'action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-dark">{photomaton.name}</h3>
          <p className="text-sm text-gray-500">{photomaton.hostname}</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              photomaton.routerConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {photomaton.routerConnected ? 'Router OK' : 'Router offline'}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              photomaton.pcConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {photomaton.pcConnected ? 'PC ON' : 'PC OFF'}
          </span>
        </div>
      </div>

      {/* Niveau papier */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Papier restant</span>
          <span className="text-sm font-bold">{photomaton.remainingPrints} / 700</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`${progressColor} h-4 rounded-full transition-all duration-300`}
            style={{ width: `${paperPercentage}%` }}
          ></div>
        </div>
        {(isCritical || isWarning) && (
          <p className={`text-xs mt-1 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
            {isCritical ? '⚠️ Niveau critique!' : '⚠️ Papier bas'}
          </p>
        )}
      </div>

      {/* Event actuel */}
      {photomaton.currentEvent && (
        <div className="mb-4 p-3 bg-skyblue/10 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Événement en cours</p>
          <p className="font-semibold">{photomaton.currentEvent.clientName}</p>
          {photomaton.currentEvent.eventDate && (
            <p className="text-xs text-gray-500">
              {new Date(photomaton.currentEvent.eventDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      {photomaton.stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-coral">{photomaton.stats.totalPrints}</p>
            <p className="text-xs text-gray-600">Prints</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-skyblue">{photomaton.stats.totalDigital}</p>
            <p className="text-xs text-gray-600">Digital</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-purple-500">{photomaton.stats.totalGifs}</p>
            <p className="text-xs text-gray-600">GIFs</p>
          </div>
        </div>
      )}

      {/* Contrôles */}
      {!photomaton.routerConnected ? (
        <div className="text-center py-3 bg-red-50 rounded text-red-700 text-sm">
          Routeur déconnecté
        </div>
      ) : !photomaton.pcConnected ? (
        <button
          onClick={() => handleAction('power_on')}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Démarrage...' : '🔌 Allumer le PC'}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('power_off')}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            🔴 Éteindre
          </button>
          <button
            onClick={() => handleAction('lock')}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            🔒 Lock
          </button>
          <button
            onClick={() => handleAction('unlock')}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            🔓 Unlock
          </button>
          <button
            onClick={() => handleAction('print_test')}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            🖨️ Test Print
          </button>
        </div>
      )}
    </div>
  );
}
