import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { runSourceScan } from './services/scraper.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// --- PUBLIC USER PANEL ENDPOINTS ---

// Get all published notifications
app.get('/api/notifications', (req, res) => {
  const { category, search, exam } = req.query;
  let results = [...db.notifications];

  if (exam && exam !== 'ALL') {
    results = results.filter(n => n.exam.toLowerCase() === String(exam).toLowerCase());
  }

  if (category && category !== 'ALL') {
    results = results.filter(n => n.exam.toLowerCase().includes(String(category).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.exam.toLowerCase().includes(q) ||
      n.important_instructions.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

// Get single notification details
app.get('/api/notifications/:id', (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: notif });
});

// AI Chatbot endpoint for User Panel (Answers using Database Context)
app.post('/api/ai-chat', (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question required' });

  const q = String(question).toLowerCase();

  // Search relevant approved database entries
  const matchedNotifs = db.notifications.filter(n =>
    q.includes(n.exam.toLowerCase()) ||
    q.includes('result') && n.notification_type.toLowerCase().includes('result') ||
    q.includes('counselling') && n.notification_type.toLowerCase().includes('counselling') ||
    q.includes('date')
  );

  let responseText = '';
  if (matchedNotifs.length > 0) {
    const primary = matchedNotifs[0];
    responseText = `According to the official verified notification in our database for **${primary.exam} ${primary.year}**:\n\n` +
      `• **Title**: ${primary.title}\n` +
      `• **Result Date**: ${primary.result_date || 'N/A'}\n` +
      `• **Counselling Window**: ${primary.counselling_start} to ${primary.counselling_end}\n` +
      `• **Eligibility Criteria**: ${primary.eligibility}\n` +
      `• **Official Conduct Body**: ${primary.official_source}\n\n` +
      `You can review and download the official government PDF document directly here: [View Official PDF](${primary.pdf_url})`;
  } else {
    responseText = `Based on the official government database records, I found ${db.notifications.length} verified notifications covering **NEET UG 2026**, **KCET 2026**, and **JEE Main 2026**.\n\nPlease specify the exam name (e.g. NEET UG or KCET) or check the main notification feed for the latest updates.`;
  }

  res.json({
    success: true,
    answer: responseText,
    sources: matchedNotifs.map(n => ({ title: n.title, pdf_url: n.pdf_url, source: n.official_source }))
  });
});

// --- ADMIN CONTROL CENTER ENDPOINTS ---

// Admin Dashboard summary stats
app.get('/api/admin/dashboard', (req, res) => {
  const stats = {
    total_sources: db.sources.length,
    active_sources: db.sources.filter(s => s.active).length,
    total_documents: db.documents.length,
    pending_extractions: db.extractions.filter(e => e.status === 'PENDING_REVIEW').length,
    published_notifications: db.notifications.length,
    recent_activity: db.audit_logs.slice(0, 5)
  };
  res.json({ success: true, data: stats });
});

// Monitored sources list
app.get('/api/sources', (req, res) => {
  res.json({ success: true, data: db.sources });
});

// Add new monitoring source
app.post('/api/sources', (req, res) => {
  const { name, base_url, notification_url, category, source_type, scan_interval } = req.body;
  const newSource = {
    id: `src_${Date.now()}`,
    name,
    base_url,
    notification_url: notification_url || base_url,
    category: category || 'General Education',
    source_type: source_type || 'State/National Board',
    active: true,
    scan_interval: scan_interval || '15 min',
    last_scanned_at: new Date().toISOString(),
    documents_found: 0
  };

  db.sources.push(newSource);
  db.audit_logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'SOURCE_ADDED',
    details: `Added new portal monitoring source: ${name} (${base_url})`
  });

  res.json({ success: true, data: newSource });
});

// Trigger manual website scan for a source
app.post('/api/sources/:id/scan', (req, res) => {
  const result = runSourceScan(req.params.id);
  res.json(result);
});

// Get AI Extractions pending review
app.get('/api/extractions', (req, res) => {
  res.json({ success: true, data: db.extractions });
});

// Edit an extraction before approval
app.put('/api/extractions/:id', (req, res) => {
  const ext = db.extractions.find(e => e.id === req.params.id);
  if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });

  ext.extracted_data = { ...ext.extracted_data, ...req.body };
  ext.validation.is_valid = true;
  ext.validation.flags = [];

  res.json({ success: true, data: ext });
});

