import React from 'react';
import { SlidersHorizontal, ShieldAlert } from 'lucide-react';

interface AdminNavbarProps {
  pendingReviewCount: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ pendingReviewCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-indigo-500/20 bg-dark-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Admin Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  GyanGuru Admin
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Control Center
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Pipeline Automation & AI Verification Engine</p>
            </div>
          </div>

          {/* Right Tools - Strictly Admin Features Only */}
          <div className="flex items-center space-x-4">
            {/* Pending Approvals Counter */}
            {pendingReviewCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{pendingReviewCount} Extractions Pending Approval</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
