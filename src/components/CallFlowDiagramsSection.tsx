import React, { useState } from 'react';
import { CALL_SCENARIOS, CallScenario, LadderStep } from '../data/sipData';

const COLOR_MAP: Record<string, { stroke: string; fill: string; badgeBg: string; badgeText: string }> = {
  emerald: { stroke: '#10b981', fill: '#ecfdf5', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
  sky: { stroke: '#0ea5e9', fill: '#f0f9ff', badgeBg: 'bg-sky-50', badgeText: 'text-sky-700' },
  amber: { stroke: '#f59e0b', fill: '#fffbeb', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
  indigo: { stroke: '#6366f1', fill: '#eef2ff', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700' },
  violet: { stroke: '#8b5cf6', fill: '#f5f3ff', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700' },
  rose: { stroke: '#f43f5e', fill: '#fff1f2', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
  slate: { stroke: '#64748b', fill: '#f8fafc', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' },
};

export const CallFlowDiagramsSection: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('basic-call');

  const scenario: CallScenario =
    CALL_SCENARIOS.find((s) => s.id === selectedScenarioId) || CALL_SCENARIOS[0];

  const participants = scenario.participants;
  const colWidth = participants.length === 2 ? 420 : 260;
  const svgWidth = participants.length === 2 ? 680 : 760;
  const startX = participants.length === 2 ? 130 : 120;
  const stepHeight = 56;
  const headerHeight = 76;
  const svgHeight = headerHeight + scenario.steps.length * stepHeight + 36;

  const getColumnX = (id: string) => {
    const idx = participants.findIndex((p) => p.id === id);
    return startX + (idx >= 0 ? idx : 0) * colWidth;
  };

  return (
    <section id="diagrams" className="space-y-8">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
          02. Visual Sequence Diagrams
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How a SIP Call Flows Step by Step
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Telecom engineers read calls using vertical <strong>ladder diagrams</strong>. Time flows downward from top to bottom as messages travel between endpoints and proxies.
        </p>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {CALL_SCENARIOS.map((s) => {
          const isActive = s.id === selectedScenarioId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedScenarioId(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Scenario Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <span>{scenario.category}</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.badge}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{scenario.title}</h3>
            <p className="text-sm text-slate-600">{scenario.description}</p>
          </div>
        </div>

        {/* Diagram + Annotated Guide Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Full SVG Ladder Diagram */}
          <div className="xl:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[560px] h-auto"
              role="img"
              aria-label={`SIP sequence diagram for ${scenario.title}`}
            >
              <defs>
                {Object.entries(COLOR_MAP).map(([key, cfg]) => (
                  <React.Fragment key={key}>
                    <marker
                      id={`head-right-${key}`}
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M0,0 L8,4 L0,8 z" fill={cfg.stroke} />
                    </marker>
                    <marker
                      id={`head-left-${key}`}
                      markerWidth="8"
                      markerHeight="8"
                      refX="1"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M8,0 L0,4 L8,8 z" fill={cfg.stroke} />
                    </marker>
                  </React.Fragment>
                ))}
              </defs>

              {/* Participant Header Boxes & Vertical Lifelines */}
              {participants.map((p) => {
                const x = getColumnX(p.id);
                return (
                  <g key={p.id}>
                    <line
                      x1={x}
                      y1={headerHeight - 8}
                      x2={x}
                      y2={svgHeight - 16}
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                    <rect
                      x={x - 90}
                      y={10}
                      width={180}
                      height={54}
                      rx={12}
                      fill="#ffffff"
                      stroke="#6366f1"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={31}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {p.label}
                    </text>
                    <text
                      x={x}
                      y={48}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      {p.ip}
                    </text>
                  </g>
                );
              })}

              {/* Message Arrows */}
              {scenario.steps.map((step: LadderStep, idx: number) => {
                const x1 = getColumnX(step.from);
                const x2 = getColumnX(step.to);
                const y = headerHeight + idx * stepHeight + 34;
                const colorKey = COLOR_MAP[step.highlightColor] ? step.highlightColor : 'indigo';
                const theme = COLOR_MAP[colorKey];
                const isMedia = step.type === 'media';
                const minX = Math.min(x1, x2);
                const maxX = Math.max(x1, x2);
                const midX = (minX + maxX) / 2;
                const shortLabel = step.title.split(' (')[0];

                return (
                  <g key={step.id}>
                    {isMedia ? (
                      <line
                        x1={minX + 6}
                        y1={y}
                        x2={maxX - 6}
                        y2={y}
                        stroke={theme.stroke}
                        strokeWidth="4"
                        markerStart={`url(#head-left-${colorKey})`}
                        markerEnd={`url(#head-right-${colorKey})`}
                      />
                    ) : (
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2 > x1 ? x2 - 6 : x2 + 6}
                        y2={y}
                        stroke={theme.stroke}
                        strokeWidth="2.5"
                        strokeDasharray={step.type === 'response' ? '6 3' : undefined}
                        markerEnd={`url(#head-right-${colorKey})`}
                      />
                    )}

                    {/* Label pill on line */}
                    <rect
                      x={midX - 102}
                      y={y - 24}
                      width={204}
                      height={20}
                      rx={6}
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#0f172a"
                      fontFamily="monospace"
                    >
                      {step.stepNumber}. {shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-[11px] text-slate-600 pt-3 border-t border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 bg-indigo-600 inline-block" /> Solid Arrow = SIP Request
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-sky-500 inline-block" /> Dashed Arrow = SIP Response
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-1 bg-violet-500 inline-block rounded" /> Thick Bi-Directional = RTP Media
              </span>
            </div>
          </div>

          {/* Right: Complete Numbered Step Breakdown */}
          <div className="xl:col-span-5 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Step-by-Step Walkthrough
            </h4>
            <ol className="space-y-3">
              {scenario.steps.map((step) => {
                const theme = COLOR_MAP[step.highlightColor] || COLOR_MAP.indigo;
                return (
                  <li
                    key={step.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${theme.badgeText}`}>
                        {step.stepNumber}. {step.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {step.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{step.description}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <strong className="text-slate-700">Why it matters:</strong> {step.whyItMatters}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
