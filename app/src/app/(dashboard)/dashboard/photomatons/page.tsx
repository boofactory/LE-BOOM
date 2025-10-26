'use client';

import PhotomatonCard from '@/components/PhotomatonCard';
import { useEffect, useState } from 'react';

export default function PhotomatonsPage() {
  const [photomatons, setPhotomatons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotomatons = async () => {
    try {
      const response = await fetch('/api/photomatons');
      const data = await response.json();
      setPhotomatons(data.photomatons || []);
    } catch (error) {
      console.error('Error fetching photomatons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotomatons();

    // Auto-refresh toutes les 10 secondes
    const interval = setInterval(fetchPhotomatons, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = () => {
    // Rafraîchir après une action
    setTimeout(fetchPhotomatons, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-dark">Gestion des Photomatons</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Mise à jour automatique</span>
        </div>
      </div>

      {photomatons.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Aucun photomaton configuré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photomatons.map((photomaton) => (
            <PhotomatonCard
              key={photomaton.id}
              photomaton={photomaton}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
