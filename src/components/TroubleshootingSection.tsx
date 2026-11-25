import React from 'react';
import { TROUBLESHOOTING_QUIZZES } from '../data/sipData';

export const TroubleshootingSection: React.FC = () => {
  return (
    <section id="troubleshooting" className="space-y-8">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
          05. Real-World Diagnostics
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Common VoIP &amp; SIP Issues Explained
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Understanding how SIP signaling separates from RTP media helps diagnose almost every classic VoIP outage in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {TROUBLESHOOTING_QUIZZES.slice(0, 3).map((item, idx) => (
          <article
            key={item.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-600">
                  Case 0{idx + 1} · {item.difficulty}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{item.title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Symptom + Trace */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-rose-800 block">
                    Symptom
                  </span>
                  <p className="text-sm leading-relaxed">{item.symptom}</p>
                </div>

                <div className="rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Source → Dest</th>
                        <th className="p-2.5">Protocol</th>
                        <th className="p-2.5">Packet Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {item.packetTrace.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="p-2.5 text-slate-500">{row.time}s</td>
                          <td className="p-2.5 text-sky-300 whitespace-nowrap">
                            {row.source} → {row.dest}
                          </td>
                          <td className="p-2.5 text-emerald-300 whitespace-nowrap">{row.protocol}</td>
                          <td className="p-2.5 text-slate-300">{row.info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Root Cause & Production Fix */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Why It Happens
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.explanation}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    How Engineers Fix It
                  </h4>
                  <p className="text-xs text-emerald-950 leading-relaxed font-mono bg-white/80 p-3 rounded-xl border border-emerald-200/80">
                    {item.fixGuide}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
