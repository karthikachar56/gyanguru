import React from 'react';
import { ShieldCheck, Sparkles, Bot, Radio, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'user' | 'admin';
  setActiveTab: (tab: 'user' | 'admin') => void;
  onOpenAIChat: () => void;
  pendingReviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAIChat,
  pendingReviewCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('user')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  GyanGuru
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  alerts.gyanguru.vercel.app
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Official Govt KEA & NEET Allotment Engine</p>
            </div>
          </div>

          {/* Center Navigation Segmented Switch */}
          <div className="flex items-center bg-dark-800/90 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'user'
                  ? 'bg-gradient-to-r from-brand-600 to-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>User Panel</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`relative flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Admin Control Center</span>
              {pendingReviewCount > 0 && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            {/* Live Scraper Monitor Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Scraper Active (NTA/KEA)</span>
            </div>

            {/* AI Assistant Launcher */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-500/60 transition-all text-xs font-semibold shadow-sm"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Edu Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
