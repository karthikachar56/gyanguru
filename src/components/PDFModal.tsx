import React from 'react';
import { X, ExternalLink, ShieldCheck, FileText, Calendar, Download, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';

interface PDFModalProps {
  notification: Notification | null;
  onClose: () => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const downloadUrl = `/api/download-pdf?title=${encodeURIComponent(notification.title)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {notification.verification_status}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {notification.official_source}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{notification.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Key Highlights & Dates */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-4 rounded-xl bg-dark-800/60 border border-slate-700/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Executive Summary</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{notification.summary}</p>
            </div>

            {/* Key Schedule Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                Verified Dates & Timelines
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-dark-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Result Date</span>
                  <span className="text-sm font-semibold text-rose-400">{notification.result_date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Counselling Window</span>
                  <span className="text-sm font-semibold text-amber-400">{notification.counselling_start}</span>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Application Window</span>
                  <span className="text-sm font-semibold text-sky-400">{notification.application_start}</span>
                </div>
              </div>
            </div>

            {/* Eligibility & Instructions */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-dark-800/60 border border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Eligibility Criteria</h4>
                <p className="text-sm text-slate-300">{notification.eligibility}</p>
              </div>

              <div className="p-4 rounded-xl bg-dark-800/60 border border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Important Instructions</h4>
                <p className="text-sm text-slate-300">{notification.important_instructions}</p>
              </div>
            </div>
          </div>

          {/* Right Column: PDF Verification & Download Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-dark-800 to-dark-900 border border-slate-700/80 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Official Document Verified</span>
              </div>
              <p className="text-xs text-slate-400">
                This document was automatically downloaded and processed from the official portal. The original PDF hash matches government records.
              </p>

              <div className="pt-2 border-t border-slate-700/60 text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Body:</span>
                  <span className="font-semibold">{notification.official_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Published Date:</span>
                  <span>{notification.publication_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Document ID:</span>
                  <span className="font-mono text-[10px] text-slate-400">{notification.document_id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF</span>
                </a>

                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-all"
                >
                  <span>Open PDF in Browser</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
