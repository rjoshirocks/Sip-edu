import React, { useState } from 'react';
import { SIP_HEADERS_DICTIONARY, SDP_DICTIONARY, SipHeaderInfo, SdpLineInfo } from '../data/sipData';
import { FileCode2, Copy, Check, Info, Sparkles, Sliders, ExternalLink } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const PacketDissector: React.FC = () => {
  const [selectedPacketType, setSelectedPacketType] = useState<'invite' | '200ok' | 'register' | 'bye'>('invite');
  const [selectedHeaderName, setSelectedHeaderName] = useState<string>('Via');
  const [selectedSdpPrefix, setSelectedSdpPrefix] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Live packet customization state
  const [callerName, setCallerName] = useState<string>('Alice');
  const [callerDomain, setCallerDomain] = useState<string>('company.com');
  const [calleeName, setCalleeName] = useState<string>('Bob');
  const [calleeDomain, setCalleeDomain] = useState<string>('partner.org');
  const [selectedCodec, setSelectedCodec] = useState<'pcmu' | 'opus' | 'g729'>('pcmu');
  const [transportProtocol, setTransportProtocol] = useState<'UDP' | 'TCP' | 'TLS'>('UDP');

  // Compute live customized packet
  const codecDetails = {
    pcmu: { num: '0', name: 'PCMU/8000', label: 'G.711 u-Law (Standard PSTN 64kbps)' },
    opus: { num: '111', name: 'opus/48000/2', label: 'Opus HD (Modern Wideband Audio)' },
    g729: { num: '18', name: 'G729/8000', label: 'G.729 (Compressed 8kbps)' },
  };

  const activeCodec = codecDetails[selectedCodec];
  const port = transportProtocol === 'TLS' ? '5061' : '5060';

  const generatePacketString = () => {
    if (selectedPacketType === 'invite') {
      return `INVITE sip:${calleeName.toLowerCase()}@${calleeDomain} SIP/2.0
Via: SIP/2.0/${transportProtocol} 192.168.1.100:${port};branch=z9hG4bK776asdhds;rport
Max-Forwards: 70
To: "${calleeName}" <sip:${calleeName.toLowerCase()}@${calleeDomain}>
From: "${callerName}" <sip:${callerName.toLowerCase()}@${callerDomain}>;tag=1928301774
Call-ID: a84b4c76e66710@192.168.1.100
CSeq: 314159 INVITE
Contact: <sip:${callerName.toLowerCase()}@192.168.1.100:${port};transport=${transportProtocol.toLowerCase()}>
Allow: INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY
User-Agent: PolycomVVX450-5.9.6
Content-Type: application/sdp
Content-Length: 182

v=0
o=${callerName.toLowerCase()} 2890844526 2890844526 IN IP4 192.168.1.100
s=VoIP Call Session
c=IN IP4 192.168.1.100
t=0 0
m=audio 5004 RTP/AVP ${activeCodec.num} 101
a=rtpmap:${activeCodec.num} ${activeCodec.name}
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-16
a=sendrecv`;
    }

    if (selectedPacketType === '200ok') {
      return `SIP/2.0 200 OK
Via: SIP/2.0/${transportProtocol} 192.168.1.100:${port};branch=z9hG4bK776asdhds;received=203.0.113.88;rport=49201
To: "${calleeName}" <sip:${calleeName.toLowerCase()}@${calleeDomain}>;tag=a6c85cf
From: "${callerName}" <sip:${callerName.toLowerCase()}@${callerDomain}>;tag=1928301774
Call-ID: a84b4c76e66710@192.168.1.100
CSeq: 314159 INVITE
Contact: <sip:${calleeName.toLowerCase()}@192.168.2.200:${port}>
User-Agent: Asterisk PBX 20.4
Content-Type: application/sdp
Content-Length: 164

v=0
o=${calleeName.toLowerCase()} 2890844527 2890844527 IN IP4 192.168.2.200
s=VoIP Call Session
c=IN IP4 192.168.2.200
t=0 0
m=audio 7078 RTP/AVP ${activeCodec.num}
a=rtpmap:${activeCodec.num} ${activeCodec.name}
a=sendrecv`;
    }

    if (selectedPacketType === 'register') {
      return `REGISTER sip:${callerDomain} SIP/2.0
Via: SIP/2.0/${transportProtocol} 192.168.1.100:${port};branch=z9hG4bKnashds9;rport
Max-Forwards: 70
To: <sip:${callerName.toLowerCase()}@${callerDomain}>
From: <sip:${callerName.toLowerCase()}@${callerDomain}>;tag=4a82b01
Call-ID: bb0293847291@192.168.1.100
CSeq: 2 REGISTER
Contact: <sip:${callerName.toLowerCase()}@192.168.1.100:${port}>;expires=3600
Authorization: Digest username="${callerName.toLowerCase()}", realm="${callerDomain}", nonce="ea9c8e88df84f", uri="sip:${callerDomain}", response="6629fae49393f9c065f", algorithm=MD5
User-Agent: Linphone-iOS/5.1
Content-Length: 0`;
    }

    return `BYE sip:${calleeName.toLowerCase()}@192.168.2.200:${port} SIP/2.0
Via: SIP/2.0/${transportProtocol} 192.168.1.100:${port};branch=z9hG4bKnashds7;rport
Max-Forwards: 70
To: "${calleeName}" <sip:${calleeName.toLowerCase()}@${calleeDomain}>;tag=a6c85cf
From: "${callerName}" <sip:${callerName.toLowerCase()}@${callerDomain}>;tag=1928301774
Call-ID: a84b4c76e66710@192.168.1.100
CSeq: 314160 BYE
User-Agent: PolycomVVX450-5.9.6
Content-Length: 0`;
  };

  const rawPacket = generatePacketString();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawPacket);
    setCopied(true);
    audioEngine.playConnectedChime();
    setTimeout(() => setCopied(false), 2000);
  };

  // Find info for selected header
  const headerInfo: SipHeaderInfo | undefined = SIP_HEADERS_DICTIONARY.find(
    (h) => h.name.toLowerCase() === selectedHeaderName.toLowerCase()
  );

  const sdpInfo: SdpLineInfo | undefined = SDP_DICTIONARY.find(
    (s) => s.prefix.startsWith(selectedSdpPrefix || '$$$')
  );

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Deep Packet Inspection</span>
          <h2 className="text-2xl font-bold text-slate-900">SIP & SDP Message Dissector</h2>
          <p className="text-sm text-slate-500 mt-1">
            Click any header or SDP attribute line below to dissect its RFC requirements, common pitfalls, and architectural purpose.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Packet!' : 'Copy Raw RFC SIP'}</span>
          </button>
        </div>
      </div>

      {/* Packet Type Selection */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'invite', label: 'INVITE (Initial Offer)' },
          { id: '200ok', label: '200 OK (Handshake Answer)' },
          { id: 'register', label: 'REGISTER (Digest Auth)' },
          { id: 'bye', label: 'BYE (Session Tear Down)' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedPacketType(t.id as any);
              audioEngine.playDTMF('8');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              selectedPacketType === t.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Packet Builder Customizer Drawer */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Interactive Message Customizer (Updates SIP text in real time)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">Caller (From)</label>
            <input
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-500 font-medium block mb-1">Callee (To)</label>
            <input
              type="text"
              value={calleeName}
              onChange={(e) => setCalleeName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-500 font-medium block mb-1">Audio Codec (SDP)</label>
            <select
              value={selectedCodec}
              onChange={(e) => setSelectedCodec(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="pcmu">G.711 u-law (PCMU)</option>
              <option value="opus">Opus HD (48kHz)</option>
              <option value="g729">G.729 (8kbps)</option>
            </select>
          </div>
          <div>
            <label className="text-slate-500 font-medium block mb-1">Transport Layer</label>
            <select
              value={transportProtocol}
              onChange={(e) => setTransportProtocol(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="UDP">UDP (Standard 5060)</option>
              <option value="TCP">TCP (Stream 5060)</option>
              <option value="TLS">TLS (Secure SIPS 5061)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dual Stage: Live Dissected Packet on Left, Detailed Inspector Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Packet Dissecting Text (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-md font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
            <span>RFC 3261 Text Framing (CRLF Delimited)</span>
            <span>Click any header or SDP tag</span>
          </div>

          <div className="space-y-1 overflow-x-auto leading-relaxed">
            {rawPacket.split('\n').map((line, idx) => {
              if (idx === 0) {
                // Request/Status start line
                return (
                  <div key={idx} className="text-emerald-400 font-bold py-1 border-b border-slate-800">
                    {line}
                  </div>
                );
              }

              if (line.trim() === '') {
                // Empty CRLF line separating headers from SDP
                return (
                  <div key={idx} className="my-2 py-1 text-center text-slate-500 border-y border-dashed border-slate-800 text-[10px]">
                    ── Empty CRLF Line: End of SIP Headers / Start of Body ──
                  </div>
                );
              }

              // Check if it's SDP line (starts with letter=)
              const sdpMatch = line.match(/^([a-z]=)/);
              if (sdpMatch) {
                const prefix = sdpMatch[1];
                const isSelected = selectedSdpPrefix === prefix;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedSdpPrefix(prefix);
                      setSelectedHeaderName('');
                      audioEngine.playDTMF('9');
                    }}
                    className={`cursor-pointer px-2 py-0.5 rounded transition ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border-l-2 border-amber-400'
                        : 'hover:bg-slate-900 text-amber-200/90'
                    }`}
                  >
                    <span className="font-bold text-amber-400">{line.substring(0, 2)}</span>
                    <span>{line.substring(2)}</span>
                  </div>
                );
              }

              // It's a SIP Header line
              const colonIdx = line.indexOf(':');
              const headerKey = colonIdx > 0 ? line.substring(0, colonIdx) : '';
              const headerVal = colonIdx > 0 ? line.substring(colonIdx + 1) : line;
              const isSelected = selectedHeaderName.toLowerCase() === headerKey.toLowerCase();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (headerKey) {
                      setSelectedHeaderName(headerKey);
                      setSelectedSdpPrefix(null);
                      audioEngine.playDTMF('1');
                    }
                  }}
                  className={`cursor-pointer px-2 py-0.5 rounded transition ${
                    isSelected
                      ? 'bg-indigo-600/30 text-white font-bold border-l-2 border-indigo-400'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="text-sky-300 font-bold">{headerKey}:</span>
                  <span className="text-slate-300">{headerVal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Inspector Details Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {headerInfo ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">SIP Header Reference</span>
                  <h3 className="text-xl font-bold text-slate-900">{headerInfo.name} Header</h3>
                  {headerInfo.shortName && (
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Compact RFC form: {headerInfo.shortName}</div>
                  )}
                </div>
                <div className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  {headerInfo.category}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose:</span>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {headerInfo.purpose}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Example:</span>
                <div className="p-2.5 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto">
                  {headerInfo.example}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Common Pitfalls & RFC Gotchas:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                  {headerInfo.commonBugs}
                </p>
              </div>
            </div>
          ) : sdpInfo ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">SDP Parameter Reference</span>
                  <h3 className="text-xl font-bold text-slate-900">{sdpInfo.prefix} ({sdpInfo.name})</h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  RFC 4566
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meaning:</span>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {sdpInfo.meaning}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Example:</span>
                <div className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto">
                  {sdpInfo.example}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Impact on VoIP Audio Stream:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
                  {sdpInfo.voipImpact}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Info className="w-6 h-6 mx-auto text-slate-300" />
              <p>Click any line on the left packet viewer to inspect its meaning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
