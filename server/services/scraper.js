import { db } from '../db.js';
import { processPdfAndExtract } from './aiExtractor.js';
import crypto from 'crypto';

export function runSourceScan(sourceId) {
  const source = db.sources.find(s => s.id === sourceId);
  if (!source) return { success: false, message: 'Source not found' };

  console.log(`[Scraper Engine] Initiating live crawl on portal: ${source.name}`);

  // Update last scanned timestamp
  source.last_scanned_at = new Date().toISOString();

  // Generate simulated new notification & PDF detect
  const newPdfId = `doc_${Date.now()}`;
  const mockPdfTitle = `${source.name.split(' ')[0]} ${new Date().getFullYear()} Official Public Notice #${Math.floor(Math.random() * 899 + 100)}`;
  
  // Calculate SHA-256 hash to test hash deduplication
  const fileHash = crypto.createHash('sha256').update(mockPdfTitle + Date.now()).digest('hex');

  // Check if hash exists in db
  const existingDoc = db.documents.find(d => d.file_hash === fileHash);
  if (existingDoc) {
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Scraper Bot',
      action: 'HASH_MATCH_SKIPPED',
      details: `Scanned ${source.name}. PDF hash matched existing document ${existingDoc.id}. Processing skipped.`
    });
    return { success: true, new_documents: 0, message: 'No new changes detected (Hash match).' };
  }

  // Create new document record
  const newDocument = {
    id: newPdfId,
    source_id: source.id,
    source_name: source.name,
    title: mockPdfTitle,
    pdf_url: `${source.base_url}/docs/notice_${Date.now()}.pdf`,
    file_hash: fileHash,
    downloaded_at: new Date().toISOString(),
    published_at: new Date().toISOString().split('T')[0],
    file_size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    status: 'AWAITING_APPROVAL',
    pages: Math.floor(Math.random() * 5 + 1)
  };

  db.documents.unshift(newDocument);
  source.documents_found += 1;
  if (db.crawler_status) {
    db.crawler_status.total_downloaded = (db.crawler_status.total_downloaded || 0) + 1;
  }

  // Trigger AI Document Intelligence pipeline
  const { extracted_data, validation } = processPdfAndExtract(newDocument, mockPdfTitle);

  const extractionRecord = {
    id: `ext_${Date.now()}`,
    document_id: newDocument.id,
    source_name: source.name,
    document_title: newDocument.title,
    pdf_url: newDocument.pdf_url,
    extracted_data,
    validation,
    status: 'PENDING_REVIEW',
    created_at: new Date().toISOString()
  };

  db.extractions.unshift(extractionRecord);
  if (db.crawler_status) {
    db.crawler_status.total_transcribed = (db.crawler_status.total_transcribed || 0) + 1;
  }

  // Log to Audit trail
  db.audit_logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Scraper Bot',
    action: 'NEW_PDF_DETECTED',
    details: `Scanned ${source.name}. Detected new PDF (${newDocument.title}). Downloaded & sent to AI Extraction queue.`
  });

  return {
    success: true,
    new_documents: 1,
    document: newDocument,
    extraction: extractionRecord
  };
}
