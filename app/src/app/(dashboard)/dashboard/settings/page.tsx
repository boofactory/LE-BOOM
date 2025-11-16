'use client';

import { useState, useEffect } from 'react';

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  encrypted: boolean;
  updatedAt: string;
}

const SETTING_KEYS = [
  {
    key: 'NOTION_API_TOKEN',
    description: 'Token API Notion pour synchroniser les événements',
    encrypted: true,
  },
  {
    key: 'NOTION_DATABASE_ID',
    description: 'ID de la base de données Notion',
    encrypted: false,
  },
  {
    key: 'INFOMANIAK_CLIENT_ID',
    description: 'Client ID de l\'application OAuth2 Infomaniak',
    encrypted: false,
  },
  {
    key: 'INFOMANIAK_CLIENT_SECRET',
    description: 'Client Secret de l\'application OAuth2 Infomaniak',
    encrypted: true,
  },
  {
    key: 'INFOMANIAK_ENABLED',
    description: 'Activer l\'authentification SSO Infomaniak (true/false)',
    encrypted: false,
  },
  {
    key: 'ADMIN_PASSWORD',
    description: 'Mot de passe administrateur (sera hashé automatiquement)',
    encrypted: true,
  },
];

interface NotionDatabase {
  id: string;
  title: string;
  description: string;
  url: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [notionDatabases, setNotionDatabases] = useState<NotionDatabase[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        // Initialiser editValues avec les valeurs actuelles
        const values: Record<string, string> = {};
        data.settings.forEach((s: Setting) => {
          values[s.key] = s.encrypted ? '' : s.value;
        });
        setEditValues(values);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotionDatabases = async () => {
    setLoadingDatabases(true);
    try {
      const response = await fetch('/api/notion/databases');
      const data = await response.json();

      if (data.databases) {
        setNotionDatabases(data.databases);
        setMessage({ type: 'success', text: `${data.databases.length} base(s) de données trouvée(s)` });
      } else if (data.error) {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      console.error('Error loading Notion databases:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des databases Notion' });
    } finally {
      setLoadingDatabases(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const settingDef = SETTING_KEYS.find((s) => s.key === key);
      const value = editValues[key];

      if (!value && settingDef?.encrypted) {
        setMessage({ type: 'error', text: 'Veuillez entrer une valeur' });
        setSaving(false);
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value,
          description: settingDef?.description,
          encrypted: settingDef?.encrypted,
        }),
      });

      const data = await response.json();

      // Vérifier si c'est une erreur ou un succès
      if (data.error) {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      } else if (data.setting) {
        setMessage({ type: 'success', text: 'Configuration enregistrée avec succès!' });
        await loadSettings();

        // Réinitialiser le champ si c'est encrypted
        if (settingDef?.encrypted) {
          setEditValues(prev => ({ ...prev, [key]: '' }));
        }
      } else {
        setMessage({ type: 'error', text: 'Réponse inattendue du serveur' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Paramètres</h1>
        <p className="text-gray-600">
          Configurez les tokens API et les paramètres de l'application
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-dark mb-6">Configuration API</h2>

        <div className="space-y-6">
          {SETTING_KEYS.map((settingDef) => {
            const existing = settings.find((s) => s.key === settingDef.key);
            const hasValue = existing && existing.value !== '';

            return (
              <div key={settingDef.key} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {settingDef.key}
                      {settingDef.encrypted && (
                        <span className="ml-2 text-xs text-gray-500">(chiffré)</span>
                      )}
                    </label>
                    {settingDef.description && (
                      <p className="text-sm text-gray-500">{settingDef.description}</p>
                    )}
                  </div>
                  {hasValue && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Configuré
                    </span>
                  )}
                </div>

                {/* Sélecteur spécial pour NOTION_DATABASE_ID */}
                {settingDef.key === 'NOTION_DATABASE_ID' ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={loadNotionDatabases}
                        disabled={loadingDatabases}
                        className="btn-secondary"
                      >
                        {loadingDatabases ? 'Chargement...' : '🔍 Charger les databases Notion'}
                      </button>
                    </div>

                    {notionDatabases.length > 0 && (
                      <div className="flex gap-3">
                        <select
                          value={editValues[settingDef.key] || ''}
                          onChange={(e) => handleChange(settingDef.key, e.target.value)}
                          className="input-field flex-1"
                        >
                          <option value="">-- Sélectionnez une database --</option>
                          {notionDatabases.map((db) => (
                            <option key={db.id} value={db.id}>
                              {db.title} {db.description ? `(${db.description})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSave(settingDef.key)}
                          disabled={saving || !editValues[settingDef.key]}
                          className="btn-primary px-6"
                        >
                          {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Input classique pour les autres settings */
                  <div className="flex gap-3">
                    <input
                      type={settingDef.encrypted ? 'password' : 'text'}
                      value={editValues[settingDef.key] || ''}
                      onChange={(e) => handleChange(settingDef.key, e.target.value)}
                      placeholder={
                        settingDef.encrypted
                          ? hasValue
                            ? 'Laisser vide pour ne pas modifier'
                            : 'Entrez la valeur'
                          : 'Entrez la valeur'
                      }
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => handleSave(settingDef.key)}
                      disabled={saving}
                      className="btn-primary px-6"
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {existing && existing.updatedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Dernière modification: {new Date(existing.updatedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-bold text-dark mb-4">Informations</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • Les valeurs chiffrées (tokens API, mots de passe) sont stockées de manière sécurisée
            dans la base de données
          </p>
          <p>
            • Pour Notion, vous pouvez obtenir un token API sur{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              notion.so/my-integrations
            </a>
          </p>
          <p>
            • Pour Infomaniak OAuth, créez une application sur{' '}
            <a
              href="https://manager.infomaniak.com/v3/ng/products/cloud/ik-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Infomaniak Manager
            </a>
            {' '}avec l'URL de redirection: <code className="bg-gray-100 px-1 rounded">https://boom-new.boofactory.ch/api/auth/callback/infomaniak</code>
          </p>
          <p>
            • Le mot de passe administrateur sera automatiquement hashé avec bcrypt lors de la
            sauvegarde
          </p>
        </div>
      </div>
    </div>
  );
}
