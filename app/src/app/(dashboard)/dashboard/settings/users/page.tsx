'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string | null;
  username: string | null;
  infomaniakId: string | null;
  role: 'ADMIN' | 'INSTALLER' | 'VIEWER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch users
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, updates: { role?: string; active?: boolean }) => {
    setUpdatingUserId(userId);
    setError('');

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, ...data.user } : u));
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateUser(userId, { role: newRole });
  };

  const handleActiveToggle = (userId: number, currentActive: boolean) => {
    updateUser(userId, { active: !currentActive });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserType = (user: User) => {
    if (user.infomaniakId) return 'Infomaniak';
    if (user.username) return 'Local';
    return 'Unknown';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    );
  }

  if ((session?.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-brand-coral hover:text-brand-coral-dark transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux paramètres
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Gestion des utilisateurs</h1>
        <p className="text-neutral-600">
          Gérez les accès et les rôles des utilisateurs de l'application
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-status-error-light border border-status-error rounded-lg text-status-error text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Créé le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    {/* Email */}
                    <td className="px-4 py-4 text-sm text-neutral-900">
                      {user.email || user.username || '-'}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4 text-sm text-neutral-900">
                      {user.name || '-'}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getUserType(user) === 'Infomaniak'
                            ? 'bg-brand-coral-light text-brand-coral'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {getUserType(user)}
                      </span>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-4 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUserId === user.id}
                        className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-coral focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="INSTALLER">Installateur</option>
                        <option value="VIEWER">Observateur</option>
                      </select>
                    </td>

                    {/* Active Toggle */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleActiveToggle(user.id, user.active)}
                        disabled={updatingUserId === user.id}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.active
                            ? 'bg-status-success-light text-status-success hover:bg-status-success-light/80'
                            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                        }`}
                      >
                        {updatingUserId === user.id ? (
                          'Mise à jour...'
                        ) : user.active ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Actif
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Inactif
                          </>
                        )}
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-neutral-600 mb-1">Total utilisateurs</div>
          <div className="text-2xl font-bold text-brand-dark">{users.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-600 mb-1">Utilisateurs actifs</div>
          <div className="text-2xl font-bold text-status-success">
            {users.filter(u => u.active).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-600 mb-1">En attente d'activation</div>
          <div className="text-2xl font-bold text-status-warning">
            {users.filter(u => !u.active).length}
          </div>
        </div>
      </div>
    </div>
  );
}
