import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserNavbar } from './components/UserNavbar';
import { AdminNavbar } from './components/AdminNavbar';
import { UserPortal } from './pages/UserPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIChatModal } from './components/AIChatModal';

// User Web Shell
const UserAppLayout = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <UserNavbar onOpenAIChat={() => setIsAIChatOpen(true)} />
      <main className="flex-1">
        <UserPortal />
      </main>
      <footer className="border-t border-slate-800 bg-dark-900/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">GyanGuru Student Portal</span>
            <span>•</span>
            <span>Verified Official Govt Educational Announcements</span>
          </div>
          <div>
            <span>Powered by AI Document Intelligence</span>
          </div>
        </div>
      </footer>
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
};

// Admin Web Shell
const AdminAppLayout = () => {
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  const checkPendingReviews = async () => {
    try {
      const res = await fetch('/api/extractions');
      const data = await res.json();
      if (data.success) {
        const pending = data.data.filter((e: any) => e.status === 'PENDING_REVIEW');
        setPendingReviewCount(pending.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkPendingReviews();
    const interval = setInterval(checkPendingReviews, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <AdminNavbar pendingReviewCount={pendingReviewCount} />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <footer className="border-t border-slate-800 bg-dark-900/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-indigo-300">GyanGuru Admin Control Center</span>
            <span>•</span>
            <span>Scraper Bot & AI Validation Pipeline</span>
          </div>
          <div>
            <span>Human-in-the-Loop Data Approval Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAppLayout />} />
        <Route path="/admin" element={<AdminAppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
