import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall, Volume2, Mic, MicOff, RefreshCw, Terminal, ArrowRight, ShieldCheck, Radio, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface LoggedPacket {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  methodOrCode: string;
  summary: string;
  type: 'sip-request' | 'sip-response' | 'rtp';
  rawStartLine: string;
}

export const SoftphoneSimulator: React.FC = () => {
  // Alice Phone State
  const [aliceNumber, setAliceNumber] = useState<string>('102');
  const [aliceState, setAliceState] = useState<'idle' | 'calling' | 'connected' | 'busy'>('idle');
  const [aliceMuted, setAliceMuted] = useState<boolean>(false);

  // Bob Phone State
  const [bobState, setBobState] = useState<'idle' | 'ringing' | 'connected'>('idle');

  // Call timer
  const [callDuration, setCallDuration] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Live Packet Log
  const [packetLogs, setPacketLogs] = useState<LoggedPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<LoggedPacket | null>(null);

  // Auto increment time during active call
  useEffect(() => {
    if (aliceState === 'connected' && bobState === 'connected') {
      timerIntervalRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [aliceState, bobState]);

  const addPacketLog = (packet: Omit<LoggedPacket, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newPacket: LoggedPacket = {
      ...packet,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
    };
    setPacketLogs((prev) => [newPacket, ...prev.slice(0, 19)]);
    audioEngine.playPacketSwoosh();
  };

  // Dialpad key press
  const handleKeypadPress = (digit: string) => {
    audioEngine.playDTMF(digit);
    if (aliceState === 'idle') {
      setAliceNumber((prev) => (prev.length < 10 ? prev + digit : prev));
    }
  };

  const handleBackspace = () => {
    audioEngine.playDTMF('7');
    setAliceNumber((prev) => prev.slice(0, -1));
  };

  // Alice places a call
  const handleInitiateCall = () => {
    if (aliceNumber !== '102') {
      // 404 Not Found scenario
      setAliceState('calling');
      audioEngine.startRingbackTone();
      addPacketLog({
        from: 'Alice (101)',
        to: 'SIP PBX',
        methodOrCode: 'INVITE',
        summary: `INVITE sip:${aliceNumber}@pbx.local`,
        type: 'sip-request',
        rawStartLine: `INVITE sip:${aliceNumber}@pbx.local SIP/2.0`,
      });

      setTimeout(() => {
        audioEngine.stopContinuousTone();
        audioEngine.startBusyTone();
        setAliceState('busy');
        addPacketLog({
          from: 'SIP PBX',
          to: 'Alice (101)',
          methodOrCode: '404 Not Found',
          summary: `SIP/2.0 404 User '${aliceNumber}' Not Found in Dialplan`,
          type: 'sip-response',
          rawStartLine: 'SIP/2.0 404 Not Found',
        });
      }, 1500);
      return;
    }

    setAliceState('calling');
    audioEngine.startRingbackTone();

    // 1. Alice -> PBX: INVITE
    addPacketLog({
      from: 'Alice (101)',
      to: 'SIP PBX',
      methodOrCode: 'INVITE',
      summary: 'INVITE sip:102@pbx.local (SDP: PCMU 64kbps, Port 16400)',
      type: 'sip-request',
      rawStartLine: 'INVITE sip:102@pbx.local SIP/2.0',
    });

    // 2. PBX -> Alice: 100 Trying
    setTimeout(() => {
      addPacketLog({
        from: 'SIP PBX',
        to: 'Alice (101)',
        methodOrCode: '100 Trying',
        summary: 'SIP/2.0 100 Trying (Searching routing location for Bob 102)',
        type: 'sip-response',
        rawStartLine: 'SIP/2.0 100 Trying',
      });

      // 3. PBX -> Bob: INVITE
      addPacketLog({
        from: 'SIP PBX',
        to: 'Bob (102)',
        methodOrCode: 'INVITE',
        summary: 'INVITE sip:bob@192.168.1.102:5060 (Forwarded)',
        type: 'sip-request',
        rawStartLine: 'INVITE sip:bob@192.168.1.102:5060 SIP/2.0',
      });

      // 4. Bob phone starts ringing
      setBobState('ringing');

      // 5. Bob -> PBX -> Alice: 180 Ringing
      addPacketLog({
        from: 'Bob (102)',
        to: 'Alice (via PBX)',
        methodOrCode: '180 Ringing',
        summary: 'SIP/2.0 180 Ringing (Bob handset alerted, playing ringback)',
        type: 'sip-response',
        rawStartLine: 'SIP/2.0 180 Ringing',
      });
    }, 700);
  };

  // Bob answers
  const handleAnswerCall = () => {
    audioEngine.stopContinuousTone();
    audioEngine.playConnectedChime();

    setBobState('connected');
    setAliceState('connected');
    setCallDuration(0);

    // Bob sends 200 OK
    addPacketLog({
      from: 'Bob (102)',
      to: 'Alice (via PBX)',
      methodOrCode: '200 OK',
      summary: 'SIP/2.0 200 OK (SDP Answer: PCMU 64kbps, Port 17002)',
      type: 'sip-response',
      rawStartLine: 'SIP/2.0 200 OK',
    });

    // Alice sends ACK
    setTimeout(() => {
      addPacketLog({
        from: 'Alice (101)',
        to: 'Bob (102)',
        methodOrCode: 'ACK',
        summary: 'ACK sip:bob@192.168.1.102:5060 (3-Way Handshake Finalized)',
        type: 'sip-request',
        rawStartLine: 'ACK sip:bob@192.168.1.102:5060 SIP/2.0',
      });

      // RTP media stream initiated
      addPacketLog({
        from: 'Alice <---> Bob',
        to: 'Peer-to-Peer',
        methodOrCode: 'RTP STREAM',
        summary: 'Bi-directional RTP Audio stream established (UDP G.711u 64kbps)',
        type: 'rtp',
        rawStartLine: 'RTP (Real-time Transport Protocol) Active',
      });
    }, 400);
  };

  // Bob declines
  const handleDeclineCall = () => {
    audioEngine.stopContinuousTone();
    audioEngine.startBusyTone();

    setBobState('idle');
    setAliceState('busy');

    addPacketLog({
      from: 'Bob (102)',
      to: 'Alice (via PBX)',
      methodOrCode: '603 Decline',
      summary: 'SIP/2.0 603 Decline (Bob explicitly pressed Reject)',
      type: 'sip-response',
      rawStartLine: 'SIP/2.0 603 Decline',
    });

    setTimeout(() => {
      addPacketLog({
        from: 'Alice (101)',
        to: 'SIP PBX',
        methodOrCode: 'ACK',
        summary: 'ACK (Hop-by-hop acknowledgment to 603)',
        type: 'sip-request',
        rawStartLine: 'ACK sip:102@pbx.local SIP/2.0',
      });
    }, 300);
  };

  // Hangup call
  const handleHangup = (initiator: 'alice' | 'bob') => {
    audioEngine.stopContinuousTone();
    audioEngine.playHangupTone();

    const other = initiator === 'alice' ? 'Bob (102)' : 'Alice (101)';
    const sender = initiator === 'alice' ? 'Alice (101)' : 'Bob (102)';

    addPacketLog({
      from: sender,
      to: other,
      methodOrCode: 'BYE',
      summary: `BYE sip:${initiator === 'alice' ? '102' : '101'} (Terminating session)`,
      type: 'sip-request',
      rawStartLine: 'BYE SIP/2.0',
    });

    setTimeout(() => {
      addPacketLog({
        from: other,
        to: sender,
        methodOrCode: '200 OK',
        summary: 'SIP/2.0 200 OK (BYE acknowledged, audio sockets destroyed)',
        type: 'sip-response',
        rawStartLine: 'SIP/2.0 200 OK',
      });
    }, 300);

    setAliceState('idle');
    setBobState('idle');
    setCallDuration(0);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 py-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Hands-on Telephony Lab</span>
          <h2 className="text-2xl font-bold text-slate-900">Interactive Softphone & PBX Simulator</h2>
          <p className="text-sm text-slate-500 mt-1">
            Dial between softphones, trigger authentic telecom tones, inspect live SIP packet exchanges, and watch direct RTP voice streams.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Real DTMF Audio Enabled</span>
        </div>
      </div>

      {/* Main Dual Softphone Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Alice Softphone (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Phone Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Alice Softphone</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    Ext 101
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">sip:alice@pbx.local · 192.168.1.101</div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  aliceState === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : aliceState === 'calling'
                    ? 'bg-amber-500 animate-pulse'
                    : aliceState === 'busy'
                    ? 'bg-rose-500'
                    : 'bg-slate-300'
                }`}
                title={`Status: ${aliceState}`}
              />
            </div>

            {/* LCD Display */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-center space-y-1 shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>LINE 1</span>
                <span>{aliceState === 'connected' ? formatTimer(callDuration) : aliceState.toUpperCase()}</span>
              </div>
              <div className="text-2xl font-bold tracking-wider text-emerald-400 min-h-[36px] flex items-center justify-center">
                {aliceState === 'idle' ? (aliceNumber || 'Enter Number') : `Connected: ${aliceNumber}`}
              </div>
              {aliceState === 'calling' && (
                <div className="text-xs text-amber-300 animate-pulse">Outbound Calling... (Playing Ringback)</div>
              )}
              {aliceState === 'busy' && (
                <div className="text-xs text-rose-400">Reorder / Fast Busy Tone (486/404)</div>
              )}
              {aliceState === 'connected' && (
                <div className="text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>RTP Audio: G.711u (64 kbps)</span>
                </div>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 font-bold text-slate-800 text-lg transition flex flex-col items-center justify-center shadow-xs"
                >
                  <span>{digit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Call Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              {aliceState === 'idle' ? (
                <>
                  <button
                    onClick={handleInitiateCall}
                    disabled={!aliceNumber}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Dial (INVITE)</span>
                  </button>
                  <button
                    onClick={handleBackspace}
                    disabled={!aliceNumber}
                    className="px-4 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleHangup('alice')}
                  className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Hang Up (BYE / CANCEL)</span>
                </button>
              )}
            </div>

            {/* In-Call controls */}
            {aliceState === 'connected' && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <button
                  onClick={() => setAliceMuted(!aliceMuted)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                    aliceMuted ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {aliceMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{aliceMuted ? 'Muted (Inactive)' : 'Mute Mic'}</span>
                </button>
                <span className="text-slate-500">Tap dialpad to send DTMF</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: SIP PBX Switchboard (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Terminal className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">SIP Proxy & PBX</h4>
            <div className="text-[11px] font-mono text-indigo-600">203.0.113.10</div>
            <div className="text-[10px] text-slate-400">Port 5060 UDP</div>
          </div>

          {/* Dynamic Status Arrow Indicator */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center w-full space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIP Router</span>
            <div className="text-xs font-semibold text-slate-800">
              {aliceState === 'calling' && 'Routing INVITE'}
              {aliceState === 'connected' && 'Session Active'}
              {aliceState === 'idle' && bobState === 'idle' && 'Waiting Calls'}
              {aliceState === 'busy' && '486 / 404 Relay'}
            </div>
          </div>

          {/* Media RTP direct path banner */}
          {aliceState === 'connected' && bobState === 'connected' && (
            <div className="p-2.5 rounded-xl bg-violet-100 border border-violet-300 text-violet-800 text-[10px] font-bold text-center animate-pulse">
              ⚡ Direct RTP Media Bypassing PBX!
            </div>
          )}
        </div>

        {/* Right: Bob Softphone (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Phone Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Bob Softphone</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Ext 102
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">sip:bob@pbx.local · 192.168.1.102</div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  bobState === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : bobState === 'ringing'
                    ? 'bg-amber-500 animate-bounce'
                    : 'bg-slate-300'
                }`}
                title={`Status: ${bobState}`}
              />
            </div>

            {/* Bob LCD Display */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-center space-y-1 shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>LINE 1</span>
                <span>{bobState === 'connected' ? formatTimer(callDuration) : bobState.toUpperCase()}</span>
              </div>
              <div className="text-2xl font-bold tracking-wider text-emerald-400 min-h-[36px] flex items-center justify-center">
                {bobState === 'ringing'
                  ? 'Incoming: Alice (101)'
                  : bobState === 'connected'
                  ? 'Connected: Alice (101)'
                  : 'Ready for Calls'}
              </div>
              {bobState === 'ringing' && (
                <div className="text-xs text-amber-300 animate-pulse">180 Ringing (Handset Alerting)</div>
              )}
              {bobState === 'connected' && (
                <div className="text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>RTP Audio: PCMU / 8000Hz</span>
                </div>
              )}
            </div>

            {/* Quick Bob Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-slate-900 block">Bob Station Configuration:</span>
              <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                <span>Registered URI:</span>
                <span className="text-indigo-600 font-semibold">sip:102@pbx.local</span>
              </div>
              <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                <span>Contact Socket:</span>
                <span>192.168.1.102:5060</span>
              </div>
              <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                <span>SDP Codecs:</span>
                <span>PCMU (0), Opus (111)</span>
              </div>
            </div>
          </div>

          {/* Bob Call Actions */}
          <div className="space-y-3 pt-2">
            {bobState === 'ringing' ? (
              <div className="flex gap-2">
                <button
                  onClick={handleAnswerCall}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Answer (200 OK)</span>
                </button>
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Reject (603)</span>
                </button>
              </div>
            ) : bobState === 'connected' ? (
              <button
                onClick={() => handleHangup('bob')}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up (Send BYE)</span>
              </button>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-200">
                Bob phone is idle on the desk waiting for Alice to dial.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Packet Sniffer / Traffic Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Live SIP / RTP Packet Sniffer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {packetLogs.length} Packets Captured
            </span>
          </div>
          {packetLogs.length > 0 && (
            <button
              onClick={() => {
                setPacketLogs([]);
                setSelectedPacket(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 transition"
            >
              Clear Log
            </button>
          )}
        </div>

        {packetLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No packets transmitted yet. Click "Dial (INVITE)" on Alice phone above to initiate live signaling!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Protocol</th>
                  <th className="p-2.5">From</th>
                  <th className="p-2.5">To</th>
                  <th className="p-2.5">Method / Status</th>
                  <th className="p-2.5">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {packetLogs.map((p) => {
                  const isSelected = selectedPacket?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPacket(p)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-50 font-bold text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="p-2.5 text-slate-400">{p.timestamp}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.type === 'rtp'
                              ? 'bg-violet-100 text-violet-800'
                              : p.methodOrCode.includes('200')
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.methodOrCode.includes('404') || p.methodOrCode.includes('603')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {p.type === 'rtp' ? 'RTP' : 'SIP'}
                        </span>
                      </td>
                      <td className="p-2.5">{p.from}</td>
                      <td className="p-2.5">{p.to}</td>
                      <td className="p-2.5 font-bold text-slate-900">{p.methodOrCode}</td>
                      <td className="p-2.5 text-slate-600 truncate max-w-xs">{p.summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Packet Inspection */}
        {selectedPacket && (
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1">
              <span>{selectedPacket.rawStartLine}</span>
              <span className="text-[10px] text-slate-400">{selectedPacket.timestamp}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-sky-300">Route: </span>
              <span>{selectedPacket.from} ⟶ {selectedPacket.to}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-amber-300">Payload Details: </span>
              <span>{selectedPacket.summary}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
