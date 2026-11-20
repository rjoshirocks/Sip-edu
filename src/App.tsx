import { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { VoipPrimer } from './components/VoipPrimer';
import { LadderDiagramViewer } from './components/LadderDiagramViewer';
import { SoftphoneSimulator } from './components/SoftphoneSimulator';
import { PacketDissector } from './components/PacketDissector';
import { ResponseCodeMatrix } from './components/ResponseCodeMatrix';
import { TroubleshootingLab } from './components/TroubleshootingLab';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { TROUBLESHOOTING_QUIZZES } from './data/sipData';
import { audioEngine } from './utils/audioEngine';
import { Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('primer');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sip_academy_quizzes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleQuizCompleted = (quizId: string) => {
    setCompletedQuizzes((prev) => {
      const next = { ...prev, [quizId]: true };
      try {
        localStorage.setItem('sip_academy_quizzes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  // Sync mute state on mount
  useEffect(() => {
    audioEngine.setMuted(isMuted);
  }, [isMuted]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        completedQuizzesCount={Object.values(completedQuizzes).filter(Boolean).length}
        totalQuizzesCount={TROUBLESHOOTING_QUIZZES.length}
      />

      {/* Main Educational Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'primer' && (
          <VoipPrimer onJumpToLadder={() => setActiveTab('ladder')} />
        )}
        {activeTab === 'ladder' && <LadderDiagramViewer />}
        {activeTab === 'simulator' && <SoftphoneSimulator />}
        {activeTab === 'dissector' && <PacketDissector />}
        {activeTab === 'matrix' && <ResponseCodeMatrix />}
        {activeTab === 'troubleshoot' && (
          <TroubleshootingLab
            completedQuizzes={completedQuizzes}
            onQuizCompleted={handleQuizCompleted}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">SIP & VoIP Interactive Academy</span>
            <span>·</span>
            <span>Based on IETF RFC 3261, RFC 4566 & RFC 3550</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveTab('primer')}
              className="hover:text-indigo-600 transition"
            >
              VoIP Primer
            </button>
            <button
              onClick={() => setActiveTab('ladder')}
              className="hover:text-indigo-600 transition"
            >
              Call Flows
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-indigo-600 transition"
            >
              Simulator
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className="hover:text-indigo-600 transition"
            >
              Response Codes
            </button>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-indigo-600 transition"
            >
              Glossary
            </button>
          </div>
        </div>
      </footer>

      {/* Searchable Glossary Floating Action Button & Slide-Over Drawer */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onOpenChange={setIsGlossaryOpen}
      />
    </div>
  );
}
