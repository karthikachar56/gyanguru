import React, { useState } from 'react';
import { X, Award, ShieldCheck, Download, CheckCircle2, Building2, User, Hash, FileText, QrCode, Printer, Copy, Check, BarChart3 } from 'lucide-react';
import { StudentResult } from '../types';

interface StudentResultModalProps {
  result: StudentResult | null;
  onClose: () => void;
}

export const StudentResultModal: React.FC<StudentResultModalProps> = ({ result, onClose }) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!result) return null;

  const authHash = result.verification_hash || `SHA256-${result.exam.replace(/\s+/g, '')}2026-${result.roll_number.slice(-5)}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(authHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-blue-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white border-b border-blue-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Government Transcribed Scorecard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {result.exam} {result.year} Official Result
              </h2>
              <p className="text-xs text-blue-200 mt-1">
                Verified Ingestion from {result.official_notice_title}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 border border-white/20 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <a
                href={`/api/download-pdf?title=${encodeURIComponent(`${result.exam}_Scorecard_${result.roll_number}`)}`}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#f8fafc]">
          {/* Candidate Profile Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Candidate Name
              </div>
              <div className="text-xl font-extrabold text-slate-900 tracking-wide">{result.candidate_name}</div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-200 text-xs">
                <span className="text-blue-700 block text-[10px] uppercase tracking-wider font-extrabold">Roll Number</span>
                <span className="font-mono font-extrabold text-blue-900 text-sm">{result.roll_number}</span>
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600 block text-[10px] uppercase tracking-wider font-extrabold">Application No</span>
                <span className="font-mono font-extrabold text-slate-800 text-sm">{result.application_no}</span>
              </div>
            </div>
          </div>

          {/* Performance Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Marks Box */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Marks</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {result.marks_obtained} <span className="text-xs text-slate-500 font-medium">/ {result.max_marks}</span>
              </div>
            </div>

            {/* Percentile Box */}
            <div className="glass-card p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-center shadow-sm">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">NTA / State Percentile</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {result.percentile}%
              </div>
            </div>

            {/* All India Rank */}
            <div className="glass-card p-4 rounded-2xl border border-amber-200 bg-amber-50/60 text-center shadow-sm">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">All India Rank (AIR)</span>
              <div className="text-2xl font-black text-amber-900 mt-1">
                #{result.all_india_rank}
              </div>
            </div>

            {/* Category / State Rank */}
            <div className="glass-card p-4 rounded-2xl border border-sky-200 bg-sky-50/60 text-center shadow-sm">
              <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider block">
                {result.state_rank ? 'State Rank' : 'Category'}
              </span>
              <div className="text-2xl font-black text-sky-900 mt-1">
                {result.state_rank ? `#${result.state_rank}` : result.category}
              </div>
            </div>
          </div>

          {/* Subject Breakdown (if available) */}
          {result.subject_marks && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Subject-Wise Performance Breakdown
                </span>
                <span className="text-slate-500 text-[11px]">Transcribed Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-semibold">Physics</span>
                  <span className="text-sm font-black text-slate-900">{result.subject_marks.physics} Marks</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-semibold">Chemistry</span>
                  <span className="text-sm font-black text-slate-900">{result.subject_marks.chemistry} Marks</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-semibold">Biology / Maths</span>
                  <span className="text-sm font-black text-slate-900">{result.subject_marks.biology_maths} Marks</span>
                </div>
              </div>
            </div>
          )}

          {/* Qualification & Allotment Status */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Official Result Status</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{result.result_status}</div>
              </div>
            </div>

            {result.allotted_college && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center space-x-3 shadow-2xs">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-blue-800 font-extrabold uppercase tracking-wider">Allotted College / Seat Matrix</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{result.allotted_college}</div>
                </div>
              </div>
            )}
          </div>

          {/* Digital Verification Certificate Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Digital Cryptographic Authentication Hash</div>
                <div className="text-xs font-mono font-bold text-slate-800 truncate max-w-xs sm:max-w-sm mt-0.5">
                  {authHash}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyHash}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 border border-slate-300 transition-all shrink-0"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Transcribed via GyanGuru AI Engine • Govt Record #{result.id}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-sm"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