// Approve AI extraction -> Publish to User database
app.post('/api/extractions/:id/approve', (req, res) => {
  const extIndex = db.extractions.findIndex(e => e.id === req.params.id);
  if (extIndex === -1) return res.status(404).json({ success: false, message: 'Extraction not found' });

  const ext = db.extractions[extIndex];
  ext.status = 'APPROVED';

  // Mark document as published
  const doc = db.documents.find(d => d.id === ext.document_id);
  if (doc) doc.status = 'PUBLISHED';

  // Create published notification record
  const newNotif = {
    id: `notif_${Date.now()}`,
    document_id: ext.document_id,
    exam: ext.extracted_data.exam_name,
    year: ext.extracted_data.year,
    notification_type: ext.extracted_data.notification_type,
    badge_type: ext.extracted_data.notification_type.includes('Result') ? '🔴 Result Announced' : '🟡 Official Notice',
    title: ext.extracted_data.title,
    summary: `${ext.source_name} has officially released notification regarding ${ext.extracted_data.title}.`,
    publication_date: ext.extracted_data.publication_date,
    application_start: ext.extracted_data.application_start,
    application_end: ext.extracted_data.application_end,
    result_date: ext.extracted_data.result_date,
    counselling_start: ext.extracted_data.counselling_start,
    counselling_end: ext.extracted_data.counselling_end,
    eligibility: ext.extracted_data.eligibility,
    important_instructions: ext.extracted_data.important_instructions,
    pdf_url: ext.pdf_url,
    official_source: ext.source_name,
    verification_status: 'Verified Govt Document',
    created_at: new Date().toISOString()
  };

  db.notifications.unshift(newNotif);

  // Audit log
  db.audit_logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'EXTRACTION_APPROVED',
    details: `Approved extraction #${ext.id} (${ext.extracted_data.title}). Published to live User Panel.`
  });

  res.json({ success: true, notification: newNotif });
});

// Reject extraction
app.post('/api/extractions/:id/reject', (req, res) => {
  const ext = db.extractions.find(e => e.id === req.params.id);
  if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });

  ext.status = 'REJECTED';
  db.audit_logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'EXTRACTION_REJECTED',
    details: `Rejected extraction #${ext.id} for document (${ext.document_title}).`
  });

  res.json({ success: true, message: 'Extraction rejected' });
});

// Documents repository
app.get('/api/documents', (req, res) => {
  res.json({ success: true, data: db.documents });
});

// Audit logs
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, data: db.audit_logs });
});

// Crawler API status & metrics
app.get('/api/crawler/status', (req, res) => {
  res.json({
    success: true,
    data: {
      ...db.crawler_status,
      total_downloaded: db.documents.length,
      total_transcribed: db.extractions.length + db.notifications.length,
      active_sources: db.sources.filter(s => s.active).length
    }
  });
});

// Start or Stop Crawler Engine API
app.post('/api/crawler/toggle', (req, res) => {
  const { is_running } = req.body;
  db.crawler_status.is_running = Boolean(is_running);
  
  db.audit_logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: is_running ? 'CRAWLER_STARTED' : 'CRAWLER_STOPPED',
    details: is_running ? 'Crawler Engine API resumed background website monitoring.' : 'Crawler Engine API paused.'
  });

  res.json({ success: true, data: db.crawler_status });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 GyanGuru API Server listening on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

export default app;
