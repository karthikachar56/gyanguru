import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ExternalLink, ShieldCheck, Sparkles, BookOpen, Clock, ChevronRight, FileText } from 'lucide-react';
import { Notification } from '../types';
import { PDFModal } from '../components/PDFModal';

export const UserPortal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
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
  }, [selectedExam, search]);

  const examCategories = [
    { id: 'ALL', label: 'All Exams' },
    { id: 'NEET UG', label: '🔴 NEET UG Medical' },
    { id: 'KCET', label: '🟡 KCET Karnataka' },
    { id: 'JEE Main', label: '🔵 JEE Main Engineering' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/20 p-8 sm:p-10 bg-gradient-to-r from-dark-900 via-dark-800 to-brand-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated AI Govt Document Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Official Govt Education <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Results & Notifications Hub
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time automated scanning of NTA, KEA, and official educational boards. Every notification is extracted by AI, validated, and linked to verified government PDF documents.
          </p>

          {/* Search Input Bar */}
          <div className="pt-2">
            <div className="relative flex items-center max-w-2xl">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search NEET results, KCET counselling schedules, cutoff dates..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-dark-800/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Exam:
        </span>
        {examCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedExam(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              selectedExam === cat.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Notifications Feed */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Verified Government Announcements ({notifications.length})
          </h2>
          <span className="text-xs text-slate-400">Updated automatically via AI Monitoring</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading verified notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No matching notifications found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search keywords or exam filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map(notif => (
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
                      <span className="text-[10px] text-slate-500 uppercase block">Result / Notice</span>
                      <span className="font-semibold text-slate-200">{notif.result_date || 'Declared'}</span>
                    </div>
                    <div className="bg-dark-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Counselling</span>
                      <span className="font-semibold text-amber-400">{notif.counselling_start || 'Schedule Released'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{notif.official_source.split(' ')[0]} Verified</span>
                  </div>
                  <button
                    onClick={() => setSelectedNotif(notif)}
                    className="flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <PDFModal notification={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
};
