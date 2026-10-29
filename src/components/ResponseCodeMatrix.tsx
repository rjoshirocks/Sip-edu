import React, { useState } from 'react';
import { RESPONSE_CODES, ResponseCode } from '../data/sipData';
import { Search, Terminal, Zap, Stethoscope, BookOpen, Layers } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const ResponseCodeMatrix: React.FC = () => {
  const [activeView, setActiveView] = useState<'responses' | 'methods'>('responses');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sipMethods = [
    {
      name: 'INVITE',
      rfc: 'RFC 3261',
      purpose: 'Initiates a multimedia session or call between endpoints. Can contain an SDP offer.',
      inDialog: 'Both (Initial call or mid-call re-INVITE for hold/codec renegotiation)',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    },
    {
      name: 'ACK',
      rfc: 'RFC 3261',
      purpose: 'Confirms that the client has received a final response to an INVITE. Unique: receives no response.',
      inDialog: 'End of 3-way handshake',
      color: 'bg-indigo-50 border-indigo-300 text-indigo-900',
    },
    {
      name: 'BYE',
      rfc: 'RFC 3261',
      purpose: 'Terminates an established session/call. Sent by either caller or callee to hang up.',
      inDialog: 'Inside established dialog only',
      color: 'bg-rose-50 border-rose-300 text-rose-900',
    },
    {
      name: 'CANCEL',
      rfc: 'RFC 3261',
      purpose: 'Terminates a pending request that has not yet reached a final response (e.g. caller hangs up while callee phone is still ringing).',
      inDialog: 'Hop-by-hop cancel',
      color: 'bg-amber-50 border-amber-300 text-amber-900',
    },
    {
      name: 'REGISTER',
      rfc: 'RFC 3261',
      purpose: 'Registers the client current physical IP address and port with the SIP Registrar / Location database.',
      inDialog: 'Outside dialog',
      color: 'bg-sky-50 border-sky-300 text-sky-900',
    },
    {
      name: 'OPTIONS',
      rfc: 'RFC 3261',
      purpose: 'Queries a server or phone about its capabilities and alive status ("VoIP Heartbeat / Ping").',
      inDialog: 'Both',
      color: 'bg-slate-50 border-slate-300 text-slate-900',
    },
    {
      name: 'REFER',
      rfc: 'RFC 3515',
      purpose: 'Requests that the recipient transfer the call to a third party (Blind or Attended Transfer).',
      inDialog: 'Inside established dialog',
      color: 'bg-violet-50 border-violet-300 text-violet-900',
    },
    {
      name: 'NOTIFY',
      rfc: 'RFC 3265 / 3515',
      purpose: 'Informs a subscriber about the state of a subscribed event or call transfer progress.',
      inDialog: 'Subscription dialog',
      color: 'bg-teal-50 border-teal-300 text-teal-900',
    },
  ];

  // Filter response codes
  const filteredCodes = RESPONSE_CODES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.code.toString().includes(searchQuery.trim()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.troubleshootingTip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case '1xx':
        return { badge: 'bg-sky-100 text-sky-800 border-sky-200', border: 'border-sky-200 hover:border-sky-400' };
      case '2xx':
        return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', border: 'border-emerald-200 hover:border-emerald-400' };
      case '3xx':
        return { badge: 'bg-amber-100 text-amber-800 border-amber-200', border: 'border-amber-200 hover:border-amber-400' };
      case '4xx':
        return { badge: 'bg-orange-100 text-orange-800 border-orange-200', border: 'border-orange-200 hover:border-orange-400' };
      case '5xx':
        return { badge: 'bg-violet-100 text-violet-800 border-violet-200', border: 'border-violet-200 hover:border-violet-400' };
      case '6xx':
        return { badge: 'bg-rose-100 text-rose-800 border-rose-200', border: 'border-rose-200 hover:border-rose-400' };
      default:
        return { badge: 'bg-slate-100 text-slate-800 border-slate-200', border: 'border-slate-200 hover:border-slate-400' };
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Quick Reference Matrix</span>
          <h2 className="text-2xl font-bold text-slate-900">SIP Response Codes & Methods Cheatsheet</h2>
          <p className="text-sm text-slate-500 mt-1">
            Categorized directory of HTTP-derived SIP status codes (1xx through 6xx) and fundamental request methods.
          </p>
        </div>

        {/* View Switcher: Responses vs Methods */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveView('responses');
              audioEngine.playDTMF('1');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
              activeView === 'responses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Response Codes (1xx–6xx)</span>
          </button>
          <button
            onClick={() => {
              setActiveView('methods');
              audioEngine.playDTMF('2');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
              activeView === 'methods' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>SIP Request Methods</span>
          </button>
        </div>
      </div>

      {activeView === 'responses' ? (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Codes' },
                { id: '1xx', label: '1xx Provisional' },
                { id: '2xx', label: '2xx Success' },
                { id: '3xx', label: '3xx Redirect' },
                { id: '4xx', label: '4xx Client Error' },
                { id: '5xx', label: '5xx Server Error' },
                { id: '6xx', label: '6xx Global Fail' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    audioEngine.playDTMF('3');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, e.g. 486, busy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCodes.map((item) => {
              const theme = getCategoryTheme(item.category);
              return (
                <div
                  key={item.code}
                  className={`p-5 rounded-2xl bg-white border ${theme.border} shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-extrabold text-slate-900">{item.code}</span>
                        <span className="font-bold text-sm text-slate-800">{item.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${theme.badge}`}>
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.meaning}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 space-y-0.5">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Analogy:
                      </span>
                      <p className="italic text-[11px]">{item.realWorldAnalogy}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 space-y-0.5">
                      <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1.5">
                        <Stethoscope className="w-3 h-3 text-indigo-600" />
                        Engineer Troubleshooting Tip:
                      </span>
                      <p className="text-[11px] leading-relaxed">{item.troubleshootingTip}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SIP Methods View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sipMethods.map((m) => (
            <div
              key={m.name}
              className={`p-5 rounded-2xl border ${m.color} space-y-3 shadow-xs`}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-extrabold">{m.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 font-semibold">
                    {m.rfc}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70">
                  {m.inDialog}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{m.purpose}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
