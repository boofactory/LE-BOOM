'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; description: string; action?: string }> = {
  InvalidDomain: {
    title: 'Domaine email non autorisé',
    description: 'Seuls les emails @boofactory.ch sont autorisés à accéder à cette application. Veuillez utiliser votre adresse email professionnelle BooFactory.',
    action: 'Contactez votre administrateur si vous pensez qu\'il s\'agit d\'une erreur.',
  },
  AwaitingActivation: {
    title: 'Compte en attente d\'activation',
    description: 'Votre compte a été créé avec succès, mais il doit être activé par un administrateur avant que vous puissiez vous connecter.',
    action: 'Un administrateur vous contactera une fois votre compte activé.',
  },
  AccountNotActive: {
    title: 'Compte non activé',
    description: 'Votre compte existe mais n\'a pas encore été activé par un administrateur.',
    action: 'Contactez un administrateur pour activer votre compte.',
  },
  DatabaseError: {
    title: 'Erreur technique',
    description: 'Une erreur technique est survenue lors de la connexion. Veuillez réessayer dans quelques instants.',
    action: 'Si le problème persiste, contactez le support technique.',
  },
  Default: {
    title: 'Erreur d\'authentification',
    description: 'Une erreur est survenue lors de la connexion.',
    action: 'Veuillez réessayer ou contactez un administrateur.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'Default';
  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-coral to-brand-green p-4">
      <div className="card max-w-lg w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-status-error-light rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-status-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-brand-dark text-center mb-4">
          {errorInfo.title}
        </h1>

        {/* Error Description */}
        <p className="text-neutral-600 text-center mb-4">
          {errorInfo.description}
        </p>

        {/* Action Message */}
        {errorInfo.action && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-700 text-center">
              <span className="font-medium">Note:</span> {errorInfo.action}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="btn-primary w-full block text-center"
          >
            Retour à la connexion
          </Link>

          {/* Show admin contact only for activation-related errors */}
          {(errorCode === 'AwaitingActivation' || errorCode === 'AccountNotActive') && (
            <a
              href="mailto:admin@boofactory.ch"
              className="block text-center text-sm text-brand-coral hover:text-brand-coral-dark transition-colors"
            >
              Contacter l'administrateur
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
          BooFactory © 2025
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-coral to-brand-green">
        <div className="card max-w-lg w-full text-center">
          <div className="text-neutral-500">Chargement...</div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
