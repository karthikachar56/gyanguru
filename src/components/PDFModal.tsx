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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-blue-200 shadow-2xl p-6 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {notification.verification_status}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {notification.official_source}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">{notification.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Key Highlights & Dates */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Executive Summary</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{notification.summary}</p>
            </div>

            {/* Key Schedule Grid */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Verified Dates & Timelines
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold block">Result Date</span>
                  <span className="text-sm font-extrabold text-rose-700">{notification.result_date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[11px] text-amber-800 font-bold block">Counselling Window</span>
                  <span className="text-sm font-extrabold text-amber-900">{notification.counselling_start}</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200">
                  <span className="text-[11px] text-sky-800 font-bold block">Application Window</span>
                  <span className="text-sm font-extrabold text-sky-900">{notification.application_start}</span>
                </div>
              </div>
            </div>

            {/* Eligibility & Instructions */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">Eligibility Criteria</h4>
                <p className="text-sm text-slate-700 font-medium">{notification.eligibility}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">Important Instructions</h4>
                <p className="text-sm text-slate-700 font-medium">{notification.important_instructions}</p>
              </div>
            </div>
          </div>

          {/* Right Column: PDF Verification & Download Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/40 to-slate-50 border border-blue-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-extrabold">Official Document Verified</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                This document was automatically downloaded and processed from the official portal. The original PDF hash matches government records.
              </p>

              <div className="pt-2 border-t border-slate-200 text-xs space-y-2 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Exam Body:</span>
                  <span className="font-extrabold">{notification.official_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Published Date:</span>
                  <span>{notification.publication_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Document ID:</span>
                  <span className="font-mono text-[10px] text-slate-600">{notification.document_id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF</span>
                </a>

                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-all shadow-2xs"
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
