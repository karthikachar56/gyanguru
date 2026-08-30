export interface Notification {
  id: string;
  document_id: string;
  exam: string;
  year: number;
  notification_type: string;
  badge_type: string;
  title: string;
  summary: string;
  publication_date: string;
  application_start: string;
  application_end: string;
  result_date: string;
  counselling_start: string;
  counselling_end: string;
  eligibility: string;
  important_instructions: string;
  pdf_url: string;
  official_source: string;
  verification_status: string;
  created_at: string;
  result_format?: 'PDF_TRANSCRIBED' | 'WEB_PORTAL_LINK';
  portal_url?: string;
  portal_http_status?: number;
  portal_latency_ms?: number;
}

export interface StudentResult {
  id: string;
  roll_number: string;
  application_no: string;
  candidate_name: string;
  exam: string;
  year: number;
  marks_obtained: number;
  max_marks: number;
  percentile: number;
  all_india_rank: number;
  state_rank?: number;
  category: string;
  result_status: string;
  allotted_college?: string;
  pdf_url?: string;
  official_notice_title: string;
  published_date: string;
  subject_marks?: {
    physics?: number;
    chemistry?: number;
    biology_maths?: number;
  };
  verification_hash?: string;
}

export interface MonitoredSource {
  id: string;
  name: string;
  base_url: string;
  notification_url: string;
  category: string;
  source_type: string;
  active: boolean;
  scan_interval: string;
  last_scanned_at: string;
  documents_found: number;
}

export interface PDFDocument {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  pdf_url: string;
  file_hash: string;
  downloaded_at: string;
  published_at: string;
  file_size: string;
  status: string;
  pages: number;
}

export interface ExtractedData {
  exam_name: string;
  year: number;
  notification_type: string;
  title: string;
  publication_date: string;
  application_start: string;
  application_end: string;
  result_date: string;
  counselling_start: string;
  counselling_end: string;
  eligibility: string;
  important_instructions: string;
  official_link: string;
}

export interface ExtractionRecord {
  id: string;
  document_id: string;
  source_name: string;
  document_title: string;
  pdf_url: string;
  extracted_data: ExtractedData;
  validation: {
    is_valid: boolean;
    flags: string[];
    confidence_score: number;
  };
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface StatePortal {
  id: string;
  state: string;
  authority: string;
  exam: string;
  official_url: string;
  allotment_url: string;
  category: 'National' | 'South' | 'North' | 'West' | 'East' | 'Central' | 'Northeast';
  code: string;
  status: string;
}

