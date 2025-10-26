'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Événements', icon: '📅' },
    { href: '/dashboard/photomatons', label: 'Photomatons', icon: '📸' },
    { href: '/dashboard/stats', label: 'Statistiques', icon: '📊' },
    { href: '/dashboard/history', label: 'Historique', icon: '🕐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark">LE BOOM</h1>
              <span className="text-sm text-gray-500">v2.0</span>
            </Link>

            <div className="flex items-center gap-4">
              {session?.user && (
                <>
                  <span className="text-sm text-gray-600">
                    👤 {session.user.name || session.user.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-coral hover:text-coral-light transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-coral text-coral'
                      : 'border-transparent text-gray-600 hover:text-dark hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          BooFactory © 2025 - LE BOOM v2
        </div>
      </footer>
    </div>
  );
}
