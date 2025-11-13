'use client';

interface BottomNavigationProps {
  activeView: 'timeline' | 'history';
  onViewChange: (view: 'timeline' | 'history') => void;
}

export default function BottomNavigation({ activeView, onViewChange }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'timeline' as const,
      label: 'Agenda',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      id: 'history' as const,
      label: 'Historique',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-fixed safe-area-bottom">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                activeView === tab.id
                  ? 'text-brand-coral'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <div className={`transition-all duration-200 ${
                activeView === tab.id ? 'scale-110' : 'scale-100'
              }`}>
                {tab.icon}
              </div>
              <span className={`text-xs font-semibold ${
                activeView === tab.id ? 'text-brand-coral' : 'text-neutral-600'
              }`}>
                {tab.label}
              </span>

              {/* Active indicator */}
              {activeView === tab.id && (
                <div className="absolute bottom-0 w-12 h-1 bg-brand-coral rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
