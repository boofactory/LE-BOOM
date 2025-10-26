'use client';

import { useEffect, useState } from 'react';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/global');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-dark mb-6">Statistiques Globales</h2>

      {/* Total events */}
      <div className="card mb-6 text-center">
        <p className="text-6xl font-bold text-coral mb-2">{stats.totalEvents}</p>
        <p className="text-gray-600">Événements au total</p>
      </div>

      {/* Moyennes */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">Moyennes par événement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-4xl font-bold text-dark mb-2">
              {stats.averages.sessionsPerEvent}
            </p>
            <p className="text-gray-600">Sessions</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-coral mb-2">
              {stats.averages.printsPerEvent}
            </p>
            <p className="text-gray-600">Impressions</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-skyblue mb-2">
              {stats.averages.digitalPerEvent}
            </p>
            <p className="text-gray-600">Photos digitales</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-purple-500 mb-2">
              {stats.averages.gifsPerEvent}
            </p>
            <p className="text-gray-600">GIFs</p>
          </div>
        </div>
      </div>

      {/* Records */}
      <div>
        <h3 className="text-xl font-bold text-dark mb-4">Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Plus de sessions</p>
            <p className="text-3xl font-bold text-dark mb-1">{stats.records.maxSessions.value}</p>
            <p className="text-sm text-gray-500">{stats.records.maxSessions.eventName}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Plus d'impressions</p>
            <p className="text-3xl font-bold text-coral mb-1">{stats.records.maxPrints.value}</p>
            <p className="text-sm text-gray-500">{stats.records.maxPrints.eventName}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Plus de photos digitales</p>
            <p className="text-3xl font-bold text-skyblue mb-1">{stats.records.maxDigital.value}</p>
            <p className="text-sm text-gray-500">{stats.records.maxDigital.eventName}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Plus de GIFs</p>
            <p className="text-3xl font-bold text-purple-500 mb-1">{stats.records.maxGifs.value}</p>
            <p className="text-sm text-gray-500">{stats.records.maxGifs.eventName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
