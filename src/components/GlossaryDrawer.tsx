import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Search, X, Lightbulb, ArrowUpRight, RotateCcw } from 'lucide-react';
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  GlossaryCategory,
  GlossaryTerm,
} from '../data/glossaryData';

interface GlossaryDrawerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CATEGORY_TEXT_COLORS: Record<GlossaryCategory, string> = {
  'Core Protocols': 'text-indigo-600',
  'Network Entities': 'text-emerald-600',
  'Signaling & Headers': 'text-sky-600',
  'Audio & Media': 'text-amber-600',
  'NAT & Security': 'text-rose-600',
};

const CATEGORY_DOT_COLORS: Record<GlossaryCategory, string> = {
  'Core Protocols': 'bg-indigo-500',
  'Network Entities': 'bg-emerald-500',
  'Signaling & Headers': 'bg-sky-500',
  'Audio & Media': 'bg-amber-500',
  'NAT & Security': 'bg-rose-500',
};

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'All'>('All');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Focus search input when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        (item.shortCode && item.shortCode.toLowerCase().includes(q)) ||
        item.definition.toLowerCase().includes(q) ||
        (item.analogy && item.analogy.toLowerCase().includes(q)) ||
        (item.example && item.example.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const handleOpenDrawer = () => {
    setOpen(true);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  const handleJumpToTerm = (termId: string) => {
    setSelectedCategory('All');
    setSearchQuery('');
    setHighlightedId(termId);

    window.setTimeout(() => {
      const el = termRefs.current[termId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);

    window.setTimeout(() => {
      setHighlightedId((prev) => (prev === termId ? null : prev));
    }, 2000);
  };

  const highlightMatch = (text: string, query: string) => {
    const q = query.trim();
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  const termLookup = useMemo(() => {
    const map: Record<string, GlossaryTerm> = {};
    for (const t of GLOSSARY_TERMS) {
      map[t.id] = t;
    }
    return map;
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={handleOpenDrawer}
        aria-label="Open SIP and VoIP Glossary"
        aria-expanded={isOpen}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-900/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'
        }`}
      >
        <BookOpen className="w-5 h-5 shrink-0" />
        <span>Glossary</span>
        <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full">
          {GLOSSARY_TERMS.length}
        </span>
      </button>

      {/* Slide-over Glossary Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="glossary-drawer-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Panel */}
          <aside className="relative z-10 w-full max-w-xl bg-slate-50 h-full shadow-2xl flex flex-col border-l border-slate-200 animate-fadeIn">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="glossary-drawer-title" className="text-lg font-extrabold tracking-tight">
                    SIP & VoIP Glossary
                  </h2>
                  <p className="text-xs text-slate-300">
                    {filteredTerms.length} of {GLOSSARY_TERMS.length} beginner-friendly definitions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Close glossary"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 space-y-3 shrink-0">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search terms, acronyms (SDP, NAT, DTMF), or concepts..."
                  aria-label="Search glossary terms"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === 'All'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  All Terms
                </button>
                {GLOSSARY_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-white' : CATEGORY_DOT_COLORS[category]
                        }`}
                      />
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Definitions List */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {filteredTerms.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center space-y-3">
                  <Search className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">
                      No matching glossary terms found
                    </h3>
                    <p className="text-xs text-slate-500">
                      Try searching another acronym like "RTP", "NAT", "CSeq", or reset filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Search & Filters</span>
                  </button>
                </div>
              ) : (
                filteredTerms.map((item) => {
                  const isHighlighted = highlightedId === item.id;
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        termRefs.current[item.id] = el;
                      }}
                      className={`bg-white rounded-2xl p-5 border transition-all space-y-3 ${
                        isHighlighted
                          ? 'border-indigo-500 ring-2 ring-indigo-300 shadow-md'
                          : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      {/* Term Header & Clean Unboxed Category Metadata */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-bold ${CATEGORY_TEXT_COLORS[item.category]}`}>
                            {item.category}
                          </span>
                          {item.shortCode && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="font-mono text-slate-500 font-semibold">
                                {highlightMatch(item.shortCode, searchQuery)}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {highlightMatch(item.term, searchQuery)}
                        </h3>
                      </div>

                      {/* Definition */}
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {highlightMatch(item.definition, searchQuery)}
                      </p>

                      {/* Optional Everyday Analogy */}
                      {item.analogy && (
                        <div className="p-3 rounded-xl bg-amber-50/75 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Everyday Analogy</span>
                          </div>
                          <p className="italic leading-relaxed">
                            {highlightMatch(item.analogy, searchQuery)}
                          </p>
                        </div>
                      )}

                      {/* Optional Technical Example */}
                      {item.example && (
                        <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                          {highlightMatch(item.example, searchQuery)}
                        </div>
                      )}

                      {/* Related Terms Interactive Buttons */}
                      {item.relatedIds && item.relatedIds.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-medium mr-1">Related:</span>
                          {item.relatedIds.map((relId) => {
                            const rel = termLookup[relId];
                            if (!rel) return null;
                            return (
                              <button
                                key={relId}
                                type="button"
                                onClick={() => handleJumpToTerm(relId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 font-semibold transition"
                              >
                                <span>{rel.shortCode || rel.term}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
