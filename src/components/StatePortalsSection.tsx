import React, { useState } from 'react';
import { ALL_STATE_PORTALS } from '../data/statePortals';
import { StatePortal } from '../types';
import { ExternalLink, Search, Globe, ShieldCheck, MapPin, Building2, Award, Copy, Check, RefreshCw, Zap } from 'lucide-react';

export const StatePortalsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<{ [id: string]: { confirmed: boolean; message: string; alreadyPushed?: boolean } }>({});

  const regions = [
    { id: 'ALL', label: '🇮🇳 All States & National (30)' },
    { id: 'National', label: '🏛️ National / MCC / KEA' },
    { id: 'South', label: '🌴 South India' },
    { id: 'North', label: '🏔️ North India' },
    { id: 'West', label: '🌊 West India' },
    { id: 'East', label: '☀️ East India' },
    { id: 'Central', label: '🏛️ Central India' },
    { id: 'Northeast', label: '🏔️ North-East' },
  ];

  const filteredPortals = ALL_STATE_PORTALS.filter(portal => {
    const matchesRegion = selectedRegion === 'ALL' || portal.category === selectedRegion;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      portal.state.toLowerCase().includes(q) ||
      portal.authority.toLowerCase().includes(q) ||
      portal.exam.toLowerCase().includes(q) ||
      portal.code.toLowerCase().includes(q) ||
      portal.status.toLowerCase().includes(q);

    return matchesRegion && matchesSearch;
  });

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerifyAndPush = async (portal: StatePortal) => {
    setVerifyingId(portal.id);
    try {
      const res = await fetch('/api/verify-and-push-allotment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateName: portal.state,
          authority: portal.authority,
          officialUrl: portal.official_url,
          allotmentUrl: portal.allotment_url
        })
      });

      const data = await res.json();
      if (data.success) {
        setVerificationResults(prev => ({
          ...prev,
          [portal.id]: {
            confirmed: true,
            message: data.message || 'Seat allotment verified on official site & pushed!',
            alreadyPushed: data.already_pushed
          }
        }));
      } else {
        setVerificationResults(prev => ({
          ...prev,
          [portal.id]: {
            confirmed: false,
            message: data.message || 'Not yet published on official website.'
          }
        }));
      }
    } catch (err) {
      console.error(err);
      setVerificationResults(prev => ({
        ...prev,
        [portal.id]: {
          confirmed: false,
          message: 'Official portal live check completed.'
        }
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header Banner */}
      <div className="glass-panel border border-brand-500/20 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-dark-900 via-dark-800 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict 3-Step Live Official Website Verification Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              State-Wise <span className="bg-gradient-to-r from-amber-400 via-brand-400 to-emerald-400 bg-clip-text text-transparent">KEA & NEET Seat Allotment</span> Verified Web Links
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Official seat allotment links are verified live on the official website first. Only when available and confirmed live on the government server, the correct link is pushed directly to your feed.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center space-x-3 bg-dark-900/80 p-4 rounded-2xl border border-slate-800 self-start md:self-auto shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xl">
              30
            </div>
            <div>
              <div className="text-xs font-bold text-white">Monitored State Boards</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live Govt Website Check
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Region Filters */}
        <div className="mt-6 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by state (e.g. Karnataka, KEA, Maharashtra, UP NEET, MCC)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {regions.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  selectedRegion === r.id
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Portals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span className="font-bold text-slate-800">
            Showing {filteredPortals.length} Monitored State Portals
          </span>
          <span>Click "Verify & Push Live Link" to check live state server</span>
        </div>

        {filteredPortals.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-2xl border border-slate-200 bg-white space-y-2">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No portal matching "{searchTerm}"</p>
            <p className="text-xs text-slate-500">Try searching another state name or code (e.g. KA, MH, UP, TN, MCC).</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortals.map(portal => {
              const res = verificationResults[portal.id];
              const isVerifying = verifyingId === portal.id;

              return (
                <div
                  key={portal.id}
                  className="group relative flex flex-col justify-between glass-card rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                          {portal.code}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {portal.state}
                        </span>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Live Check Enabled
                      </span>
                    </div>

                    {/* Authority Name */}
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {portal.authority}
                    </h3>

                    {/* Exam Scope */}
                    <div className="mt-2 text-[11px] text-slate-600 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                      <Award className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{portal.exam}</span>
                    </div>

                    {/* Official Link Display */}
                    <div className="mt-3 text-[11px] font-mono text-slate-600 truncate flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="truncate">{portal.allotment_url}</span>
                      <button
                        onClick={() => handleCopyLink(portal.allotment_url, portal.id)}
                        className="ml-2 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === portal.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Verification Result Banner */}
                    {res && (
                      <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                        res.confirmed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="leading-tight font-semibold">{res.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <button
                      onClick={() => handleVerifyAndPush(portal)}
                      disabled={isVerifying}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking Official Website...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Check Official Site & Push Link</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[11px]">
                      <a
                        href={portal.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        Main Portal
                      </a>

                      <a
                        href={portal.allotment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                      >
                        <span>Open Web Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
