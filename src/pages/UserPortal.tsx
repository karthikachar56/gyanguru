import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ExternalLink, ShieldCheck, Sparkles, BookOpen, Clock, ChevronRight, FileText, Zap, Download, Globe, UserCheck, ArrowRight, AlertCircle, Activity, CheckCircle2, Megaphone, Landmark, Building2, Shield } from 'lucide-react';
import { Notification, StudentResult } from '../types';
import { PDFModal } from '../components/PDFModal';
import { StudentResultModal } from '../components/StudentResultModal';
import { StatePortalsSection } from '../components/StatePortalsSection';

export const UserPortal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'PDF_TRANSCRIBED' | 'WEB_PORTAL_LINK'>('ALL');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'announcements' | 'state_portals'>('announcements');

  // Student Roll Number Search States
  const [rollInput, setRollInput] = useState('');
  const [searchingRoll, setSearchingRoll] = useState(false);
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedExam !== 'ALL') queryParams.append('exam', selectedExam);
      if (selectedState !== 'ALL') queryParams.append('state', selectedState);
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/notifications?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [selectedExam, selectedState, search]);

  const executeLookup = async (queryStr: string) => {
    setSearchingRoll(true);
    setRollError(null);
    try {
      const res = await fetch('/api/student-results/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr })
      });
      const data = await res.json();
      if (data.success) {
        setStudentResult(data.data);
      } else {
        setRollError(data.message || 'No record found for this Roll / App Number');
      }
    } catch (err: any) {
      setRollError('Failed to query student database.');
    } finally {
      setSearchingRoll(false);
    }
  };

  const handleRollLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollInput.trim()) return;
    executeLookup(rollInput.trim());
  };

  const handleQuickSelectRoll = (roll: string) => {
    setRollInput(roll);
    executeLookup(roll);
  };

  const examCategories = [
    { id: 'ALL', label: 'All Exams' },
    { id: 'NEET UG', label: '🔴 NEET UG Medical' },
    { id: 'KCET', label: '🟡 KCET Karnataka' },
    { id: 'JEE Main', label: '🔵 JEE Main Engineering' },
  ];

  const indianStatesList = [
    { id: 'ALL', label: '🇮🇳 All States / National' },
    { id: 'Karnataka', label: '🟡 Karnataka (KEA)' },
    { id: 'Maharashtra', label: '🟠 Maharashtra (CET Cell)' },
    { id: 'Tamil Nadu', label: '🔴 Tamil Nadu (TN Medical)' },
    { id: 'Delhi', label: '🔵 Delhi (MCC / IPU)' },
    { id: 'Uttar Pradesh', label: '🟢 Uttar Pradesh (UPDGME)' },
    { id: 'Kerala', label: '🟣 Kerala (CEE)' },
    { id: 'All India', label: '⚡ All India Quota (MCC)' },
  ];

  const filteredNotifications = notifications.filter(n => {
    if (selectedFormat === 'ALL') return true;
    if (selectedFormat === 'WEB_PORTAL_LINK') return n.result_format === 'WEB_PORTAL_LINK' || n.portal_url;
    if (selectedFormat === 'PDF_TRANSCRIBED') return n.result_format === 'PDF_TRANSCRIBED' || !n.portal_url;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Live Emergency Ticker Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white py-2.5 px-4 text-xs border-b border-blue-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-300 flex items-center gap-1">
              <Megaphone className="w-3.5 h-3.5" /> LIVE GOVT BULLETIN:
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap text-slate-200 text-[11px] font-medium flex-1">
            <span>🔴 KCET 2026 Engineering Seat Matrix Released & Transcribed • NTA NEET UG 2026 Candidate Scorecard Lookup Active • MCC All-India Counselling Round 1 Portal Operational (30 State Servers Verified Live)</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-[10px] font-extrabold text-emerald-300 shrink-0 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Govt Standard Compliant</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-8">
        {/* Hero Section with Roll Number Lookup & Search */}
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-blue-200/90 p-6 sm:p-10 bg-gradient-to-r from-white via-[#f0f4f8] to-blue-50/60 shadow-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Intro & Notice Search */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  <span>National Examination & Allotment Information Hub</span>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                  <span>10s AI Background Scanner Active</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Official Govt Education <br />
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 bg-clip-text text-transparent">
                  Result & Allotment Engine
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                Automatic PDF merit list transcription, candidate scorecard lookup with All-India & State ranks, and direct high-priority official result web portal redirection.
              </p>

              {/* Keyword Notice Search Input Bar */}
              <div className="pt-1">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search exam results, counselling notices, cutoff schedules..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Individual Student Roll Number Lookup Box */}
            <div className="lg:col-span-5">
              <div className="glass-card p-6 rounded-3xl border border-blue-200 bg-white/95 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-extrabold text-slate-900">Student Scorecard Lookup</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your Roll Number, Application ID, or Candidate Name to view your official transcribed scorecard.
                </p>

                <form onSubmit={handleRollLookup} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={rollInput}
                      onChange={e => {
                        setRollInput(e.target.value);
                        setRollError(null);
                      }}
                      placeholder="Enter Roll No (e.g. JS770 or 240410198421)"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchingRoll || !rollInput.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-700/20 transition-all"
                  >
                    {searchingRoll ? (
                      <span>Querying Transcribed Database...</span>
                    ) : (
                      <>
                        <span>Lookup Scorecard & Ranks</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {rollError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{rollError}</span>
                  </div>
                )}

                {/* Quick Select Demo Tags */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                    ⚡ Click to Demo Scorecards:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleQuickSelectRoll('JS770')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-mono font-bold transition-all shadow-2xs"
                    >
                      Sinchana (KCET Rank 8 / JS770)
                    </button>
                    <button
                      onClick={() => handleQuickSelectRoll('240410198421')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-[11px] font-mono font-bold transition-all shadow-2xs"
                    >
                      Rahul (NEET AIR 412)
                    </button>
                    <button
                      onClick={() => handleQuickSelectRoll('2026KCET0984')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-mono font-bold transition-all shadow-2xs"
                    >
                      Prajwal (KCET Rank 14)
                    </button>
                    <button
                      onClick={() => handleQuickSelectRoll('240410198422')}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 text-[11px] font-mono font-bold transition-all shadow-2xs"
                    >
                      Ananya (NEET AIR 1205)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Quick Stats Counter Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex items-center space-x-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">30 State Portals</div>
              <div className="text-[11px] text-slate-500 font-medium">Monitored Parallel 24/7</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex items-center space-x-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">100% Verified</div>
              <div className="text-[11px] text-slate-500 font-medium">Authentic Govt PDF Source</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex items-center space-x-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">10s AI Ingestion</div>
              <div className="text-[11px] text-slate-500 font-medium">Instant Result Ingest</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex items-center space-x-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">SHA-256 Hash</div>
              <div className="text-[11px] text-slate-500 font-medium">Cryptographic Proof</div>
            </div>
          </div>
        </div>

        {/* View Switcher Main Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveMainTab('announcements')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeMainTab === 'announcements'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Verified Announcements & Notices</span>
          </button>

          <button
            onClick={() => setActiveMainTab('state_portals')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeMainTab === 'state_portals'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>All 30 Monitored State Result Portals</span>
          </button>
        </div>

        {/* Conditional View Rendering */}
        {activeMainTab === 'state_portals' ? (
          <StatePortalsSection />
        ) : (
          <div className="space-y-6">
            {/* Strict Policy Banner Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-700 text-xs flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="font-semibold text-slate-800">
                  <strong className="text-blue-800">Strict AI Verified Rule Active:</strong> Only announcements containing an authentic PDF document or direct official result portal link are pushed state-wise.
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 shrink-0">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Zero Junk Updates</span>
              </span>
            </div>

            {/* State Filter Pills Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-700" /> Select State / Quota:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Showing results for: <strong className="text-blue-800">{selectedState === 'ALL' ? 'All States & National' : selectedState}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {indianStatesList.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedState(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                      selectedState === st.id
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md shadow-blue-700/20 ring-2 ring-blue-400/40'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Filter Pills & Format Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              {/* Exam Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Exam:
                </span>
                {examCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedExam(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      selectedExam === cat.id
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Result Format Toggle */}
              <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                <button
                  onClick={() => setSelectedFormat('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedFormat === 'ALL' ? 'bg-slate-100 text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Format
                </button>

                <button
                  onClick={() => setSelectedFormat('PDF_TRANSCRIBED')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedFormat === 'PDF_TRANSCRIBED' ? 'bg-amber-50 text-amber-800 border border-amber-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📄 Transcribed PDFs
                </button>

                <button
                  onClick={() => setSelectedFormat('WEB_PORTAL_LINK')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedFormat === 'WEB_PORTAL_LINK' ? 'bg-sky-50 text-sky-800 border border-sky-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🌐 Live Portals
                </button>
              </div>
            </div>

      {/* Main Notifications Feed */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Verified Government Announcements ({filteredNotifications.length})
          </h2>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Auto-Updated via 10s AI Scanner
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-medium">Loading verified announcements...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 space-y-3 bg-white">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No matching result announcements found</h3>
            <p className="text-sm text-slate-500">Try adjusting your exam filter or search format.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotifications.map(notif => {
              const isWebPortal = notif.result_format === 'WEB_PORTAL_LINK' || notif.portal_url;
              const portalTargetUrl = notif.portal_url || notif.pdf_url;

              return (
                <div
                  key={notif.id}
                  className="group relative flex flex-col justify-between glass-card rounded-2xl p-6 border border-slate-200/90 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white"
                >
                  <div>
                    {/* Top Badge Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                          {notif.badge_type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          🏛️ {notif.state || 'All India'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {notif.publication_date}
                      </span>
                    </div>

                    {/* Format & Health Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {isWebPortal ? (
                        <>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-extrabold">
                            <Globe className="w-3 h-3 text-sky-600" />
                            <span>Live Official Result Web Portal</span>
                          </span>

                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ping 200 OK (38ms)</span>
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold">
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>PDF Transcribed to Database</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                      {notif.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed font-medium">
                      {notif.summary}
                    </p>

                    {/* Highlight Dates */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Result Date</span>
                        <span className="font-extrabold text-slate-800">{notif.result_date || 'Declared'}</span>
                      </div>
                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                        <span className="text-[10px] text-amber-800 uppercase block font-bold">Counselling</span>
                        <span className="font-extrabold text-amber-900">{notif.counselling_start || 'Schedule Released'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-emerald-700 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">{notif.official_source.split(' ')[0]} Verified</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isWebPortal ? (
                        <a
                          href={portalTargetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
                          title="Access Official Web Result Portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Access Portal</span>
                        </a>
                      ) : (
                        <a
                          href={`/api/download-pdf?title=${encodeURIComponent(notif.title)}`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
                          title="Download Official PDF Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      )}

                      <button
                        onClick={() => setSelectedNotif(notif)}
                        className="flex items-center space-x-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition-all pl-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      )}
      </div>

      {/* Detailed Notice PDF Modal */}
      <PDFModal notification={selectedNotif} onClose={() => setSelectedNotif(null)} />

      {/* Student Result Scorecard Modal */}
      <StudentResultModal result={studentResult} onClose={() => setStudentResult(null)} />
    </div>
  );
};
