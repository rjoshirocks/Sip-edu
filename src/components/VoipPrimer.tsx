import React, { useState } from 'react';
import { Radio, Layers, Server, Shield, Headphones, Mic, Cpu, Globe, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const VoipPrimer: React.FC<{ onJumpToLadder: () => void }> = ({ onJumpToLadder }) => {
  const [activeStackLayer, setActiveStackLayer] = useState<'sip' | 'sdp' | 'rtp' | 'rtcp'>('sip');
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<string>('uac');

  const stackDetails = {
    sip: {
      name: 'SIP (Session Initiation Protocol)',
      rfc: 'RFC 3261',
      port: 'UDP / TCP 5060, TLS 5061',
      role: 'Signaling & Call Control',
      summary: 'Dials, rings, answers, holds, transfers, and hangs up calls. It never touches or carries human voice audio itself!',
      analogy: 'The telephone operator and switchboard connecting the two ends together.',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    sdp: {
      name: 'SDP (Session Description Protocol)',
      rfc: 'RFC 4566',
      port: 'Carried inside SIP body (application/sdp)',
      role: 'Media Negotiation & Capabilities',
      summary: 'Describes the media streams: what codecs are supported (G.711, Opus), remote IP address, and audio UDP port number.',
      analogy: 'The menu agreeing on which common language (codec) both parties can speak.',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    rtp: {
      name: 'RTP (Real-time Transport Protocol)',
      rfc: 'RFC 3550',
      port: 'Dynamic UDP ports (e.g. 10,000 – 20,000)',
      role: 'Voice / Video Audio Payload Transport',
      summary: 'Carries the actual digitized voice packets with sequence numbers and timestamps to prevent stutter and jitter.',
      analogy: 'The courier truck carrying the actual physical voice packets directly between speakers.',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    rtcp: {
      name: 'RTCP (RTP Control Protocol)',
      rfc: 'RFC 3550',
      port: 'RTP Port + 1 (e.g. 10,001 if RTP is 10,000)',
      role: 'Quality of Service (QoS) Telemetry',
      summary: 'Sends periodic statistics on jitter, packet loss percentage, round-trip delay (RTT), and audio quality.',
      analogy: 'The quality inspector giving feedback on whether the audio line is crackling.',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  };

  const pipelineSteps = [
    {
      title: '1. Acoustic Sound',
      icon: <Mic className="w-5 h-5 text-indigo-600" />,
      desc: 'You speak into the microphone. Voice travels as analog acoustic waves (vibrations in air).',
      metric: 'Frequency: 300 Hz – 3,400 Hz (human vocal range)',
    },
    {
      title: '2. ADC Sampling',
      icon: <Layers className="w-5 h-5 text-sky-600" />,
      desc: 'The sound card samples analog voltage 8,000 times per second (Nyquist Theorem: 2 × max frequency).',
      metric: 'Pulse Code Modulation (PCM) at 8 kHz sample rate',
    },
    {
      title: '3. Codec Encoding',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      desc: 'Audio samples are compressed into digital bytes using an audio codec like G.711u (64 kbps) or Opus (HD).',
      metric: '160 bytes of audio per 20ms frame',
    },
    {
      title: '4. RTP Packetization',
      icon: <Globe className="w-5 h-5 text-amber-600" />,
      desc: '12-byte RTP header is prepended (sequence number, timestamp, payload type) and wrapped into UDP packet.',
      metric: 'UDP packet size: ~200 bytes transmitted every 20 milliseconds',
    },
    {
      title: '5. Playback at Ear',
      icon: <Headphones className="w-5 h-5 text-violet-600" />,
      desc: 'Recipient phone receives packets, puts them into a jitter buffer, reconstructs continuous wave, and plays sound!',
      metric: 'End-to-end latency goal: < 150ms for natural conversation',
    },
  ];

  const networkEntities: Record<string, { title: string; subtitle: string; role: string; keyPoints: string[] }> = {
    uac: {
      title: 'User Agent Client (UAC)',
      subtitle: 'The Calling Endpoint',
      role: 'Initiates SIP requests (e.g. sending INVITE, CANCEL, BYE). In a typical desk phone or softphone, the phone acts as both a UAC when placing calls and a UAS when receiving calls.',
      keyPoints: [
        'Creates initial Call-ID and local branch ID',
        'Includes SDP Offer describing audio codecs and listening UDP port',
        'Listens for 100 Trying, 180 Ringing, 200 OK',
      ],
    },
    uas: {
      title: 'User Agent Server (UAS)',
      subtitle: 'The Answering Endpoint',
      role: 'Listens for incoming SIP requests and sends responses (180 Ringing, 200 OK, 486 Busy Here).',
      keyPoints: [
        'Appends callee tag in the To header to create a unique dialog',
        'Generates SDP Answer agreeing on mutually supported codecs',
        'Receives ACK to complete the 3-way handshake',
      ],
    },
    proxy: {
      title: 'SIP Stateful Proxy',
      subtitle: 'The Central Traffic Router',
      role: 'Acts as an intermediary router that queries location databases and forwards SIP requests toward the destination. It inspects headers, adds Via records, and handles fork routing.',
      keyPoints: [
        'Does NOT participate in RTP voice streams (signaling only)',
        'Decrements Max-Forwards header to eliminate infinite loops',
        'Can ring multiple desk phones simultaneously (Call Forking)',
      ],
    },
    registrar: {
      title: 'SIP Registrar & Location Server',
      subtitle: 'The Telephone Address Book',
      role: 'Receives REGISTER requests from phones and maps logical user URIs (e.g. sip:bob@company.com) to dynamic physical IP addresses (e.g. 192.168.1.102:5060).',
      keyPoints: [
        'Enforces Digest Authentication with 401 challenges',
        'Stores lease expiration timer (typically 3600 seconds)',
        'Allows users to receive calls on mobile, desk phone, or laptop',
      ],
    },
    sbc: {
      title: 'Session Border Controller (SBC)',
      subtitle: 'The Firewall & NAT Guardian',
      role: 'Positioned at the network perimeter. Protects VoIP servers against DDoS, fixes NAT traversal bugs (rewriting SDP IP addresses), and transcodes codecs.',
      keyPoints: [
        'Fixes the #1 VoIP bug: One-way audio caused by private LAN IPs',
        'Encrypts signaling with TLS and media with SRTP',
        'Bridges enterprise SIP PBX to external SIP Trunk carriers',
      ],
    },
  };

  return (
    <div className="space-y-12 py-6">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Interactive Beginner Guide</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Demystifying <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-300">VoIP & SIP</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Many beginners ask: <strong className="text-white">"What is the difference between VoIP and SIP?"</strong> VoIP is the concept of transmitting voice over IP networks; SIP is the language and signaling protocol that dials, answers, and manages those calls.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => {
                audioEngine.playConnectedChime();
                onJumpToLadder();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition"
            >
              <span>Explore Interactive Call Ladder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-300 px-3 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Covers RFC 3261, RFC 4566, RFC 3550</span>
            </div>
          </div>
        </div>
      </section>

      {/* VoIP vs SIP Analogy Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
            VoIP
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Voice over IP (The Big Picture)</h3>
            <p className="text-xs text-slate-500 mt-1">The umbrella technology category</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            VoIP refers to <strong className="text-slate-900">any system</strong> that transforms spoken sound waves into digital IP packets and sends them over the internet rather than traditional copper PSTN lines (like Skype, WhatsApp audio, Discord, and enterprise IP phones).
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900">Real-World Analogy:</span>
            <p>VoIP is like <strong className="text-sky-700">"Motor Vehicles"</strong> — an entire category of transportation that gets things from A to B.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
            SIP
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Session Initiation Protocol (The Signaling)</h3>
            <p className="text-xs text-slate-500 mt-1">The standard protocol engine (RFC 3261)</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            SIP is the specific, standardized <strong className="text-slate-900">signaling protocol</strong> used to start, modify, and terminate those multimedia sessions. SIP negotiates the call details, but hands over the actual audio transfer to RTP.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900">Real-World Analogy:</span>
            <p>SIP is the <strong className="text-indigo-700">"Traffic Rules & Ignition Switch"</strong> — it starts the car, verifies the destination, and stops the engine.</p>
          </div>
        </div>
      </section>

      {/* The Protocol Stack Interactive Visualizer */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Architectural Core</span>
          <h2 className="text-2xl font-bold text-slate-900">The VoIP Protocol Quad: SIP · SDP · RTP · RTCP</h2>
          <p className="text-sm text-slate-500 mt-1">
            Every successful VoIP call relies on four complementary protocols working harmoniously together. Click each layer to inspect its exact function.
          </p>
        </div>

        {/* Layer Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['sip', 'sdp', 'rtp', 'rtcp'] as const).map((key) => {
            const isSelected = activeStackLayer === key;
            const item = stackDetails[key];
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveStackLayer(key);
                  audioEngine.playDTMF('2');
                }}
                className={`p-4 rounded-xl text-left border transition ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/50 border-indigo-300'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-slate-900">{key.toUpperCase()}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                    {item.rfc}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium truncate">{item.role}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Deep Dive Card */}
        {(() => {
          const item = stackDetails[activeStackLayer];
          return (
            <div className={`p-6 rounded-2xl border ${item.color} transition-all space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/40 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">Network Ports: {item.port}</div>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-slate-300/60 text-slate-800 self-start sm:self-auto">
                  Primary Duty: {item.role}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Protocol Overview:</span>
                  <p className="leading-relaxed">{item.summary}</p>
                </div>
                <div className="space-y-1 bg-white/70 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Mental Model Analogy:
                  </span>
                  <p className="italic text-slate-800">{item.analogy}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Voice Journey Pipeline */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">End-to-End Walkthrough</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            The 5-Stage Voice Packet Pipeline
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            How your spoken words physically transform from acoustic vibrations into digital packets delivered across the globe in under 150 milliseconds.
          </p>
        </div>

        {/* Step Carousel / Progression */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {pipelineSteps.map((step, idx) => {
            const isActive = activePipelineStep === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActivePipelineStep(idx);
                  audioEngine.playDTMF('3');
                }}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isActive
                    ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <div className="font-bold text-sm text-white truncate">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Expanded Current Step Info */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Active Stage 0{activePipelineStep + 1}
            </span>
            <h3 className="text-lg font-bold text-white">{pipelineSteps[activePipelineStep].title}</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {pipelineSteps[activePipelineStep].desc}
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="text-slate-400">Telecom Specification:</span>
            <span>{pipelineSteps[activePipelineStep].metric}</span>
          </div>
        </div>
      </section>

      {/* Network Architecture Map */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Network Topology</span>
          <h2 className="text-2xl font-bold text-slate-900">VoIP Network Components & Topologies</h2>
          <p className="text-sm text-slate-500 mt-1">
            Click any network entity in the architecture below to learn its exact responsibilities and where it fits in real SIP deployments.
          </p>
        </div>

        {/* Architecture Node selector tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(networkEntities).map(([key, data]) => {
            const isSelected = selectedEntity === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedEntity(key);
                  audioEngine.playDTMF('4');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {data.title}
              </button>
            );
          })}
        </div>

        {/* Selected Entity Card */}
        {(() => {
          const entity = networkEntities[selectedEntity];
          return (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{entity.title}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{entity.subtitle}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-indigo-600">
                  {selectedEntity === 'sbc' ? <Shield className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{entity.role}</p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Engineering Rules:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {entity.keyPoints.map((pt, i) => (
                    <li key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
};
