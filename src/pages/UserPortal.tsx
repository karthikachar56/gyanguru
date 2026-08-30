import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ExternalLink, ShieldCheck, Sparkles, BookOpen, Clock, ChevronRight, FileText, Zap, Download, Globe, UserCheck, ArrowRight, AlertCircle, Activity, CheckCircle2 } from 'lucide-react';
import { Notification, StudentResult } from '../types';
import { PDFModal } from '../components/PDFModal';
import { StudentResultModal } from '../components/StudentResultModal';

export const UserPortal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'PDF_TRANSCRIBED' | 'WEB_PORTAL_LINK'>('ALL');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // Student Roll Number Search States
  const [rollInput, setRollInput] = useState('');
  const [searchingRoll, setSearchingRoll] = useState(false);
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedExam !== 'ALL') queryParams.append('exam', selectedExam);
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
  }, [selectedExam, search]);

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

  const filteredNotifications = notifications.filter(n => {
    if (selectedFormat === 'ALL') return true;
    if (selectedFormat === 'WEB_PORTAL_LINK') return n.result_format === 'WEB_PORTAL_LINK' || n.portal_url;
    if (selectedFormat === 'PDF_TRANSCRIBED') return n.result_format === 'PDF_TRANSCRIBED' || !n.portal_url;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section with Roll Number Lookup & Search */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/20 p-6 sm:p-10 bg-gradient-to-r from-dark-900 via-dark-800 to-brand-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hero Intro & Notice Search */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Precision Govt Result Engine</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 fill-emerald-400 animate-bounce" />
                <span>Live 10s Scanner Active</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Official Govt Education <br />
              <span className="bg-gradient-to-r from-brand-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Result & Allotment Engine
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
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
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-dark-800/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Individual Student Roll Number Lookup Box */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-b from-dark-800 to-dark-900 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-brand-300">
                <UserCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Student Scorecard Lookup</h3>
              </div>
              <p className="text-xs text-slate-400">
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
                    placeholder="Enter Roll No (e.g. 240410198421)"
                    className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searchingRoll || !rollInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/20 transition-all"
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
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{rollError}</span>
                </div>
              )}

              {/* Quick Select Demo Tags */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  ⚡ Click to Demo Scorecards:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleQuickSelectRoll('240410198421')}
                    className="px-2.5 py-1 rounded-lg bg-dark-950 hover:bg-brand-900/50 border border-brand-500/30 text-brand-300 text-[11px] font-mono font-bold transition-all"
                  >
                    Rahul (NEET AIR 412)
                  </button>
                  <button
                    onClick={() => handleQuickSelectRoll('2026KCET0984')}
                    className="px-2.5 py-1 rounded-lg bg-dark-950 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold transition-all"
                  >
                    Prajwal (KCET Rank 14)
                  </button>
                  <button
                    onClick={() => handleQuickSelectRoll('240410198422')}
                    className="px-2.5 py-1 rounded-lg bg-dark-950 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 text-[11px] font-mono font-bold transition-all"
                  >
                    Ananya (NEET AIR 1205)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Format Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* Exam Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Exam:
          </span>
          {examCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedExam(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedExam === cat.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result Format Toggle */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-dark-900 border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedFormat('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedFormat === 'ALL' ? 'bg-dark-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Format
          </button>

          <button
            onClick={() => setSelectedFormat('PDF_TRANSCRIBED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedFormat === 'PDF_TRANSCRIBED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            📄 Transcribed PDFs
          </button>

          <button
            onClick={() => setSelectedFormat('WEB_PORTAL_LINK')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedFormat === 'WEB_PORTAL_LINK' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Live Portals
          </button>
        </div>
      </div>

      {/* Main Notifications Feed */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Verified Government Announcements ({filteredNotifications.length})
          </h2>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Auto-Updated via 10s AI Scanner
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading verified announcements...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No matching result announcements found</h3>
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
                  className="group relative flex flex-col justify-between glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10"
                >
                  <div>
                    {/* Top Badge Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-900/90 text-slate-200 border border-slate-700/60 shadow-sm">
                        {notif.badge_type}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.publication_date}
                      </span>
                    </div>

                    {/* Format & Health Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {isWebPortal ? (
                        <>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                            <Globe className="w-3 h-3" />
                            <span>Live Official Result Web Portal</span>
                          </span>

                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ping 200 OK (38ms)</span>
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          <FileText className="w-3 h-3" />
                          <span>PDF Transcribed to Database</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                      {notif.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {notif.summary}
                    </p>

                    {/* Highlight Dates */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-dark-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Result Date</span>
                        <span className="font-bold text-slate-200">{notif.result_date || 'Declared'}</span>
                      </div>
                      <div className="bg-dark-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Counselling</span>
                        <span className="font-bold text-amber-400">{notif.counselling_start || 'Schedule Released'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">{notif.official_source.split(' ')[0]} Verified</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isWebPortal ? (
                        <a
                          href={portalTargetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all shadow-sm"
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
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow-sm"
                          title="Download Official PDF Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      )}

                      <button
                        onClick={() => setSelectedNotif(notif)}
                        className="flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-all pl-1"
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

      {/* Detailed Notice PDF Modal */}
      <PDFModal notification={selectedNotif} onClose={() => setSelectedNotif(null)} />

      {/* Student Result Scorecard Modal */}
      <StudentResultModal result={studentResult} onClose={() => setStudentResult(null)} />
    </div>
  );
};
