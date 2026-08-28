import React from 'react';
import { BookOpen, Bot, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserNavbarProps {
  onOpenAIChat: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ onOpenAIChat }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-dark-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* User App Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  GyanGuru
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Student Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Official Govt Exam Results & Cutoff Hub</p>
            </div>
          </Link>

          {/* User Header Actions - Strictly Student Features Only */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>NTA / KEA Verified Documents</span>
            </div>

            {/* AI Assistant Launcher */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-md"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Ask AI Edu Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
