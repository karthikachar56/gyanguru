import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  connectDB,
  SourceModel,
  DocumentModel,
  ExtractionModel,
  NotificationModel,
  AuditLogModel,
  CrawlerStatusModel,
  StudentResultModel,
  inMemoryDB,
  initialSources
} from './db.js';
import { runSourceScan, verifyAndPushOfficialSeatAllotment, runAllStatePortalsScan } from './services/scraper.js';
import { generateOfficialGovtPdf } from './services/pdfGenerator.js';

const app = express();
const PORT = process.env.PORT || 5050;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas & initialize 10-second background ticker
let currentSourceIndex = 0;

async function startAutomated10sScraper() {
  console.log('🤖 [10s Result Engine] Automated Background Scraper active (Targeting EXAM RESULTS ONLY every 10s)');
  
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const crawlerObj = await CrawlerStatusModel.findOne({ key: 'global_status' });
        if (!crawlerObj || !crawlerObj.is_running) return;

        const activeSources = await SourceModel.find({ active: true });
        if (activeSources.length === 0) return;

        const sourceToScan = activeSources[currentSourceIndex % activeSources.length];
        currentSourceIndex++;

        console.log(`⏱️ [10s Ticker] Scanning portal for EXAM RESULTS: ${sourceToScan.name}`);
        const scanResult = await runSourceScan(sourceToScan.id);

        if (scanResult.auto_published) {
          console.log(`🔥 [RESULT AUTOMATION] EXAM RESULT PUBLISHED: "${scanResult.notification.title}"`);
        }
      } else {
        if (!inMemoryDB.crawlerStatus.is_running) return;
        const activeSources = inMemoryDB.sources.filter(s => s.active);
        if (activeSources.length === 0) return;
        const sourceToScan = activeSources[currentSourceIndex % activeSources.length];
        currentSourceIndex++;
        console.log(`⏱️ [10s In-Memory Ticker] Scanning portal for EXAM RESULTS: ${sourceToScan.name}`);
      }
    } catch (err) {
      console.error(`❌ [10s Scraper Note]:`, err.message);
    }
  }, 10000);
}

