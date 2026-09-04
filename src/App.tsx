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
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      <UserNavbar onOpenAIChat={() => setIsAIChatOpen(true)} />
      <main className="flex-1">
        <UserPortal />
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 shadow-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-200">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">GyanGuru Student Result Hub</h4>
              <p className="text-slate-500 leading-relaxed text-xs">
                Official National Examination & State CET Allotment verification engine. Continuously ingesting NTA, KEA, MCC, and 30+ state result portals with cryptographic SHA-256 integrity verification.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">Verified Examination Boards</h4>
              <ul className="space-y-1 text-slate-600 font-medium">
                <li>• NTA NEET UG / JEE Main Official Records</li>
                <li>• KEA Karnataka CET Seat Allotment Matrix</li>
                <li>• MCC Medical Counseling Committee Updates</li>
                <li>• 30 Official State Allotment Portals</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">Public Trust & Security</h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span>🛡️ 100% Cryptographically Signed Records</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Toll-Free Student Helpline: 1800-112-247 • Powered by AI Document Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 GyanGuru Educational Intelligence Network. All Official Documents Sourced Direct from Govt Portals.
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin" className="text-blue-700 hover:underline font-bold">Admin Portal Login</a>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Govt Standard Compliant</span>
            </div>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <AdminNavbar pendingReviewCount={pendingReviewCount} />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <footer className="border-t border-slate-800 bg-slate-900/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-indigo-400">GyanGuru Admin Control Center</span>
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
