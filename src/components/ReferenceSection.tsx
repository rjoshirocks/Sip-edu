import React, { useState } from 'react';
import { RESPONSE_CODES } from '../data/sipData';
import { Search } from 'lucide-react';

export const ReferenceSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sipMethods = [
    { name: 'INVITE', role: 'Starts a call or modifies an active call (re-INVITE for hold/codecs).', color: 'bg-emerald-50 border-emerald-200 text-emerald-950' },
    { name: 'ACK', role: 'Confirms receipt of a final response to INVITE (completes 3-way handshake).', color: 'bg-indigo-50 border-indigo-200 text-indigo-950' },
    { name: 'BYE', role: 'Hangs up and terminates an already connected SIP call dialog.', color: 'bg-rose-50 border-rose-200 text-rose-950' },
    { name: 'CANCEL', role: 'Cancels a ringing call before the recipient picks up (before 200 OK).', color: 'bg-amber-50 border-amber-200 text-amber-950' },
    { name: 'REGISTER', role: 'Binds a user SIP URI to their current device IP address on the Registrar.', color: 'bg-sky-50 border-sky-200 text-sky-950' },
    { name: 'OPTIONS', role: 'Checks server/phone reachability and supported capabilities (VoIP ping).', color: 'bg-slate-50 border-slate-200 text-slate-900' },
    { name: 'REFER', role: 'Instructs a phone or PBX to transfer a call to another number.', color: 'bg-violet-50 border-violet-200 text-violet-950' },
    { name: 'NOTIFY', role: 'Delivers status updates for subscriptions, voicemail indicators, or transfers.', color: 'bg-teal-50 border-teal-200 text-teal-950' },
  ];

  const filteredCodes = RESPONSE_CODES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.code.toString().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '1xx':
        return 'text-sky-700 border-sky-200 bg-sky-50/40';
      case '2xx':
        return 'text-emerald-700 border-emerald-200 bg-emerald-50/40';
      case '3xx':
        return 'text-amber-700 border-amber-200 bg-amber-50/40';
      case '4xx':
        return 'text-orange-700 border-orange-200 bg-orange-50/40';
      case '5xx':
        return 'text-violet-700 border-violet-200 bg-violet-50/40';
      case '6xx':
        return 'text-rose-700 border-rose-200 bg-rose-50/40';
      default:
        return 'text-slate-700 border-slate-200 bg-white';
    }
  };

  return (
    <section id="reference" className="space-y-10">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
          04. Quick Reference
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SIP Methods &amp; Status Codes (1xx–6xx)
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          SIP uses verb methods for requests and HTTP-style 3-digit response codes to report progress, success, or errors.
        </p>
      </div>

      {/* SIP Methods Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">8 Essential SIP Request Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sipMethods.map((m) => (
            <div key={m.name} className={`p-4 rounded-2xl border ${m.color} space-y-1.5`}>
              <div className="font-mono font-extrabold text-base">{m.name}</div>
              <p className="text-xs leading-relaxed opacity-90">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Response Codes Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">SIP Response Codes Directory</h3>
            <p className="text-xs text-slate-500">
              Filter by status class or search by code number (e.g., 180, 200, 486, 488)
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter codes..."
              aria-label="Filter SIP response codes"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Classes' },
            { id: '1xx', label: '1xx Provisional' },
            { id: '2xx', label: '2xx Success' },
            { id: '3xx', label: '3xx Redirect' },
            { id: '4xx', label: '4xx Client Error' },
            { id: '5xx', label: '5xx Server Error' },
            { id: '6xx', label: '6xx Global Fail' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map((item) => (
            <div
              key={item.code}
              className={`p-4 rounded-2xl border ${getCategoryColor(item.category)} space-y-2`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-extrabold text-slate-900">
                    {item.code}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{item.title}</span>
                </div>
                <span className="font-mono text-xs font-bold">{item.category}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.meaning}</p>
              <p className="text-[11px] text-slate-600 italic">{item.realWorldAnalogy}</p>
              <p className="text-[11px] text-slate-700 pt-1 border-t border-black/10">
                <strong>Tip:</strong> {item.troubleshootingTip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
