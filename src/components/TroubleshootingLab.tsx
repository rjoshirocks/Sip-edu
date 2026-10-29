import React, { useState } from 'react';
import { TROUBLESHOOTING_QUIZZES, TroubleshootingQuiz } from '../data/sipData';
import { Stethoscope, CheckCircle2, XCircle, Award, Terminal, Lightbulb, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';

interface TroubleshootingLabProps {
  completedQuizzes: Record<string, boolean>;
  onQuizCompleted: (quizId: string) => void;
}

export const TroubleshootingLab: React.FC<TroubleshootingLabProps> = ({
  completedQuizzes,
  onQuizCompleted,
}) => {
  const [activeQuizId, setActiveQuizId] = useState<string>(TROUBLESHOOTING_QUIZZES[0].id);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showClue, setShowClue] = useState<boolean>(false);

  const currentQuiz: TroubleshootingQuiz =
    TROUBLESHOOTING_QUIZZES.find((q) => q.id === activeQuizId) || TROUBLESHOOTING_QUIZZES[0];

  const handleSelectOption = (idx: number) => {
    if (!submitted) {
      setSelectedOption(idx);
      audioEngine.playDTMF(String(idx + 1));
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);

    if (selectedOption === currentQuiz.correctIndex) {
      audioEngine.playConnectedChime();
      onQuizCompleted(currentQuiz.id);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      audioEngine.startBusyTone();
      setTimeout(() => {
        audioEngine.stopContinuousTone();
      }, 700);
    }
  };

  const handleResetCurrent = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowClue(false);
  };

  const handleSelectQuiz = (id: string) => {
    setActiveQuizId(id);
    setSelectedOption(null);
    setSubmitted(false);
    setShowClue(false);
    audioEngine.playDTMF('4');
  };

  const isCurrentSolved = completedQuizzes[currentQuiz.id];

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">VoIP Engineering Lab</span>
          <h2 className="text-2xl font-bold text-slate-900">Hands-on Troubleshooting Simulator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Examine authentic Wireshark packet captures, diagnose real-world telecom failure tickets, and master SIP triage.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
          <Award className="w-4 h-4 text-amber-500" />
          <span>
            Score: {Object.values(completedQuizzes).filter(Boolean).length} / {TROUBLESHOOTING_QUIZZES.length} Cases Resolved
          </span>
        </div>
      </div>

      {/* Case Studies Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TROUBLESHOOTING_QUIZZES.map((q, idx) => {
          const isSelected = activeQuizId === q.id;
          const isSolved = completedQuizzes[q.id];
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuiz(q.id)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md border-indigo-500 ring-2 ring-indigo-400/40'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-slate-400">CASE 0{idx + 1}</span>
                {isSolved ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SOLVED
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-500">{q.difficulty}</span>
                )}
              </div>
              <div className="font-bold text-sm truncate">{q.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Case Workspace */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Ticket Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Ticket #{currentQuiz.id.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Severity: High
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{currentQuiz.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClue(!showClue)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{showClue ? 'Hide Clue' : 'Reveal Clue'}</span>
            </button>
            <button
              onClick={handleResetCurrent}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Reset choice"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reported User Symptom */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950 space-y-1">
          <span className="font-bold uppercase tracking-wider text-rose-800 block">Reported User Symptom:</span>
          <p className="text-sm leading-relaxed">{currentQuiz.symptom}</p>
        </div>

        {/* Clue card */}
        {showClue && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-fadeIn">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Senior VoIP Architect Hint:
            </span>
            <p>
              Compare the IP addresses advertised in the packet body (SDP <span className="font-mono">c=</span> line) versus where the router actually sent the UDP media packets. Are they publicly routable?
            </p>
          </div>
        )}

        {/* Wireshark Packet Trace Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Simulated Wireshark Packet Capture (pcap snippet)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Filtered: sip || rtp</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 text-slate-200 font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-2.5">Time (s)</th>
                  <th className="p-2.5">Source</th>
                  <th className="p-2.5">Destination</th>
                  <th className="p-2.5">Protocol</th>
                  <th className="p-2.5">Info / Payload Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {currentQuiz.packetTrace.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/60 transition">
                    <td className="p-2.5 text-slate-500">{row.time}</td>
                    <td className="p-2.5 text-sky-300 truncate">{row.source}</td>
                    <td className="p-2.5 text-indigo-300 truncate">{row.dest}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.protocol.includes('RTP')
                            ? 'bg-violet-900/50 text-violet-300'
                            : 'bg-emerald-900/50 text-emerald-300'
                        }`}
                      >
                        {row.protocol}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300 max-w-sm truncate">{row.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Question & Multiple Choice Options */}
        <div className="space-y-4 pt-2">
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>Diagnostic Question:</span>
            <span className="text-sm font-normal text-slate-600">{currentQuiz.question}</span>
          </h4>

          <div className="space-y-2.5">
            {currentQuiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = submitted && idx === currentQuiz.correctIndex;
              const isWrong = submitted && isSelected && idx !== currentQuiz.correctIndex;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-2 ring-emerald-300'
                      : isWrong
                      ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-2 ring-rose-300'
                      : isSelected
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <span>Submit Diagnosis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Feedback & Fix Card after submit */}
          {submitted && (
            <div className="space-y-4 pt-3 border-t border-slate-100 animate-fadeIn">
              <div
                className={`p-5 rounded-2xl border space-y-2 ${
                  selectedOption === currentQuiz.correctIndex
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  {selectedOption === currentQuiz.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Diagnosis Confirmed! Great Engineering!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Incorrect Diagnosis. Review the packet trace carefully!</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">{currentQuiz.explanation}</p>
              </div>

              {/* Actionable Engineering Fix Guide */}
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  How to Fix in Production PBX:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-mono bg-white p-3 rounded-xl border border-indigo-100">
                  {currentQuiz.fixGuide}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