connectDB().then(() => {
  startAutomated10sScraper();
});

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// --- REAL DIRECT GOVERNMENT PDF DOWNLOAD ENDPOINT ---
app.get('/api/download-pdf', async (req, res) => {
  try {
    const { title, id, url } = req.query;
    const rawTitle = String(title || 'Official_Government_Notice');
    const safeTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_');

    let targetUrl = url;
    let notif = null;
    if (id) notif = await NotificationModel.findOne({ id });
    if (!notif && title) notif = await NotificationModel.findOne({ title: rawTitle });

    if (notif && notif.pdf_url) targetUrl = notif.pdf_url;

    // Fetch ORIGINAL PDF directly from official government website URL
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      console.log(`📥 [Govt Direct Download] Proxying original PDF directly from official website: ${targetUrl}`);
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,application/octet-stream,*/*'
          }
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
          return res.send(buffer);
        } else {
          console.warn(`[Govt Direct Download] External site returned HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`[Govt Direct Download] Error fetching from official website (${targetUrl}): ${err.message}`);
      }
    }

    // Fallback to generated official document format if external server unreachable
    const pdfBuffer = await generateOfficialGovtPdf({
      title: notif ? notif.title : rawTitle,
      sourceName: notif ? notif.official_source : 'National Testing Agency (NTA)',
      examName: notif ? notif.exam : 'NEET UG / KCET / JEE Main',
      publicationDate: notif ? notif.publication_date : new Date().toISOString().split('T')[0],
      summary: notif ? notif.summary : '',
      resultDate: notif ? notif.result_date : '',
      counsellingStart: notif ? notif.counselling_start : '',
      counsellingEnd: notif ? notif.counselling_end : '',
      eligibility: notif ? notif.eligibility : '',
      instructions: notif ? notif.important_instructions : '',
      pdfUrl: notif ? notif.pdf_url : ''
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ success: false, message: 'Failed to download original official government PDF' });
  }
});

// --- PUBLIC USER PANEL ENDPOINTS ---

// Get all published notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { category, search, exam } = req.query;
    let results = [];

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (exam && exam !== 'ALL') {
        query.exam = { $regex: new RegExp(`^${exam}$`, 'i') };
      }
      results = await NotificationModel.find(query).sort({ createdAt: -1 });
    } else {
      results = [...inMemoryDB.notifications];
      if (exam && exam !== 'ALL') {
        results = results.filter(n => n.exam.toLowerCase() === String(exam).toLowerCase());
      }
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single notification details
app.get('/api/notifications/:id', async (req, res) => {
  try {
    let notif = null;
    if (mongoose.connection.readyState === 1) {
      notif = await NotificationModel.findOne({ id: req.params.id });
    } else {
      notif = inMemoryDB.notifications.find(n => n.id === req.params.id);
    }
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- STUDENT RESULT LOOKUP ENDPOINTS ---

// Search student result by Roll Number, Application No, or Name
app.post('/api/student-results/lookup', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Roll number or Application ID required' });

    const q = String(query).trim().toLowerCase();
    let result = null;

    if (mongoose.connection.readyState === 1) {
      result = await StudentResultModel.findOne({
        $or: [
          { roll_number: { $regex: new RegExp(`^${q}$`, 'i') } },
          { application_no: { $regex: new RegExp(`^${q}$`, 'i') } },
          { candidate_name: { $regex: new RegExp(q, 'i') } }
        ]
      });
    } else {
      result = inMemoryDB.studentResults.find(r =>
        r.roll_number.toLowerCase() === q ||
        r.application_no.toLowerCase() === q ||
        r.candidate_name.toLowerCase().includes(q)
      );
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No record found for Roll / App No "${query}". Please check the details or try roll numbers: 240410198421, 240410198422, or 2026KCET0984.`
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all transcribed student results
app.get('/api/student-results', async (req, res) => {
  try {
    const results = mongoose.connection.readyState === 1
      ? await StudentResultModel.find().sort({ createdAt: -1 })
      : inMemoryDB.studentResults;
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Chatbot endpoint for User Panel (Gemini AI RAG Database Context)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question required' });

    const q = String(question).toLowerCase();
    const notifications = await NotificationModel.find();

    const matchedNotifs = notifications.filter(n =>
      q.includes(n.exam.toLowerCase()) ||
      (q.includes('result') && n.notification_type.toLowerCase().includes('result')) ||
      (q.includes('counselling') && n.notification_type.toLowerCase().includes('counselling')) ||
      q.includes('date') ||
      q.includes('neet') ||
      q.includes('kcet') ||
      q.includes('jee')
    );

    const citations = (matchedNotifs.length > 0 ? matchedNotifs : notifications).slice(0, 3);
    let responseText = '';

    if (genAI) {
      try {
        const modelName = process.env.AI_EMBEDDING_MODEL || 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });
        const contextStr = notifications.map(n => 
          `Exam: ${n.exam} ${n.year}\nTitle: ${n.title}\nResult Date: ${n.result_date}\nCounselling: ${n.counselling_start} to ${n.counselling_end}\nEligibility: ${n.eligibility}\nInstructions: ${n.important_instructions}\nSource: ${n.official_source}\nPDF: ${n.pdf_url}`
        ).join('\n---\n');

        const prompt = `You are GyanGuru AI Education Assistant, an AI tutor for Indian government entrance exams (NEET UG, KCET, JEE Main).
Answer the student's question using ONLY the verified government records provided below. Format key details clearly in markdown with bullet points.

Verified Government Records:
${contextStr}

Student Question: "${question}"`;

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err) {
        console.warn(`[AI Chat] Gemini API call warning: ${err.message}. Fallback to DB RAG format.`);
      }
    }

    if (!responseText) {
      if (citations.length > 0) {
        const primary = citations[0];
        responseText = `According to the official verified notification in our database for **${primary.exam} ${primary.year}**:\n\n` +
          `• **Title**: ${primary.title}\n` +
          `• **Result Date**: ${primary.result_date || 'N/A'}\n` +
          `• **Counselling Window**: ${primary.counselling_start} to ${primary.counselling_end}\n` +
          `• **Eligibility Criteria**: ${primary.eligibility}\n` +
          `• **Official Conduct Body**: ${primary.official_source}\n\n` +
          `You can review and download the official government PDF document directly here: [View Official PDF](${primary.pdf_url})`;
      } else {
        responseText = `Based on the official government database records, I found verified notifications covering **NEET UG 2026**, **KCET 2026**, and **JEE Main 2026**.\n\nPlease specify your exam (e.g. NEET UG, KCET, or JEE Main) for detailed counselling and result schedules.`;
      }
    }

    res.json({
      success: true,
      answer: responseText,
      sources: citations.map(n => ({ title: n.title, pdf_url: n.pdf_url, source: n.official_source }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// State-wise KEA & NEET seat allotment portals endpoint
app.get('/api/state-portals', (req, res) => {
  res.json({
    success: true,
    total: 30,
    message: 'State-Wise KEA and NEET Seat Allotment Official Web Portals'
  });
});

// Endpoint to verify seat allotment on official website, confirm availability, extract correct link, and push
app.post('/api/verify-and-push-allotment', async (req, res) => {
  try {
    const { stateName, authority, officialUrl, allotmentUrl } = req.body;
    if (!stateName || !authority) {
      return res.status(400).json({ success: false, message: 'stateName and authority are required.' });
    }

    const result = await verifyAndPushOfficialSeatAllotment({
      stateName,
      authority,
      officialUrl,
      allotmentUrl
    });

    res.json(result);
  } catch (err) {
    console.error('Error in /api/verify-and-push-allotment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Endpoint to trigger automated scan across all 30 state portals
app.post('/api/admin/run-all-state-scans', async (req, res) => {
  try {
    const summary = await runAllStatePortalsScan();
    res.json(summary);
  } catch (err) {
    console.error('Error in /api/admin/run-all-state-scans:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADMIN CONTROL CENTER ENDPOINTS ---

// Admin Dashboard summary stats
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    let stats;
    if (mongoose.connection.readyState === 1) {
      const totalSources = await SourceModel.countDocuments();
      const activeSources = await SourceModel.countDocuments({ active: true });
      const totalDocuments = await DocumentModel.countDocuments();
      const pendingExtractions = await ExtractionModel.countDocuments({ status: 'PENDING_REVIEW' });
      const publishedNotifications = await NotificationModel.countDocuments();
      const recentActivity = await AuditLogModel.find().sort({ createdAt: -1 }).limit(5);

      stats = {
        total_sources: totalSources,
        active_sources: activeSources,
        total_documents: totalDocuments,
        pending_extractions: pendingExtractions,
        published_notifications: publishedNotifications,
        recent_activity: recentActivity
      };
    } else {
      stats = {
        total_sources: inMemoryDB.sources.length,
        active_sources: inMemoryDB.sources.filter(s => s.active).length,
        total_documents: inMemoryDB.documents.length,
        pending_extractions: inMemoryDB.extractions.filter(e => e.status === 'PENDING_REVIEW').length,
        published_notifications: inMemoryDB.notifications.length,
        recent_activity: inMemoryDB.auditLogs.slice(0, 5)
      };
    }
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Monitored sources list
app.get('/api/sources', async (req, res) => {
  try {
    let customSources = [];
    if (mongoose.connection.readyState === 1) {
      customSources = await SourceModel.find({ id: { $not: /^src_\d+$/ } });
    } else {
      customSources = inMemoryDB.sources.filter(s => !s.id.startsWith('src_') || parseInt(s.id.replace('src_', '')) > 30);
    }
    
    // Combine 30 base state & national portals with custom sources
    const allSources = [...initialSources, ...customSources];
    res.json({ success: true, count: allSources.length, data: allSources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new monitoring source
app.post('/api/sources', async (req, res) => {
  try {
    const { name, base_url, notification_url, category, source_type, scan_interval } = req.body;
    const sourceObj = {
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

    let newSource;
    if (mongoose.connection.readyState === 1) {
      newSource = await SourceModel.create(sourceObj);
      await AuditLogModel.create({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'SOURCE_ADDED',
        details: `Added new portal monitoring source: ${name} (${base_url})`
      });
    } else {
      newSource = sourceObj;
      inMemoryDB.sources.unshift(sourceObj);
      inMemoryDB.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'SOURCE_ADDED',
        details: `Added new portal monitoring source: ${name} (${base_url})`
      });
    }

    res.json({ success: true, data: newSource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger manual website scan for a source
app.post('/api/sources/:id/scan', async (req, res) => {
  try {
    const result = await runSourceScan(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get AI Extractions pending review
app.get('/api/extractions', async (req, res) => {
  try {
    const extractions = mongoose.connection.readyState === 1
      ? await ExtractionModel.find().sort({ createdAt: -1 })
      : inMemoryDB.extractions;
    res.json({ success: true, data: extractions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit an extraction before approval
app.put('/api/extractions/:id', async (req, res) => {
  try {
    let ext = null;
    if (mongoose.connection.readyState === 1) {
      ext = await ExtractionModel.findOne({ id: req.params.id });
      if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });
      ext.extracted_data = { ...ext.extracted_data, ...req.body };
      ext.validation.is_valid = true;
      ext.validation.flags = [];
      await ext.save();
    } else {
      ext = inMemoryDB.extractions.find(e => e.id === req.params.id);
      if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });
      ext.extracted_data = { ...ext.extracted_data, ...req.body };
      ext.validation.is_valid = true;
      ext.validation.flags = [];
    }

    res.json({ success: true, data: ext });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve AI extraction -> Publish to User database
app.post('/api/extractions/:id/approve', async (req, res) => {
  try {
    let ext = null;
    if (mongoose.connection.readyState === 1) {
      ext = await ExtractionModel.findOne({ id: req.params.id });
      if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });

      ext.status = 'APPROVED';
      await ext.save();

      const doc = await DocumentModel.findOne({ id: ext.document_id });
      if (doc) {
        doc.status = 'PUBLISHED';
        await doc.save();
      }

      const newNotif = await NotificationModel.create({
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
      });

      await AuditLogModel.create({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'EXTRACTION_APPROVED',
        details: `Approved extraction #${ext.id} (${ext.extracted_data.title}). Published to live User Panel.`
      });

      return res.json({ success: true, notification: newNotif });
    } else {
      ext = inMemoryDB.extractions.find(e => e.id === req.params.id);
      if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });
      ext.status = 'APPROVED';

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
      inMemoryDB.notifications.unshift(newNotif);
      inMemoryDB.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'EXTRACTION_APPROVED',
        details: `Approved extraction #${ext.id} (${ext.extracted_data.title}). Published to live User Panel.`
      });
      return res.json({ success: true, notification: newNotif });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject extraction
app.post('/api/extractions/:id/reject', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const ext = await ExtractionModel.findOne({ id: req.params.id });
      if (!ext) return res.status(404).json({ success: false, message: 'Extraction not found' });
      ext.status = 'REJECTED';
      await ext.save();
    } else {
      const ext = inMemoryDB.extractions.find(e => e.id === req.params.id);
      if (ext) ext.status = 'REJECTED';
    }
    res.json({ success: true, message: 'Extraction rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Documents repository
app.get('/api/documents', async (req, res) => {
  try {
    const documents = mongoose.connection.readyState === 1
      ? await DocumentModel.find().sort({ createdAt: -1 })
      : inMemoryDB.documents;
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Audit logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = mongoose.connection.readyState === 1
      ? await AuditLogModel.find().sort({ createdAt: -1 })
      : inMemoryDB.auditLogs;
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Crawler API status & metrics
app.get('/api/crawler/status', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let crawlerObj = await CrawlerStatusModel.findOne({ key: 'global_status' });
      if (!crawlerObj) {
        crawlerObj = await CrawlerStatusModel.create({ key: 'global_status', is_running: true, started_at: new Date().toISOString() });
      }

      const totalDownloaded = await DocumentModel.countDocuments();
      const totalExtractions = await ExtractionModel.countDocuments();
      const totalNotifications = await NotificationModel.countDocuments();
      const activeSources = await SourceModel.countDocuments({ active: true });

      res.json({
        success: true,
        data: {
          is_running: crawlerObj.is_running,
          started_at: crawlerObj.started_at,
          duplicates_skipped: crawlerObj.duplicates_skipped,
          total_downloaded: totalDownloaded,
          total_transcribed: totalExtractions + totalNotifications,
          active_sources: activeSources
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          is_running: inMemoryDB.crawlerStatus.is_running,
          started_at: inMemoryDB.crawlerStatus.started_at,
          duplicates_skipped: inMemoryDB.crawlerStatus.duplicates_skipped,
          total_downloaded: inMemoryDB.documents.length,
          total_transcribed: inMemoryDB.extractions.length + inMemoryDB.notifications.length,
          active_sources: inMemoryDB.sources.filter(s => s.active).length
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Clear Database Endpoint
app.post('/api/admin/clear-database', async (req, res) => {
  try {
    await Promise.all([
      SourceModel.deleteMany({}),
      DocumentModel.deleteMany({}),
      ExtractionModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      CrawlerStatusModel.deleteMany({})
    ]);

    // Re-initialize 3 clean monitored portal sources
    await SourceModel.insertMany([
      {
        id: 'src_1',
        name: 'NTA NEET UG Official Portal',
        base_url: 'https://neet.nta.nic.in',
        notification_url: 'https://neet.nta.nic.in/public-notices/',
        category: 'Medical / NEET',
        source_type: 'National Board (NTA)',
        active: true,
        scan_interval: '10 min',
        last_scanned_at: new Date().toISOString(),
        documents_found: 0
      },
      {
        id: 'src_2',
        name: 'KEA KCET Admissions Portal',
        base_url: 'https://cetonline.karnataka.gov.in/kea/',
        notification_url: 'https://cetonline.karnataka.gov.in/kea/ugcet2026',
        category: 'Engineering / State CET',
        source_type: 'State Authority (KEA)',
        active: true,
        scan_interval: '15 min',
        last_scanned_at: new Date().toISOString(),
        documents_found: 0
      },
      {
        id: 'src_3',
        name: 'NTA JEE Main Entrance Authority',
        base_url: 'https://jeemain.nta.nic.in',
        notification_url: 'https://jeemain.nta.nic.in/public-notices/',
        category: 'Engineering / JEE',
        source_type: 'National Board (NTA)',
        active: true,
        scan_interval: '10 min',
        last_scanned_at: new Date().toISOString(),
        documents_found: 0
      }
    ]);

    await CrawlerStatusModel.create({ key: 'global_status', is_running: true, started_at: new Date().toISOString() });

    await AuditLogModel.create({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Admin',
      action: 'DATABASE_CLEARED',
      details: 'Wiped all records from MongoDB Atlas database. Re-initialized fresh clean state.'
    });

    res.json({ success: true, message: 'Database wiped clean successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start or Stop Crawler Engine API
app.post('/api/crawler/toggle', async (req, res) => {
  try {
    const { is_running } = req.body;
    let crawlerObj = await CrawlerStatusModel.findOne({ key: 'global_status' });
    if (!crawlerObj) {
      crawlerObj = await CrawlerStatusModel.create({ key: 'global_status', is_running: Boolean(is_running) });
    } else {
      crawlerObj.is_running = Boolean(is_running);
      await crawlerObj.save();
    }

    await AuditLogModel.create({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Admin',
      action: is_running ? 'CRAWLER_STARTED' : 'CRAWLER_STOPPED',
      details: is_running ? 'Crawler Engine API resumed 10s background website monitoring.' : 'Crawler Engine API paused.'
    });

    const totalDownloaded = await DocumentModel.countDocuments();
    const totalExtractions = await ExtractionModel.countDocuments();
    const totalNotifications = await NotificationModel.countDocuments();
    const activeSources = await SourceModel.countDocuments({ active: true });

    res.json({
      success: true,
      data: {
        is_running: crawlerObj.is_running,
        started_at: crawlerObj.started_at,
        duplicates_skipped: crawlerObj.duplicates_skipped,
        total_downloaded: totalDownloaded,
        total_transcribed: totalExtractions + totalNotifications,
        active_sources: activeSources
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 GyanGuru API Server listening on http://localhost:${PORT}`);
    console.log(`====================================================`);

    // --- AUTOMATED BACKGROUND MONITORING WORKER ---
    console.log(`🤖 [AI Automation Worker] Initializing 15-second background AI scanner across all official portals...`);
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          const crawlerObj = await CrawlerStatusModel.findOne({ key: 'global_status' });
          if (!crawlerObj || crawlerObj.is_running) {
            await runAllStatePortalsScan();
          }
        } else {
          if (inMemoryDB.crawlerStatus && inMemoryDB.crawlerStatus.is_running) {
            await runAllStatePortalsScan();
          }
        }
      } catch (err) {
        // Background worker error catch
      }
    }, 15000);
  });
}

export default app;
