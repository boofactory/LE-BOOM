'use client';

import { useState, ReactNode } from 'react';

interface DateSectionProps {
  title: string;
  emoji?: string;
  count: number;
  children: ReactNode;
  defaultExpanded?: boolean;
  color?: 'coral' | 'green' | 'blue' | 'neutral';
}

export default function DateSection({
  title,
  emoji,
  count,
  children,
  defaultExpanded = false,
  color = 'coral'
}: DateSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getColorClasses = () => {
    switch (color) {
      case 'coral':
        return 'bg-brand-coral/5 border-brand-coral/20 text-brand-coral';
      case 'green':
        return 'bg-brand-green/5 border-brand-green/20 text-brand-green';
      case 'blue':
        return 'bg-status-info/5 border-status-info/20 text-status-info';
      default:
        return 'bg-neutral-100 border-neutral-200 text-neutral-600';
    }
  };

  const getAccentColor = () => {
    switch (color) {
      case 'coral':
        return 'text-brand-coral';
      case 'green':
        return 'text-brand-green';
      case 'blue':
        return 'text-status-info';
      default:
        return 'text-neutral-600';
    }
  };

  if (count === 0) return null;

  return (
    <div className="mb-6">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${getColorClasses()} ${
          isExpanded ? 'shadow-sm' : 'hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          {emoji && <span className="text-2xl">{emoji}</span>}
          <div className="text-left">
            <h2 className={`text-lg font-bold ${getAccentColor()}`}>
              {title}
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              {count} événement{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Count badge */}
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            color === 'coral' ? 'bg-brand-coral text-white' :
            color === 'green' ? 'bg-brand-green text-white' :
            color === 'blue' ? 'bg-status-info text-white' :
            'bg-neutral-300 text-neutral-700'
          }`}>
            {count}
          </span>

          {/* Chevron */}
          <svg
            className={`w-6 h-6 ${getAccentColor()} transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 ml-4 space-y-4 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
}
