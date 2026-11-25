import React from 'react';
import { BookOpen } from 'lucide-react';

interface SiteHeaderProps {
  onOpenGlossary: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenGlossary }) => {
  const navLinks = [
    { href: '#basics', label: 'Basics' },
    { href: '#diagrams', label: 'Call Flows' },
    { href: '#anatomy', label: 'Message Anatomy' },
    { href: '#reference', label: 'Status Codes' },
    { href: '#troubleshooting', label: 'Common Issues' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SIP &amp; VoIP Guide
        </a>

        <nav
          aria-label="Page sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-indigo-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenGlossary}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <BookOpen className="w-4 h-4" />
            <span>Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
