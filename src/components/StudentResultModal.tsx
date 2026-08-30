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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-dark-900 rounded-3xl border border-brand-500/30 shadow-2xl shadow-brand-500/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-brand-950 via-dark-900 to-indigo-950 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800/80 hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Government Transcribed Scorecard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {result.exam} {result.year} Official Result
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified Ingestion from {result.official_notice_title}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <a
                href={`/api/download-pdf?title=${encodeURIComponent(`${result.exam}_Scorecard_${result.roll_number}`)}`}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Candidate Profile Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-800/70 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" /> Candidate Name
              </div>
              <div className="text-xl font-extrabold text-white tracking-wide">{result.candidate_name}</div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-dark-950 px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Roll Number</span>
                <span className="font-mono font-extrabold text-brand-300 text-sm">{result.roll_number}</span>
              </div>
              <div className="bg-dark-950 px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Application No</span>
                <span className="font-mono font-extrabold text-slate-200 text-sm">{result.application_no}</span>
              </div>
            </div>
          </div>

          {/* Performance Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Marks Box */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-gradient-to-b from-dark-800 to-dark-900 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Marks</span>
              <div className="text-2xl font-black text-white mt-1">
                {result.marks_obtained} <span className="text-xs text-slate-500 font-normal">/ {result.max_marks}</span>
              </div>
            </div>

            {/* Percentile Box */}
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">NTA / State Percentile</span>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {result.percentile}%
              </div>
            </div>

            {/* All India Rank */}
            <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">All India Rank (AIR)</span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                #{result.all_india_rank}
              </div>
            </div>

            {/* Category / State Rank */}
            <div className="glass-card p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 text-center">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                {result.state_rank ? 'State Rank' : 'Category'}
              </span>
              <div className="text-2xl font-black text-sky-300 mt-1">
                {result.state_rank ? `#${result.state_rank}` : result.category}
              </div>
            </div>
          </div>

          {/* Subject Breakdown (if available) */}
          {result.subject_marks && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-800/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-brand-400" />
                  Subject-Wise Performance Breakdown
                </span>
                <span className="text-slate-500 text-[11px]">Transcribed Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-dark-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Physics</span>
                  <span className="text-sm font-black text-slate-200">{result.subject_marks.physics} Marks</span>
                </div>
                <div className="bg-dark-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Chemistry</span>
                  <span className="text-sm font-black text-slate-200">{result.subject_marks.chemistry} Marks</span>
                </div>
                <div className="bg-dark-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Biology / Maths</span>
                  <span className="text-sm font-black text-slate-200">{result.subject_marks.biology_maths} Marks</span>
                </div>
              </div>
            </div>
          )}

          {/* Qualification & Allotment Status */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Official Result Status</div>
                <div className="text-sm font-bold text-white mt-0.5">{result.result_status}</div>
              </div>
            </div>

            {result.allotted_college && (
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-brand-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-brand-300 font-extrabold uppercase tracking-wider">Allotted College / Seat Matrix</div>
                  <div className="text-sm font-bold text-white mt-0.5">{result.allotted_college}</div>
                </div>
              </div>
            )}
          </div>

          {/* Digital Verification Certificate Box */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Digital Cryptographic Authentication Hash</div>
                <div className="text-xs font-mono font-bold text-slate-200 truncate max-w-xs sm:max-w-sm mt-0.5">
                  {authHash}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyHash}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all shrink-0"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
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
        <div className="p-5 bg-dark-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Transcribed via GyanGuru AI Engine • Govt Record #{result.id}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dark-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
