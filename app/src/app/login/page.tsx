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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral to-skyblue">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">LE BOOM</h1>
          <p className="text-gray-600">Connexion à l'application</p>
        </div>

        {/* SSO Button */}
        {infomaniakEnabled && (
          <button
            onClick={handleInfomaniakLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-brand-coral hover:bg-brand-coral/5 active:scale-95 text-brand-dark rounded-xl transition-all duration-200 font-semibold shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#D56852" stroke="#D56852" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#D56852" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#D56852" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Se connecter avec Infomaniak
          </button>
        )}

        {/* Separator */}
        {infomaniakEnabled && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-600">Ou continuer avec</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="boo-team"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          BooFactory © 2025
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral to-skyblue">
        <div className="card max-w-md w-full text-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
