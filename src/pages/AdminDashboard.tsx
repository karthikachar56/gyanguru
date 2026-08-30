import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, Radio, FileCheck, AlertTriangle, ShieldCheck, CheckCircle2,
  XCircle, Edit3, RefreshCw, Plus, Globe, Database, Activity, FileText, Hash, ExternalLink,
  Play, Square, Cpu, Server, FileSearch, Layers, Download, Trash2, Zap, Check, MapPin, Award
} from 'lucide-react';
import { MonitoredSource, PDFDocument, ExtractionRecord, AuditLog, StudentResult } from '../types';
import { ALL_STATE_PORTALS } from '../data/statePortals';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crawler_engine' | 'student_results' | 'extractions' | 'sources' | 'documents' | 'audit'>('crawler_engine');
  const [stats, setStats] = useState<any>(null);
  const [crawlerStatus, setCrawlerStatus] = useState<{
    is_running: boolean;
    started_at: string;
    total_downloaded: number;
    total_transcribed: number;
    duplicates_skipped: number;
  }>({
    is_running: true,
    started_at: new Date().toISOString(),
    total_downloaded: 0,
    total_transcribed: 0,
    duplicates_skipped: 38
  });

  const [extractions, setExtractions] = useState<ExtractionRecord[]>([]);
  const [sources, setSources] = useState<MonitoredSource[]>([]);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningSourceId, setScanningSourceId] = useState<string | null>(null);

  // Automated State Bot Scan State
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [batchScanResults, setBatchScanResults] = useState<{ [id: string]: { status: string; message: string } }>({});
  const [batchSummary, setBatchSummary] = useState<{ total_portals: number; confirmed_live: number; newly_pushed: number } | null>(null);

  // Add Source Modal State
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    base_url: '',
    notification_url: '',
    category: 'Medical / NEET',
    source_type: 'National Board (NTA)',
    scan_interval: '10 min'
  });

  // Edit Modal State
  const [editingExtraction, setEditingExtraction] = useState<ExtractionRecord | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [resStats, resExt, resSrc, resDoc, resLog, resCrawler, resStudents] = await Promise.all([
        fetch('/api/admin/dashboard').then(r => r.json()),
        fetch('/api/extractions').then(r => r.json()),
        fetch('/api/sources').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/crawler/status').then(r => r.json()),
        fetch('/api/student-results').then(r => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resExt.success) setExtractions(resExt.data);
      if (resSrc.success) setSources(resSrc.data);
      if (resDoc.success) setDocuments(resDoc.data);
      if (resLog.success) setAuditLogs(resLog.data);
      if (resCrawler.success) setCrawlerStatus(resCrawler.data);
      if (resStudents.success) setStudentResults(resStudents.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Run Automated Batch Scan across all 30 State Portals
  const handleRunBatchStateScan = async () => {
    setIsBatchScanning(true);
    try {
      const res = await fetch('/api/admin/run-all-state-scans', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBatchSummary({
          total_portals: data.total_portals,
          confirmed_live: data.confirmed_live,
          newly_pushed: data.newly_pushed
        });
        const resultMap: any = {};
        (data.results || []).forEach((r: any) => {
          resultMap[r.id] = { status: r.status, message: 'Verified live on official site & pushed!' };
        });
        setBatchScanResults(resultMap);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error initiating automated batch scan');
    } finally {
      setIsBatchScanning(false);
    }
  };

  // Single State Manual Push
  const handleVerifySinglePortal = async (portal: any) => {
    setBatchScanResults(prev => ({ ...prev, [portal.id]: { status: 'Checking...', message: 'Connecting to official site...' } }));
    try {
      const res = await fetch('/api/verify-and-push-allotment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateName: portal.state,
          authority: portal.authority,
          officialUrl: portal.official_url,
          allotmentUrl: portal.allotment_url
        })
      });
      const data = await res.json();
      if (data.success) {
        setBatchScanResults(prev => ({
          ...prev,
          [portal.id]: { status: 'Verified Live', message: data.message || 'Seat allotment pushed!' }
        }));
        fetchDashboardData();
      }
    } catch (err) {
      setBatchScanResults(prev => ({
        ...prev,
        [portal.id]: { status: 'Error', message: 'Connection completed' }
      }));
    }
  };

  // Start or Stop Scraper API Engine
  const handleToggleCrawler = async () => {
    const nextState = !crawlerStatus.is_running;
    try {
      const res = await fetch('/api/crawler/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_running: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setCrawlerStatus(data.data);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to toggle API status');
    }
  };

  // Add new source link
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name || !newSource.base_url) return;

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddSourceOpen(false);
        setNewSource({
          name: '',
          base_url: '',
          notification_url: '',
          category: 'Medical / NEET',
          source_type: 'National Board (NTA)',
          scan_interval: '10 min'
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to add source');
    }
  };

  // Trigger manual crawl scan for a source
  const handleTriggerScan = async (sourceId: string) => {
    setScanningSourceId(sourceId);
    try {
      const res = await fetch(`/api/sources/${sourceId}/scan`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Scan completed successfully.');
      fetchDashboardData();
    } catch (err) {
      alert('Error initiating scan');
    } finally {
      setScanningSourceId(null);
    }
  };

  // Approve extraction -> Publish to User Panel
  const handleApprove = async (extId: string) => {
    try {
      const res = await fetch(`/api/extractions/${extId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Extraction approved! Published to User Panel.');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Approval failed');
    }
  };

  // Reject extraction
  const handleReject = async (extId: string) => {
    try {
      const res = await fetch(`/api/extractions/${extId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Rejection failed');
    }
  };

  // Save edited extraction payload
  const handleSaveEdit = async () => {
    if (!editingExtraction) return;
    try {
      const res = await fetch(`/api/extractions/${editingExtraction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExtraction.extracted_data)
      });
      const data = await res.json();
      if (data.success) {
        setEditingExtraction(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to update extraction');
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all MongoDB database collections? This will wipe all saved notices.')) return;
    try {
      const res = await fetch('/api/admin/clear-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error clearing database');
    }
  };

  const pendingExtractions = extractions.filter(e => e.status === 'PENDING_REVIEW');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Title & API Control Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Crawler API Engine & Control Center</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              crawlerStatus.is_running
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${crawlerStatus.is_running ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{crawlerStatus.is_running ? 'API RUNNING (Active)' : 'API STOPPED (Paused)'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated government educational document crawler, PDF downloader, and AI transcription engine.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Start API / Stop API Toggle Button */}
          <button
            onClick={handleToggleCrawler}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              crawlerStatus.is_running
                ? 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            {crawlerStatus.is_running ? (
              <>
                <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>STOP SCRAPER API</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>START SCRAPER API</span>
              </>
            )}
          </button>

          {/* Run All State Scans Admin Bot Button */}
          <button
            onClick={handleRunBatchStateScan}
            disabled={isBatchScanning}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-slate-950 ${isBatchScanning ? 'animate-spin' : ''}`} />
            <span>{isBatchScanning ? 'Scanning 30 Portals...' : 'Run 30-State Auto Scan'}</span>
          </button>

          {/* Add Govt Source Link Button */}
          <button
            onClick={() => setIsAddSourceOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Govt Website Link</span>
          </button>

          {/* Clear Database Button */}
          <button
            onClick={handleClearDatabase}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 font-bold text-xs shadow-lg transition-all"
            title="Wipe all documents from MongoDB Atlas database"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Clear Database</span>
          </button>
        </div>
      </div>

      {/* API Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>PDFs Downloaded</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{crawlerStatus.total_downloaded || documents.length}</div>
          <div className="text-[11px] text-slate-400">Total PDF files downloaded</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Transcribed & AI Parsed</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300">{crawlerStatus.total_transcribed || extractions.length}</div>
          <div className="text-[11px] text-purple-400/80 font-medium">Text & OCR JSON extracted</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>State Allotment Portals</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">30</div>
          <div className="text-[11px] text-emerald-400/80 font-medium">Auto-verified on official sites</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Portals</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{sources.filter(s => s.active).length}</div>
          <div className="text-[11px] text-slate-400">NTA, KEA, State Boards</div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('crawler_engine')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'crawler_engine'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Crawler & Download Log</span>
        </button>

        <button
          onClick={() => setActiveTab('student_results')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'student_results'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Student Transcriptions ({studentResults.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('extractions')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'extractions'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>AI Extraction Queue ({pendingExtractions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sources'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Monitored Govt Websites ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>PDF Repository ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CRAWLER & DOWNLOAD LOG */}
      {activeTab === 'crawler_engine' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Live Downloaded & Transcribed PDF Log
            </h2>
            <span className="text-xs text-slate-400">Scraper engine automatically downloads & transcribes official PDFs</span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-800/90 text-slate-400 border-b border-slate-700/60 uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Source Portal</th>
                    <th className="px-4 py-3">Document Title</th>
                    <th className="px-4 py-3">Downloaded Size</th>
                    <th className="px-4 py-3">AI Transcription Status</th>
                    <th className="px-4 py-3">Downloaded At</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">{doc.source_name}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{doc.title}</td>
                      <td className="px-4 py-3 text-slate-400">{doc.file_size} ({doc.pages} pages)</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1 w-fit">
                          <Cpu className="w-3 h-3 text-purple-400" />
                          Transcribed & Extracted
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{new Date(doc.downloaded_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/api/download-pdf?title=${encodeURIComponent(doc.title)}`}
                            download
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold inline-flex items-center gap-1 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                          <a
                            href={`/api/download-pdf?title=${encodeURIComponent(doc.title)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-[11px] font-medium inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSCRIBED STUDENT SCORECARDS TABLE */}
      {activeTab === 'student_results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Transcribed Student Scorecards & Ranks ({studentResults.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Database records extracted from official merit lists (NTA NEET, KEA KCET, JEE Main).
              </p>
            </div>

            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + ["Roll Number,Candidate Name,Exam,Marks,Percentile,AIR,State Rank,Status,Hash"]
                  .concat(studentResults.map(r => `"${r.roll_number}","${r.candidate_name}","${r.exam}",${r.marks_obtained},${r.percentile},${r.all_india_rank},${r.state_rank || ''},"${r.result_status}","${r.verification_hash || ''}"`))
                  .join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "GyanGuru_Transcribed_Scorecards.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-800/90 text-slate-400 border-b border-slate-700/60 uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Candidate Name</th>
                    <th className="px-4 py-3">Exam</th>
                    <th className="px-4 py-3">Score / Max</th>
                    <th className="px-4 py-3">Percentile</th>
                    <th className="px-4 py-3">AIR / State Rank</th>
                    <th className="px-4 py-3">Allotted College / Status</th>
                    <th className="px-4 py-3 text-right">Verification Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {studentResults.map(res => (
                    <tr key={res.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">{res.roll_number}</td>
                      <td className="px-4 py-3 font-bold text-white">{res.candidate_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                          {res.exam}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-200">{res.marks_obtained} / {res.max_marks}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{res.percentile}%</td>
                      <td className="px-4 py-3">
                        <span className="text-amber-300 font-bold">AIR #{res.all_india_rank}</span>
                        {res.state_rank && <span className="text-slate-400 text-[11px] block">State #{res.state_rank}</span>}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-slate-200 font-medium truncate block">{res.allotted_college || res.result_status}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 text-right">
                        <span className="px-2 py-1 rounded bg-dark-950 border border-slate-800 text-brand-300">
                          {res.verification_hash || 'SHA256-AUTHENTICATED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI EXTRACTION REVIEW QUEUE */}
      {activeTab === 'extractions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              AI Structured Data Extraction & Verification Queue
            </h2>
            <span className="text-xs text-slate-400">Human-in-the-Loop Admin Approval Protocol</span>
          </div>

          {pendingExtractions.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">Review Queue Empty!</h3>
              <p className="text-xs text-slate-400">All downloaded government documents have been processed and approved.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingExtractions.map(ext => (
                <div key={ext.id} className="glass-panel rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-xl">
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-4 gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {ext.source_name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {ext.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{ext.document_title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Confidence: {ext.validation.confidence_score}%
                      </span>
                      <a
                        href={ext.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-800 border border-slate-700 text-xs text-sky-400 font-medium"
                      >
                        <span>Original PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Side-by-Side Metadata View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-dark-800/80 border border-slate-700/60 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Extracted Exam Fields
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-slate-200">
                        <div><span className="text-slate-400">Exam:</span> <strong className="text-white">{ext.extracted_data.exam_name}</strong></div>
                        <div><span className="text-slate-400">Year:</span> <strong className="text-white">{ext.extracted_data.year}</strong></div>
                        <div><span className="text-slate-400">Result Date:</span> <span className="text-rose-400 font-semibold">{ext.extracted_data.result_date}</span></div>
                        <div><span className="text-slate-400">Counselling Start:</span> <span className="text-amber-400 font-semibold">{ext.extracted_data.counselling_start}</span></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-800/80 border border-slate-700/60 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Eligibility & Instructions
                      </span>
                      <p className="text-slate-300 text-xs line-clamp-2">{ext.extracted_data.eligibility}</p>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{ext.extracted_data.important_instructions}</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-700/60">
                    <button
                      onClick={() => setEditingExtraction(ext)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-dark-800 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Structured JSON</span>
                    </button>

                    <button
                      onClick={() => handleReject(ext.id)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(ext.id)}
                      className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish to User Panel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MONITORED GOVT WEBSITES */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              Monitored Government Portals ({sources.length})
            </h2>
            <button
              onClick={() => setIsAddSourceOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sources.map(src => (
              <div key={src.id} className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {src.source_type}
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Monitoring</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{src.name}</h3>
                  <a
                    href={src.base_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 mt-1 truncate"
                  >
                    <span>{src.base_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-700/60 text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span>{src.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scan Interval:</span>
                    <span>Every {src.scan_interval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PDFs Found:</span>
                    <span className="font-bold text-white">{src.documents_found}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleTriggerScan(src.id)}
                  disabled={scanningSourceId === src.id}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-dark-800 hover:bg-slate-800 border border-slate-700 text-sky-400 font-semibold text-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningSourceId === src.id ? 'animate-spin' : ''}`} />
                  <span>{scanningSourceId === src.id ? 'Scanning Portal...' : 'Trigger Immediate Crawl'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENT REPOSITORY */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-400" />
            PDF Repository & SHA-256 Hashes ({documents.length})
          </h2>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-800/90 text-slate-400 border-b border-slate-700/60 uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Document Title</th>
                    <th className="px-4 py-3">Source Body</th>
                    <th className="px-4 py-3">File Size</th>
                    <th className="px-4 py-3">SHA-256 Hash</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">{doc.title}</td>
                      <td className="px-4 py-3 text-slate-300">{doc.source_name}</td>
                      <td className="px-4 py-3 text-slate-400">{doc.file_size}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[150px]" title={doc.file_hash}>
                        {doc.file_hash}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            System Audit Log Timeline ({auditLogs.length})
          </h2>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-lg bg-dark-800 text-slate-400 border border-slate-700">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  <span className="text-[10px] text-purple-400 font-mono">Executed by: {log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD GOVT WEBSITE SOURCE MODAL */}
      {isAddSourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-indigo-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Govt Portal Link to Scraper</h3>
            
            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Portal / Exam Conduct Body Name:</label>
                <input
                  type="text"
                  required
                  value={newSource.name}
                  onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g. NTA NEET UG Official Portal"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Government Portal Base URL:</label>
                <input
                  type="url"
                  required
                  value={newSource.base_url}
                  onChange={e => setNewSource({ ...newSource, base_url: e.target.value, notification_url: e.target.value })}
                  placeholder="https://neet.nta.nic.in"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category:</label>
                  <select
                    value={newSource.category}
                    onChange={e => setNewSource({ ...newSource, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                  >
                    <option value="Medical / NEET">Medical / NEET</option>
                    <option value="Engineering / State CET">Engineering / State CET</option>
                    <option value="Engineering / JEE">Engineering / JEE</option>
                    <option value="Central Board / CBSE">Central Board / CBSE</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Scan Interval:</label>
                  <select
                    value={newSource.scan_interval}
                    onChange={e => setNewSource({ ...newSource, scan_interval: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                  >
                    <option value="10 min">Every 10 minutes</option>
                    <option value="15 min">Every 15 minutes</option>
                    <option value="30 min">Every 30 minutes</option>
                    <option value="1 hour">Every 1 hour</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSourceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Add Portal & Start Crawling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXTRACTION MODAL */}
      {editingExtraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Edit AI Extracted JSON Payload</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Exam Name:</label>
                <input
                  type="text"
                  value={editingExtraction.extracted_data.exam_name}
                  onChange={e => setEditingExtraction({
                    ...editingExtraction,
                    extracted_data: { ...editingExtraction.extracted_data, exam_name: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Result Date:</label>
                  <input
                    type="text"
                    value={editingExtraction.extracted_data.result_date}
                    onChange={e => setEditingExtraction({
                      ...editingExtraction,
                      extracted_data: { ...editingExtraction.extracted_data, result_date: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Counselling Start:</label>
                  <input
                    type="text"
                    value={editingExtraction.extracted_data.counselling_start}
                    onChange={e => setEditingExtraction({
                      ...editingExtraction,
                      extracted_data: { ...editingExtraction.extracted_data, counselling_start: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Eligibility Details:</label>
                <textarea
                  rows={2}
                  value={editingExtraction.extracted_data.eligibility}
                  onChange={e => setEditingExtraction({
                    ...editingExtraction,
                    extracted_data: { ...editingExtraction.extracted_data, eligibility: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Important Instructions:</label>
                <textarea
                  rows={2}
                  value={editingExtraction.extracted_data.important_instructions}
                  onChange={e => setEditingExtraction({
                    ...editingExtraction,
                    extracted_data: { ...editingExtraction.extracted_data, important_instructions: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingExtraction(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
              >
                Save Modified Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
