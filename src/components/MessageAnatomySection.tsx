import React from 'react';
import { SIP_HEADERS_DICTIONARY, SDP_DICTIONARY } from '../data/sipData';

export const MessageAnatomySection: React.FC = () => {
  const packetZones = [
    {
      label: '1. Start Line (Request-Line)',
      color: 'text-emerald-300',
      border: 'border-emerald-500/40 bg-emerald-950/30',
      lines: ['INVITE sip:bob@biloxi.com SIP/2.0'],
      note: 'States the SIP method (INVITE), the destination SIP URI, and protocol version (SIP/2.0).',
    },
    {
      label: '2. Routing & Path Headers',
      color: 'text-sky-300',
      border: 'border-sky-500/40 bg-sky-950/30',
      lines: [
        'Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds;rport',
        'Max-Forwards: 70',
        'Contact: <sip:alice@192.168.1.100:5060>',
      ],
      note: 'Via records every hop so responses return cleanly; Contact gives Alice’s direct IP for ACK and BYE.',
    },
    {
      label: '3. Identity & Dialog Headers',
      color: 'text-indigo-300',
      border: 'border-indigo-500/40 bg-indigo-950/30',
      lines: [
        'To: "Bob" <sip:bob@biloxi.com>',
        'From: "Alice" <sip:alice@atlanta.com>;tag=1928301774',
        'Call-ID: a84b4c76e66710@pc33.atlanta.com',
        'CSeq: 314159 INVITE',
        'Content-Type: application/sdp',
        'Content-Length: 168',
      ],
      note: 'Call-ID + From tag + To tag uniquely identify this call session across the entire network.',
    },
    {
      label: '4. SDP Media Offer Body',
      color: 'text-amber-300',
      border: 'border-amber-500/40 bg-amber-950/30',
      lines: [
        'v=0',
        'o=alice 2890844526 2890844526 IN IP4 192.168.1.100',
        's=VoIP Talk',
        'c=IN IP4 192.168.1.100',
        't=0 0',
        'm=audio 5004 RTP/AVP 0 101',
        'a=rtpmap:0 PCMU/8000',
        'a=rtpmap:101 telephone-event/8000',
      ],
      note: 'Separated by a blank CRLF line. Tells Bob: "Send G.711 PCMU audio to 192.168.1.100 on UDP port 5004."',
    },
  ];

  return (
    <section id="anatomy" className="space-y-10">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
          03. Packet Structure
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Inside a Real SIP Message &amp; SDP Payload
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          SIP messages are human-readable plain text modeled after HTTP. Every INVITE has two halves: <strong>SIP signaling headers</strong> on top, and an <strong>SDP media description</strong> below a blank line.
        </p>
      </div>

      {/* Annotated SIP INVITE Visual */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-slate-100 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white">
            Annotated Example: Outgoing SIP INVITE Packet
          </h3>
          <span className="text-xs font-mono text-slate-400">
            RFC 3261 + RFC 4566 (UTF-8 / CRLF Framed)
          </span>
        </div>

        <div className="space-y-4">
          {packetZones.map((zone) => (
            <div
              key={zone.label}
              className={`rounded-2xl border p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center ${zone.border}`}
            >
              <div className="lg:col-span-8 font-mono text-xs space-y-1 overflow-x-auto">
                <div className={`font-sans font-bold text-xs mb-1.5 ${zone.color}`}>
                  {zone.label}
                </div>
                {zone.lines.map((line, i) => (
                  <div key={i} className="text-slate-200 whitespace-pre">
                    {line}
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4 text-xs text-slate-300 leading-relaxed border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4">
                {zone.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Tables: SIP Headers & SDP Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Essential SIP Headers Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Essential SIP Headers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Core header fields appearing in SIP requests and responses
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {SIP_HEADERS_DICTIONARY.slice(0, 7).map((header) => (
              <div key={header.name} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-indigo-700">
                    {header.name}
                    {header.shortName ? ` (${header.shortName})` : ''}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{header.category}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{header.purpose}</p>
                <div className="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 overflow-x-auto">
                  {header.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SDP Parameters Reference */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Key SDP Media Lines</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Single-letter keys inside the SDP body (RFC 4566)
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {SDP_DICTIONARY.map((sdp) => (
              <div key={sdp.prefix} className="p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-amber-700">{sdp.prefix}</span>
                  <span className="font-bold text-xs text-slate-900">{sdp.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{sdp.meaning}</p>
                <div className="font-mono text-[11px] bg-amber-50/70 border border-amber-200/70 rounded-lg px-2.5 py-1 text-amber-950 overflow-x-auto">
                  {sdp.example}
                </div>
                <p className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">VoIP Impact:</strong> {sdp.voipImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
