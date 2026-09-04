import React from 'react';
import { BookOpen, Bot, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserNavbarProps {
  onOpenAIChat: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ onOpenAIChat }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* User App Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  GyanGuru
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Student Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Official Govt Exam Results & Cutoff Hub</p>
            </div>
          </Link>

          {/* User Header Actions - Strictly Student Features Only */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>NTA / KEA Verified Documents</span>
            </div>

            {/* AI Assistant Launcher */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              <Bot className="w-4 h-4 text-sky-200" />
              <span>Ask AI Edu Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
