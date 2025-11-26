'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infomaniakEnabled, setInfomaniakEnabled] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Charger le statut Infomaniak au chargement
  useEffect(() => {
    fetch('/api/auth/infomaniak/status')
      .then(res => res.json())
      .then(data => {
        if (data.enabled) {
          setInfomaniakEnabled(true);
        }
      })
      .catch(err => console.error('Failed to load Infomaniak status:', err));
  }, []);

  const handleInfomaniakLogin = async () => {
    setLoading(true);
    await signIn('infomaniak', { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      console.log('[LOGIN] SignIn result:', result);

      if (result?.error) {
        console.error('[LOGIN] Authentication failed:', result.error);
        setError('Identifiants invalides');
        setLoading(false);
      } else if (result?.ok) {
        console.log('[LOGIN] Authentication successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('[LOGIN] Exception during sign in:', err);
      setError('Une erreur est survenue: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-coral to-brand-green">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">LE BOOM</h1>
          <p className="text-neutral-600">Connexion à l'application</p>
        </div>

        {/* PRIMARY: Infomaniak SSO Button */}
        {infomaniakEnabled && (
          <button
            onClick={handleInfomaniakLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-brand-coral hover:bg-brand-coral/5 active:scale-95 text-brand-dark rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg mb-8"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#D56852" stroke="#D56852" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#D56852" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#D56852" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Se connecter avec Infomaniak
          </button>
        )}

        {/* DISCREET: Admin Login Toggle */}
        {!showAdminLogin && (
          <div className="text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-sm text-neutral-500 hover:text-brand-coral transition-colors underline"
            >
              Connexion administrateur
            </button>
          </div>
        )}

        {/* Credentials Form - Hidden by Default */}
        {showAdminLogin && (
          <div className="mt-6 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-neutral-600">Connexion locale</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-status-error-light border border-status-error rounded-lg text-status-error text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="admin"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="w-full text-sm text-neutral-500 hover:text-brand-coral transition-colors"
              >
                Retour
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
          BooFactory © 2025
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-coral to-brand-green">
        <div className="card max-w-md w-full text-center">
          <div className="text-neutral-500">Chargement...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
