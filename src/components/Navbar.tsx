import React from 'react';
import { Volume2, VolumeX, PhoneCall, GitFork, Radio, Terminal, FileCode2, Stethoscope, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export type TabType = 'primer' | 'ladder' | 'simulator' | 'dissector' | 'matrix' | 'troubleshoot';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  completedQuizzesCount: number;
  totalQuizzesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  completedQuizzesCount,
  totalQuizzesCount,
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode; hint: string }> = [
    { id: 'primer', label: 'VoIP & SIP Primer', icon: <Radio className="w-4 h-4 text-emerald-500" />, hint: 'Fundamentals & Protocols' },
    { id: 'ladder', label: 'Call Flow Diagrams', icon: <GitFork className="w-4 h-4 text-sky-500" />, hint: 'Step-by-step Ladder' },
    { id: 'simulator', label: 'Softphone Simulator', icon: <PhoneCall className="w-4 h-4 text-indigo-500" />, hint: 'Live Interactive Call' },
    { id: 'dissector', label: 'Packet Dissector', icon: <FileCode2 className="w-4 h-4 text-amber-500" />, hint: 'SIP & SDP Inspector' },
    { id: 'matrix', label: 'Status Code Matrix', icon: <Terminal className="w-4 h-4 text-violet-500" />, hint: '1xx to 6xx Cheatsheet' },
    { id: 'troubleshoot', label: 'Troubleshooting Lab', icon: <Stethoscope className="w-4 h-4 text-rose-500" />, hint: 'Real VoIP Diagnostics' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('primer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SIP & VoIP</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Interactive Academy
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Master Session Initiation Protocol from zero to hero</p>
            </div>
          </div>

          {/* Right actions: Audio Mute & Quiz Progress */}
          <div className="flex items-center gap-3">
            {/* Quiz progress pill */}
            <div
              onClick={() => onTabChange('troubleshoot')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 text-xs font-medium text-slate-700 transition cursor-pointer"
              title="Click to view Troubleshooting Lab"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lab Progress:</span>
              <span className="font-mono font-semibold text-indigo-600">{completedQuizzesCount}/{totalQuizzesCount}</span>
            </div>

            {/* Sound toggle button */}
            <button
              onClick={() => {
                onToggleMute();
                if (isMuted) {
                  audioEngine.playConnectedChime();
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isMuted
                  ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isMuted ? 'Unmute authentic telecom audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation row */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  audioEngine.playDTMF('1');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
