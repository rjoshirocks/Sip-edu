import { useState } from 'react';
import { SiteHeader } from './components/SiteHeader';
import { BasicsSection } from './components/BasicsSection';
import { CallFlowDiagramsSection } from './components/CallFlowDiagramsSection';
import { MessageAnatomySection } from './components/MessageAnatomySection';
import { ReferenceSection } from './components/ReferenceSection';
import { TroubleshootingSection } from './components/TroubleshootingSection';
import { GlossaryDrawer } from './components/GlossaryDrawer';

export default function App() {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <SiteHeader onOpenGlossary={() => setIsGlossaryOpen(true)} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-20">
        <BasicsSection />
        <CallFlowDiagramsSection />
        <MessageAnatomySection />
        <ReferenceSection />
        <TroubleshootingSection />
      </main>

      <footer className="mt-20 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">SIP &amp; VoIP Guide</span>
            <span aria-hidden="true">·</span>
            <span>IETF RFC 3261, RFC 4566 &amp; RFC 3550</span>
            <span aria-hidden="true">·</span>
            <span>100% Standalone Static Webpage</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-600 font-medium">
            <a href="#basics" className="hover:text-indigo-600 transition">
              Basics
            </a>
            <a href="#diagrams" className="hover:text-indigo-600 transition">
              Call Flows
            </a>
            <a href="#anatomy" className="hover:text-indigo-600 transition">
              Message Anatomy
            </a>
            <a href="#reference" className="hover:text-indigo-600 transition">
              Status Codes
            </a>
            <a href="#troubleshooting" className="hover:text-indigo-600 transition">
              Common Issues
            </a>
            <button
              type="button"
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              Glossary
            </button>
          </div>
        </div>
      </footer>

      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onOpenChange={setIsGlossaryOpen}
      />
    </div>
  );
}
