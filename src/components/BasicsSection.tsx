import React from 'react';
import {
  Mic,
  Layers,
  Cpu,
  Globe,
  Headphones,
  ArrowRight,
} from 'lucide-react';

export const BasicsSection: React.FC = () => {
  const protocolQuad = [
    {
      code: 'SIP',
      name: 'Session Initiation Protocol',
      rfc: 'RFC 3261 · UDP/TCP 5060, TLS 5061',
      role: 'Signaling & Call Control',
      desc: 'Starts, modifies, rings, transfers, and ends calls. SIP never carries human voice audio—it strictly manages call state.',
      analogy: 'The switchboard operator connecting both lines.',
      accent: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      tagColor: 'text-indigo-700',
    },
    {
      code: 'SDP',
      name: 'Session Description Protocol',
      rfc: 'RFC 4566 · Carried inside SIP body',
      role: 'Media Negotiation',
      desc: 'Describes each party’s IP address, receiving UDP port, and supported audio/video codecs (such as G.711 or Opus).',
      analogy: 'Agreeing on a shared language before speaking.',
      accent: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      tagColor: 'text-emerald-700',
    },
    {
      code: 'RTP',
      name: 'Real-time Transport Protocol',
      rfc: 'RFC 3550 · Dynamic UDP (10000–20000)',
      role: 'Voice & Video Stream',
      desc: 'Transports the digitized audio frames directly between callers using sequence numbers and timestamps for smooth playback.',
      analogy: 'The delivery truck carrying your spoken words.',
      accent: 'bg-amber-50 border-amber-200 text-amber-950',
      tagColor: 'text-amber-700',
    },
    {
      code: 'RTCP',
      name: 'RTP Control Protocol',
      rfc: 'RFC 3550 · RTP Port + 1',
      role: 'Call Quality Telemetry',
      desc: 'Reports packet loss, jitter, and round-trip latency statistics during a call so endpoints can adapt quality.',
      analogy: 'A line quality monitor reporting road bumps.',
      accent: 'bg-rose-50 border-rose-200 text-rose-950',
      tagColor: 'text-rose-700',
    },
  ];

  const pipelineStages = [
    {
      step: '01',
      title: 'Acoustic Sound',
      icon: <Mic className="w-5 h-5 text-indigo-600" />,
      desc: 'Microphone captures analog voice vibrations (300 Hz – 3,400 Hz vocal band).',
      spec: 'Analog Wave',
    },
    {
      step: '02',
      title: 'ADC Sampling',
      icon: <Layers className="w-5 h-5 text-sky-600" />,
      desc: 'Sound card samples audio voltage 8,000 times per second (PCM).',
      spec: '8 kHz Sampling',
    },
    {
      step: '03',
      title: 'Codec Encoding',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      desc: 'Samples compress into compact digital frames via G.711 or Opus.',
      spec: '160B / 20ms',
    },
    {
      step: '04',
      title: 'RTP Packetization',
      icon: <Globe className="w-5 h-5 text-amber-600" />,
      desc: 'Wrapped with a 12-byte RTP header and sent over UDP IP packets.',
      spec: '~200B UDP Packet',
    },
    {
      step: '05',
      title: 'Jitter Playback',
      icon: <Headphones className="w-5 h-5 text-violet-600" />,
      desc: 'Receiver buffers packets briefly to smooth timing and plays sound.',
      spec: 'Goal < 150ms',
    },
  ];

  const entities = [
    {
      title: 'User Agent Client (UAC)',
      subtitle: 'Initiating Endpoint',
      color: 'text-indigo-700',
      desc: 'Starts SIP requests such as INVITE or REGISTER. Any desk phone or softphone acts as a UAC when placing a call.',
    },
    {
      title: 'User Agent Server (UAS)',
      subtitle: 'Receiving Endpoint',
      color: 'text-emerald-700',
      desc: 'Listens for incoming SIP requests and responds with status codes like 180 Ringing, 200 OK, or 486 Busy Here.',
    },
    {
      title: 'SIP Proxy Server',
      subtitle: 'Signaling Router',
      color: 'text-sky-700',
      desc: 'Routes SIP requests between callers by querying location records. Adds a Via header and never touches RTP voice audio.',
    },
    {
      title: 'SIP Registrar',
      subtitle: 'Address Directory',
      color: 'text-amber-700',
      desc: 'Accepts REGISTER requests and maps logical addresses (sip:alice@domain.com) to live device IP addresses.',
    },
    {
      title: 'IP-PBX / B2BUA',
      subtitle: 'Call Switchboard',
      color: 'text-violet-700',
      desc: 'Manages extension dialing, IVR menus, voicemail, call queues, and connects office phones to external SIP Trunks.',
    },
    {
      title: 'Session Border Controller (SBC)',
      subtitle: 'Security & NAT Bridge',
      color: 'text-rose-700',
      desc: 'Sits at the network edge to stop SIP attacks, rewrite private LAN IPs inside SDP payloads, and handle TLS/SRTP encryption.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <section
        id="top"
        className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Illustrated Beginner Guide · RFC 3261 &amp; RFC 3550
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-balance">
              Understand{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-200">
                SIP from VoIP
              </span>{' '}
              with Clear Visual Diagrams
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Voice over IP (VoIP) is how sound travels across the internet. Session Initiation Protocol (SIP) is the signaling language that dials, rings, negotiates, and hangs up those calls.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#diagrams"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-950/40"
              >
                <span>View Call Flow Diagrams</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#anatomy"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
              >
                <span>Inspect a SIP Packet</span>
              </a>
            </div>
          </div>

          {/* Right Summary Visual Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              The 30-Second Mental Model
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                <div className="font-bold text-white">1. SIP Dials &amp; Controls</div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sends INVITE, 180 Ringing, 200 OK, and BYE on port 5060.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                <div className="font-bold text-white">2. SDP Agrees on Rules</div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Exchanges IP addresses, audio UDP ports, and codecs inside SIP.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/30">
                <div className="font-bold text-white">3. RTP Carries the Voice</div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Streams live audio packets peer-to-peer over high UDP ports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: VoIP vs SIP + Protocol Quad */}
      <section id="basics" className="space-y-10">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            01. Core Foundations
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            VoIP vs. SIP: What Is the Difference?
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Beginners often use &ldquo;VoIP&rdquo; and &ldquo;SIP&rdquo; interchangeably, yet they operate at different layers of internet telephony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-sm">
                VoIP
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Voice over IP (The Category)</h3>
                <p className="text-xs text-slate-500">Any system sending voice over IP networks</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              VoIP is the overarching technology of turning analog voice into digital IP packets rather than using legacy copper PSTN telephone wires. Apps like WhatsApp, Zoom, Discord, and office IP desk phones are all forms of VoIP.
            </p>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-950">
              <span className="font-bold">Analogy:</span> VoIP is like <strong>&ldquo;Automobiles&rdquo;</strong> — the entire category of vehicles that move people down roads.
            </div>
          </article>

          <article className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
                SIP
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Session Initiation Protocol (The Standard)</h3>
                <p className="text-xs text-slate-500">Open signaling standard · IETF RFC 3261</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              SIP is the standardized text-based signaling protocol (visually similar to HTTP) that sets up, modifies, and ends VoIP calls between phones and carriers. SIP handles the handshake, while RTP handles the spoken audio.
            </p>
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950">
              <span className="font-bold">Analogy:</span> SIP is the <strong>&ldquo;Traffic Rules &amp; Ignition&rdquo;</strong> — it starts the journey, checks availability, and shuts down cleanly.
            </div>
          </article>
        </div>

        {/* Protocol Quad Grid */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              The 4 Protocols Behind Every SIP Call
            </h3>
            <p className="text-sm text-slate-500">
              SIP never works alone—four complementary IETF protocols divide signaling, negotiation, media delivery, and quality reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {protocolQuad.map((item) => (
              <div
                key={item.code}
                className={`rounded-2xl p-5 border ${item.accent} flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold tracking-tight">{item.code}</span>
                    <span className={`text-xs font-bold ${item.tagColor}`}>{item.role}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{item.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{item.rfc}</div>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-black/10 text-[11px] italic text-slate-700">
                  {item.analogy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Stage Voice Pipeline Diagram */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Media Path Overview
            </p>
            <h3 className="text-xl sm:text-2xl font-bold">
              How Your Voice Becomes IP Packets in 5 Steps
            </h3>
            <p className="text-sm text-slate-400">
              Once SIP finishes dialing, audio bypasses SIP completely and flows through this real-time pipeline every 20 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => (
              <div
                key={stage.step}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white">{stage.icon}</div>
                  <span className="font-mono text-xs font-bold text-slate-400">{stage.step}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{stage.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{stage.desc}</p>
                </div>
                <div className="text-[11px] font-mono text-emerald-300 pt-1">{stage.spec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Topology SVG Diagram + Component Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Network Architecture
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              How SIP Devices Fit Together on a Network
            </h3>
            <p className="text-sm text-slate-500">
              Notice the golden rule of VoIP routing: <strong>Signaling (SIP)</strong> travels via proxies and servers, while <strong>Voice Media (RTP)</strong> takes the shortest direct path.
            </p>
          </div>

          {/* Clean SVG Architecture Diagram */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox="0 0 880 270"
              className="w-full min-w-[680px] h-auto"
              role="img"
              aria-label="SIP Signaling vs RTP Media Network Architecture Diagram"
            >
              <defs>
                <marker id="arrow-sip" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#4f46e5" />
                </marker>
                <marker id="arrow-rtp" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#10b981" />
                </marker>
                <marker id="arrow-rtp-back" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
                  <path d="M8,0 L0,4 L8,8 z" fill="#10b981" />
                </marker>
              </defs>

              {/* Top Central Servers */}
              {/* SIP Proxy */}
              <rect x="275" y="18" width="145" height="68" rx="12" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
              <text x="347" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e1b4b">SIP Proxy / PBX</text>
              <text x="347" y="64" textAnchor="middle" fontSize="11" fill="#4338ca" fontFamily="monospace">203.0.113.10:5060</text>

              {/* SIP Registrar */}
              <rect x="460" y="18" width="145" height="68" rx="12" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
              <text x="532" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="#451a03">SIP Registrar</text>
              <text x="532" y="64" textAnchor="middle" fontSize="11" fill="#b45309" fontFamily="monospace">Location DB</text>

              {/* Proxy <-> Registrar lookup line */}
              <line x1="420" y1="52" x2="460" y2="52" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />

              {/* Alice UAC */}
              <rect x="30" y="162" width="190" height="82" rx="14" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2.5" />
              <text x="125" y="191" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">Alice Phone (UAC)</text>
              <text x="125" y="210" textAnchor="middle" fontSize="11" fill="#475569">Caller · Ext 101</text>
              <text x="125" y="229" textAnchor="middle" fontSize="11" fill="#0284c7" fontFamily="monospace">192.168.1.100:5060</text>

              {/* Bob UAS */}
              <rect x="660" y="162" width="190" height="82" rx="14" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2.5" />
              <text x="755" y="191" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">Bob Phone (UAS)</text>
              <text x="755" y="210" textAnchor="middle" fontSize="11" fill="#475569">Callee · Ext 102</text>
              <text x="755" y="229" textAnchor="middle" fontSize="11" fill="#7c3aed" fontFamily="monospace">192.168.2.200:5060</text>

              {/* SIP Signaling Arcs via Proxy */}
              <path
                d="M 145 162 Q 190 70 275 56"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                markerEnd="url(#arrow-sip)"
              />
              <text x="148" y="96" fontSize="11" fontWeight="700" fill="#4f46e5">SIP INVITE (Signaling)</text>

              <path
                d="M 420 75 Q 590 95 725 162"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                markerEnd="url(#arrow-sip)"
              />
              <text x="580" y="114" fontSize="11" fontWeight="700" fill="#4f46e5">Forwarded INVITE</text>

              {/* Direct RTP Audio Flow */}
              <line
                x1="226"
                y1="205"
                x2="654"
                y2="205"
                stroke="#10b981"
                strokeWidth="3.5"
                markerStart="url(#arrow-rtp-back)"
                markerEnd="url(#arrow-rtp)"
              />
              <rect x="315" y="188" width="250" height="30" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
              <text x="440" y="207" textAnchor="middle" fontSize="12" fontWeight="700" fill="#065f46">
                Direct RTP Voice Stream (UDP Audio)
              </text>
            </svg>
          </div>

          {/* 6 Network Entity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <div
                key={entity.title}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{entity.title}</h4>
                  <span className={`text-[11px] font-semibold ${entity.color}`}>{entity.subtitle}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{entity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
