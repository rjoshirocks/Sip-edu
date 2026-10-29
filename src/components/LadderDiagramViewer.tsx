import React, { useState, useEffect, useRef } from 'react';
import { CALL_SCENARIOS, CallScenario, LadderStep } from '../data/sipData';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Info, CheckCircle, Radio, ArrowRight, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const LadderDiagramViewer: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('basic-call');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'rawHeaders' | 'sdp'>('explanation');

  const scenario: CallScenario =
    CALL_SCENARIOS.find((s) => s.id === selectedScenarioId) || CALL_SCENARIOS[0];
  const currentStep: LadderStep = scenario.steps[currentStepIndex] || scenario.steps[0];
  const autoPlayTimerRef = useRef<number | null>(null);

  // Stop auto-play when reaching end or scenario changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedScenarioId]);

  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < scenario.steps.length - 1) {
            audioEngine.playPacketSwoosh();
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2600);
    } else {
      if (autoPlayTimerRef.current !== null) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current !== null) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, scenario.steps.length]);

  const handleNext = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      audioEngine.playPacketSwoosh();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      audioEngine.playDTMF('5');
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    audioEngine.playHangupTone();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex === scenario.steps.length - 1) {
        setCurrentStepIndex(0);
      }
      audioEngine.playConnectedChime();
      setIsPlaying(true);
    }
  };

  // Helper to determine horizontal positions based on participants
  const getParticipantIndex = (id: string) => {
    return scenario.participants.findIndex((p) => p.id === id);
  };

  const numCols = scenario.participants.length;

  return (
    <div className="space-y-8 py-6">
      {/* Top Controls: Scenario Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Interactive Call Flows</span>
            <h2 className="text-2xl font-bold text-slate-900">SIP Ladder Diagram Studio</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                audioEngine.playDTMF('2');
              }}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CALL_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scenario description bar */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-indigo-950">{scenario.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-800">
                {scenario.badge}
              </span>
            </div>
            <p className="text-xs text-indigo-900/80">{scenario.description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 shrink-0">
            <span>{scenario.steps.length} Steps</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Ladder Diagram on Left, Live Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Ladder Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Playback Transport Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Reset to step 1"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlayPause}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-white shadow-xs transition ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Flow' : 'Auto-Play Ladder'}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex === scenario.steps.length - 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Progress:</span>
              <span className="text-xs font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                Step {currentStepIndex + 1} of {scenario.steps.length}
              </span>
            </div>
          </div>

          {/* Participant Headers */}
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
            {scenario.participants.map((p) => {
              const isSender = currentStep.from === p.id;
              const isReceiver = currentStep.to === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    isSender
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                      : isReceiver
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                  <div className="text-[10px] font-mono text-indigo-600 truncate mt-0.5">{p.ip}</div>
                </div>
              );
            })}
          </div>

          {/* Ladder Messages Timeline */}
          <div className="relative pt-2 pb-6 space-y-4">
            {scenario.steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              const fromIdx = getParticipantIndex(step.from);
              const toIdx = getParticipantIndex(step.to);
              const isLtoR = toIdx > fromIdx;
              const isMedia = step.type === 'media';

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    audioEngine.playDTMF('6');
                  }}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-md border-indigo-500 ring-2 ring-indigo-400/40'
                      : isPast
                      ? 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-white text-slate-400 border-dashed border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                          isCurrent
                            ? 'bg-indigo-500 text-white'
                            : isPast
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span className="font-bold">{step.title}</span>
                      {step.code && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            step.code >= 200 && step.code < 300
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : step.code >= 400
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {step.code}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono opacity-80">
                      {step.from.toUpperCase()} {isLtoR ? '⟶' : '⟵'} {step.to.toUpperCase()}
                    </span>
                  </div>

                  {/* Flow trajectory visualization inside the card */}
                  {isMedia ? (
                    <div className="my-2 p-2 rounded-lg bg-violet-950/60 border border-violet-500/40 text-violet-200 text-xs flex items-center justify-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                      <span className="font-semibold">Direct RTP Audio Packets Flowing Peer-to-Peer</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs opacity-90 truncate">
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate">{step.description}</span>
                    </div>
                  )}

                  {/* Active step pulsing highlight ring */}
                  {isCurrent && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-indigo-500 rounded-r-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Packet & Step Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Packet & Logic Inspector</span>
              <h3 className="text-lg font-bold text-slate-900">Step {currentStep.stepNumber}: {currentStep.title}</h3>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Info className="w-4 h-4" />
            </div>
          </div>

          {/* Sub-Tabs: Explanation vs SIP Headers vs SDP */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTab === 'explanation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setActiveTab('rawHeaders')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTab === 'rawHeaders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SIP Headers
            </button>
            {currentStep.packetDetails.sdp && (
              <button
                onClick={() => setActiveTab('sdp')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeTab === 'sdp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SDP Payload
              </button>
            )}
          </div>

          {/* Tab 1: Explanation Content */}
          {activeTab === 'explanation' && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">What is happening:</span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {currentStep.description}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why it matters in VoIP engineering:
                </span>
                <p className="text-slate-800 leading-relaxed bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 text-xs">
                  {currentStep.whyItMatters}
                </p>
              </div>

              {/* Start Line preview */}
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Line:</span>
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                  {currentStep.packetDetails.startLine}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SIP Headers Content */}
          {activeTab === 'rawHeaders' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto max-h-96 space-y-1">
                <div className="text-emerald-400 font-bold pb-1 border-b border-slate-800">
                  {currentStep.packetDetails.startLine}
                </div>
                {Object.entries(currentStep.packetDetails.headers).map(([key, val]) => (
                  <div key={key} className="leading-tight py-0.5">
                    <span className="text-sky-300 font-semibold">{key}: </span>
                    <span className="text-slate-300">{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Tip: Notice the <span className="font-mono text-indigo-600 font-semibold">Via</span> and <span className="font-mono text-indigo-600 font-semibold">CSeq</span> headers incrementing and keeping track of transaction state.
              </p>
            </div>
          )}

          {/* Tab 3: SDP Payload Content */}
          {activeTab === 'sdp' && currentStep.packetDetails.sdp && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto max-h-96 space-y-1">
                <div className="text-amber-400 font-bold pb-1 border-b border-slate-800">
                  Content-Type: application/sdp
                </div>
                {Object.entries(currentStep.packetDetails.sdp).map(([key, val]) => (
                  <div key={key} className="leading-tight py-0.5">
                    <span className="text-amber-300 font-semibold">{key}=</span>
                    <span className="text-slate-300">{val}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold">SDP Role in this step:</span>
                <p>Contains the network IP (<span className="font-mono">c=</span>) and UDP port (<span className="font-mono">m=</span>) where direct RTP voice frames must be routed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
