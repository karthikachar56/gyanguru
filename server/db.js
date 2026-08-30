import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure dotenv is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://achark659_db_user:OdIJ81nY9fnVkKe9@cluster0.v0kivwb.mongodb.net/gyanguru?retryWrites=true&w=majority';

// --- MONGOOSE SCHEMAS & MODELS ---

const SourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  base_url: { type: String, required: true },
  notification_url: { type: String, required: true },
  category: { type: String, default: 'General Education' },
  source_type: { type: String, default: 'State/National Board' },
  active: { type: Boolean, default: true },
  scan_interval: { type: String, default: '15 min' },
  last_scanned_at: { type: String, default: () => new Date().toISOString() },
  documents_found: { type: Number, default: 0 }
}, { timestamps: true });

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  source_id: { type: String, required: true },
  source_name: { type: String, required: true },
  title: { type: String, required: true },
  pdf_url: { type: String, required: true },
  file_hash: { type: String, required: true },
  downloaded_at: { type: String, default: () => new Date().toISOString() },
  published_at: { type: String, default: () => new Date().toISOString().split('T')[0] },
  file_size: { type: String, default: '1.0 MB' },
  status: { type: String, default: 'AWAITING_APPROVAL' },
  pages: { type: Number, default: 1 }
}, { timestamps: true });

const ExtractionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  document_id: { type: String, required: true },
  source_name: { type: String, required: true },
  document_title: { type: String, required: true },
  pdf_url: { type: String, required: true },
  extracted_data: { type: Object, required: true },
  validation: {
    is_valid: { type: Boolean, default: true },
    flags: { type: [String], default: [] },
    confidence_score: { type: Number, default: 95.0 }
  },
  status: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING_REVIEW' },
  created_at: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  document_id: { type: String, required: true },
  exam: { type: String, required: true },
  year: { type: Number, required: true },
  notification_type: { type: String, required: true },
  badge_type: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  publication_date: { type: String, required: true },
  application_start: { type: String, default: '' },
  application_end: { type: String, default: '' },
  result_date: { type: String, default: '' },
  counselling_start: { type: String, default: '' },
  counselling_end: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  important_instructions: { type: String, default: '' },
  pdf_url: { type: String, required: true },
  official_source: { type: String, required: true },
  verification_status: { type: String, default: 'Verified Govt Document' },
  created_at: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

const CrawlerStatusSchema = new mongoose.Schema({
  key: { type: String, default: 'global_status', unique: true },
  is_running: { type: Boolean, default: true },
  started_at: { type: String, default: () => new Date().toISOString() },
  duplicates_skipped: { type: Number, default: 38 }
}, { timestamps: true });

const StudentResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roll_number: { type: String, required: true, index: true },
  application_no: { type: String, required: true, index: true },
  candidate_name: { type: String, required: true },
  exam: { type: String, required: true },
  year: { type: Number, required: true },
  marks_obtained: { type: Number, required: true },
  max_marks: { type: Number, required: true },
  percentile: { type: Number, required: true },
  all_india_rank: { type: Number, required: true },
  state_rank: { type: Number },
  category: { type: String, default: 'UR' },
  result_status: { type: String, default: 'QUALIFIED' },
  allotted_college: { type: String },
  pdf_url: { type: String },
  official_notice_title: { type: String },
  published_date: { type: String, default: () => new Date().toISOString() },
  subject_marks: {
    physics: { type: Number },
    chemistry: { type: Number },
    biology_maths: { type: Number }
  },
  verification_hash: { type: String }
}, { timestamps: true });

export const SourceModel = mongoose.model('Source', SourceSchema);
export const DocumentModel = mongoose.model('Document', DocumentSchema);
export const ExtractionModel = mongoose.model('Extraction', ExtractionSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
export const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);
export const CrawlerStatusModel = mongoose.model('CrawlerStatus', CrawlerStatusSchema);
export const StudentResultModel = mongoose.model('StudentResult', StudentResultSchema);

// Initial Seed Data
const initialSources = [
  { id: 'src_1', name: 'National Testing Agency (NTA)', base_url: 'https://neet.nta.nic.in', notification_url: 'https://neet.nta.nic.in/public-notices/', category: 'National / NEET', source_type: 'National Board (NTA)', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 42 },
  { id: 'src_2', name: 'MCC All India Quota (MCC)', base_url: 'https://mcc.nic.in', notification_url: 'https://mcc.nic.in/ug-medical-counselling/', category: 'National / AIQ', source_type: 'MCC / DGHS', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 35 },
  { id: 'src_3', name: 'Karnataka Examinations Authority (KEA)', base_url: 'https://cetonline.karnataka.gov.in/kea/', notification_url: 'https://cetonline.karnataka.gov.in/kea/ugcet2026', category: 'Karnataka / KCET', source_type: 'State Authority (KEA)', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 28 },
  { id: 'src_4', name: 'State Common Entrance Test Cell (Maharashtra)', base_url: 'https://cetcell.mahacet.org', notification_url: 'https://medical2024.mahacet.org', category: 'Maharashtra', source_type: 'State CET Cell', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 19 },
  { id: 'src_5', name: 'TN Medical Selection Committee (Tamil Nadu)', base_url: 'https://tnmedicalselection.net', notification_url: 'https://tnhealth.tn.gov.in', category: 'Tamil Nadu', source_type: 'Directorate of Medical Education', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 22 },
  { id: 'src_6', name: 'Directorate of Medical Education (UPDGME UP)', base_url: 'https://upneet.gov.in', notification_url: 'https://dgme.up.gov.in', category: 'Uttar Pradesh', source_type: 'UPDGME', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 25 },
  { id: 'src_7', name: 'Commissioner for Entrance Exams (CEE Kerala)', base_url: 'https://cee.kerala.gov.in', notification_url: 'https://cee.kerala.gov.in/keamonline', category: 'Kerala', source_type: 'CEE Kerala', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 18 },
  { id: 'src_8', name: 'ACPUGMEC Medical Admissions (Gujarat)', base_url: 'https://medadmgujarat.org', notification_url: 'https://www.medadmgujarat.org/ug/home.aspx', category: 'Gujarat', source_type: 'ACPUGMEC', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 16 },
  { id: 'src_9', name: 'RajUGNeet Medical Board (Rajasthan)', base_url: 'https://rajugneet2024.com', notification_url: 'https://rajugneet2024.com', category: 'Rajasthan', source_type: 'RajUGNeet Board', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 21 },
  { id: 'src_10', name: 'West Bengal Medical Counselling (WBMCC)', base_url: 'https://wbmcc.nic.in', notification_url: 'https://wbmcc.nic.in/ug/', category: 'West Bengal', source_type: 'WBMCC', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 17 },
  { id: 'src_11', name: 'Dr. YSR University of Health Sciences (AP)', base_url: 'https://drysruhs.edu.in', notification_url: 'https://apneet.apcfss.in', category: 'Andhra Pradesh', source_type: 'Dr. YSRUHS', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 20 },
  { id: 'src_12', name: 'KNRUHS Medical University (Telangana)', base_url: 'https://knruhs.telangana.gov.in', notification_url: 'https://tsmedadm.tsche.in', category: 'Telangana', source_type: 'KNRUHS', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 19 },
  { id: 'src_13', name: 'GGSIPU & MCC Delhi Admissions (Delhi)', base_url: 'https://ipu.admissions.nic.in', notification_url: 'https://ipu.ac.in', category: 'Delhi', source_type: 'GGSIPU', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 24 },
  { id: 'src_14', name: 'DME MP Online Medical Portal (Madhya Pradesh)', base_url: 'https://dme.mponline.gov.in', notification_url: 'https://dme.mponline.gov.in', category: 'Madhya Pradesh', source_type: 'DME MP', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 15 },
  { id: 'src_15', name: 'BFUHS Health Sciences (Punjab)', base_url: 'https://bfuhs.ac.in', notification_url: 'https://bfuhs.ac.in/neet_web/', category: 'Punjab', source_type: 'BFUHS', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 14 },
  { id: 'src_16', name: 'UHSR Rohtak Medical Counselling (Haryana)', base_url: 'https://uhsrcounselling.com', notification_url: 'https://dmer.haryana.gov.in', category: 'Haryana', source_type: 'UHSR Haryana', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 16 },
  { id: 'src_17', name: 'BCECEB UGMAC Medical Board (Bihar)', base_url: 'https://bceceboard.bihar.gov.in', notification_url: 'https://bceceboard.bihar.gov.in/UGMAC2026/', category: 'Bihar', source_type: 'BCECEB', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 18 },
  { id: 'src_18', name: 'OJEE Committee Medical Admissions (Odisha)', base_url: 'https://ojee.nic.in', notification_url: 'https://ojee.nic.in/neet-ug-counselling/', category: 'Odisha', source_type: 'OJEE Committee', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 17 },
  { id: 'src_19', name: 'DME Assam Medical Education (Assam)', base_url: 'https://dme.assam.gov.in', notification_url: 'https://dme.assam.gov.in', category: 'Assam', source_type: 'DME Assam', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 12 },
  { id: 'src_20', name: 'CGDME Medical Education (Chhattisgarh)', base_url: 'https://cgdme.in', notification_url: 'https://cgdme.in', category: 'Chhattisgarh', source_type: 'CGDME', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 13 },
  { id: 'src_21', name: 'JCECEB Competitive Exam Board (Jharkhand)', base_url: 'https://jceceb.jharkhand.gov.in', notification_url: 'https://jceceb.jharkhand.gov.in', category: 'Jharkhand', source_type: 'JCECEB', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 14 },
  { id: 'src_22', name: 'AMRU HP Medical University (Himachal Pradesh)', base_url: 'https://amruhp.ac.in', notification_url: 'https://amruhp.ac.in/neet-ug/', category: 'Himachal Pradesh', source_type: 'AMRU HP', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 15 },
  { id: 'src_23', name: 'HNBUMU Uttarakhand Medical (Uttarakhand)', base_url: 'https://hnbumu.ac.in', notification_url: 'https://hnbumu.ac.in', category: 'Uttarakhand', source_type: 'HNBUMU', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 11 },
  { id: 'src_24', name: 'JKBOPEE Entrance Board (Jammu & Kashmir)', base_url: 'https://jkbopee.gov.in', notification_url: 'https://jkbopee.gov.in', category: 'Jammu & Kashmir', source_type: 'JKBOPEE', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 16 },
  { id: 'src_25', name: 'DTE Goa Technical Education (Goa)', base_url: 'https://dte.goa.gov.in', notification_url: 'https://dte.goa.gov.in', category: 'Goa', source_type: 'DTE Goa', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 10 },
  { id: 'src_26', name: 'CENTAC Admission Committee (Puducherry)', base_url: 'https://centacpuducherry.in', notification_url: 'https://centacpuducherry.in', category: 'Puducherry', source_type: 'CENTAC', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 12 },
  { id: 'src_27', name: 'DME Tripura Medical Education (Tripura)', base_url: 'https://dme.tripura.gov.in', notification_url: 'https://dme.tripura.gov.in', category: 'Tripura', source_type: 'DME Tripura', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 9 },
  { id: 'src_28', name: 'DHS Manipur Health Directorate (Manipur)', base_url: 'https://manipurhealthdirectorate.mn.gov.in', notification_url: 'https://manipurhealthdirectorate.mn.gov.in', category: 'Manipur', source_type: 'DHS Manipur', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 8 },
  { id: 'src_29', name: 'Department of Health (Meghalaya)', base_url: 'https://meghealth.gov.in', notification_url: 'https://meghealth.gov.in', category: 'Meghalaya', source_type: 'Health Meghalaya', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 7 },
  { id: 'src_30', name: 'GMCH Chandigarh Medical College (Chandigarh)', base_url: 'https://gmch.gov.in', notification_url: 'https://gmch.gov.in', category: 'Chandigarh', source_type: 'GMCH Chandigarh', active: true, scan_interval: '10 min', last_scanned_at: new Date().toISOString(), documents_found: 11 }
];

const initialDocuments = [
  {
    id: 'doc_101',
    source_id: 'src_1',
    source_name: 'NTA NEET UG Official Portal',
    title: 'Declaration of Result and Score Card for NEET (UG) 2026',
    pdf_url: 'https://neet.nta.nic.in/docs/NEET_UG_2026_Result_Notice.pdf',
    file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    downloaded_at: new Date(Date.now() - 3600000).toISOString(),
    published_at: '2026-08-15',
    file_size: '1.4 MB',
    status: 'PUBLISHED',
    pages: 4
  },
  {
    id: 'doc_102',
    source_id: 'src_2',
    source_name: 'KEA KCET Admissions Portal',
    title: 'UGCET 2026 First Round Seat Allotment & Option Entry Schedule',
    pdf_url: 'https://cetonline.karnataka.gov.in/docs/KCET_2026_Counselling_Schedule.pdf',
    file_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    downloaded_at: new Date(Date.now() - 7200000).toISOString(),
    published_at: '2026-08-20',
    file_size: '890 KB',
    status: 'PUBLISHED',
    pages: 2
  },
  {
    id: 'doc_103',
    source_id: 'src_3',
    source_name: 'NTA JEE Main Entrance Authority',
    title: 'Public Notice: Registration Window Extension for JEE Main 2026 Session 2',
    pdf_url: 'https://jeemain.nta.nic.in/docs/JEE_Main_2026_Session2_Notice.pdf',
    file_hash: '4b227777d4da16913254158569dd7348d2bc567266b02a2818985141e0d37e6f',
    downloaded_at: new Date(Date.now() - 900000).toISOString(),
    published_at: '2026-08-27',
    file_size: '640 KB',
    status: 'AWAITING_APPROVAL',
    pages: 3
  }
];

const initialExtractions = [
  {
    id: 'ext_201',
    document_id: 'doc_103',
    source_name: 'NTA JEE Main Entrance Authority',
    document_title: 'Public Notice: Registration Window Extension for JEE Main 2026 Session 2',
    pdf_url: 'https://jeemain.nta.nic.in/docs/JEE_Main_2026_Session2_Notice.pdf',
    extracted_data: {
      exam_name: 'JEE Main',
      year: 2026,
      notification_type: 'Registration Window Extension',
      title: 'JEE Main 2026 Session 2 Online Application Extended',
      publication_date: '2026-08-27',
      application_start: '2026-08-01',
      application_end: '2026-09-05',
      result_date: '2026-09-25',
      counselling_start: '2026-10-01',
      counselling_end: '2026-10-15',
      eligibility: 'Passed or appearing in Class 12 / equivalent examination in 2024, 2025, or 2026 with Physics, Mathematics, and Chemistry.',
      important_instructions: 'Candidates can modify their exam city choices up to 05.09.2026 (11:50 PM). Fee payment through net banking/UPI.',
      official_link: 'https://jeemain.nta.nic.in'
    },
    validation: {
      is_valid: true,
      flags: [],
      confidence_score: 98.4
    },
    status: 'PENDING_REVIEW',
    created_at: new Date(Date.now() - 850000).toISOString()
  }
];

const initialNotifications = [
  {
    id: 'notif_1',
    document_id: 'doc_101',
    exam: 'NEET UG',
    year: 2026,
    notification_type: 'Result Declaration',
    badge_type: '🔴 Result Announced',
    title: 'NEET UG 2026 Official Result & All India Rank List Declared',
    summary: 'National Testing Agency (NTA) has officially published the NEET UG 2026 results along with candidate score cards and cut-off percentile details.',
    publication_date: '2026-08-15',
    application_start: '2026-02-09',
    application_end: '2026-03-16',
    result_date: '2026-08-15',
    counselling_start: '2026-08-25',
    counselling_end: '2026-09-10',
    eligibility: 'Must have passed 10+2 with Physics, Chemistry, Biology/Biotechnology with a minimum of 50% aggregate (40% for SC/ST/OBC).',
    important_instructions: 'Download official scorecards from neet.nta.nic.in. MCC Medical Counselling registration opens August 25.',
    pdf_url: 'https://neet.nta.nic.in/docs/NEET_UG_2026_Result_Notice.pdf',
    official_source: 'National Testing Agency (NTA)',
    verification_status: 'Verified Govt Document',
    result_format: 'PDF_TRANSCRIBED',
    portal_url: 'https://neet.nta.nic.in',
    created_at: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: 'notif_2',
    document_id: 'doc_102',
    exam: 'KCET',
    year: 2026,
    notification_type: 'Counselling Schedule',
    badge_type: '🟡 Registration Open',
    title: 'KCET 2026 UGCET Round 1 Option Entry & Seat Matrix Published',
    summary: 'Karnataka Examinations Authority (KEA) opens online option entry for Engineering, Agriculture, and Veterinary seats across Karnataka colleges.',
    publication_date: '2026-08-20',
    application_start: '2026-08-20',
    application_end: '2026-08-31',
    result_date: '2026-09-02',
    counselling_start: '2026-08-20',
    counselling_end: '2026-09-05',
    eligibility: 'Karnataka domicile candidate who qualified KCET 2026 with minimum 45% aggregate in PCM in 2nd PUC.',
    important_instructions: 'Verify document verification status prior to submitting priority college choices on KEA portal.',
    pdf_url: 'https://cetonline.karnataka.gov.in/docs/KCET_2026_Counselling_Schedule.pdf',
    official_source: 'Karnataka Examinations Authority (KEA)',
    verification_status: 'Verified Govt Document',
    result_format: 'WEB_PORTAL_LINK',
    portal_url: 'https://cetonline.karnataka.gov.in/kea/ugcet2026',
    created_at: new Date(Date.now() - 7000000).toISOString()
  }
];

const initialAuditLogs = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: 'System Bot',
    action: 'SCAN_COMPLETED',
    details: 'Scanned KEA KCET portal. Detected 1 new PDF (KCET_2026_Counselling_Schedule.pdf).'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 7100000).toISOString(),
    user: 'AI Pipeline Engine',
    action: 'AI_EXTRACTION_COMPLETED',
    details: 'Extracted structured fields for doc_102 with 99.1% confidence score.'
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    user: 'Admin (Karthik)',
    action: 'NOTIFICATION_APPROVED',
    details: 'Approved notification #notif_2 (KCET 2026 UGCET Round 1 Option Entry).'
  },
  {
    id: 'log_4',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    user: 'System Bot',
    action: 'SCAN_COMPLETED',
    details: 'Scanned NTA JEE portal. SHA-256 mismatch detected! New PDF downloaded.'
  }
];

const initialStudentResults = [
  {
    id: 'res_2001',
    roll_number: '240410198421',
    application_no: '2603109845',
    candidate_name: 'Rahul Sharma',
    exam: 'NEET UG',
    year: 2026,
    marks_obtained: 685,
    max_marks: 720,
    percentile: 99.84,
    all_india_rank: 412,
    state_rank: 28,
    category: 'UR',
    result_status: 'QUALIFIED FOR ALL INDIA COUNSELLING',
    allotted_college: 'Bangalore Medical College & Research Institute (BMCRI)',
    pdf_url: 'https://neet.nta.nic.in/docs/NEET_UG_2026_MeritList.pdf',
    official_notice_title: 'NEET UG 2026 Official Scorecard & Merit Ranks',
    published_date: '2026-08-15',
    subject_marks: { physics: 175, chemistry: 170, biology_maths: 340 },
    verification_hash: 'SHA256-NTA2026-98421-BMCRI'
  },
  {
    id: 'res_2002',
    roll_number: '240410198422',
    application_no: '2603109846',
    candidate_name: 'Ananya Rao',
    exam: 'NEET UG',
    year: 2026,
    marks_obtained: 670,
    max_marks: 720,
    percentile: 99.61,
    all_india_rank: 1205,
    state_rank: 84,
    category: 'OBC',
    result_status: 'QUALIFIED FOR ALL INDIA COUNSELLING',
    allotted_college: 'Karnataka Institute of Medical Sciences (KIMS Hubli)',
    pdf_url: 'https://neet.nta.nic.in/docs/NEET_UG_2026_MeritList.pdf',
    official_notice_title: 'NEET UG 2026 Official Scorecard & Merit Ranks',
    published_date: '2026-08-15',
    subject_marks: { physics: 165, chemistry: 165, biology_maths: 340 },
    verification_hash: 'SHA256-NTA2026-98422-KIMS'
  },
  {
    id: 'res_2003',
    roll_number: '2026KCET0984',
    application_no: 'KEA20260481',
    candidate_name: 'Prajwal Kumar',
    exam: 'KCET',
    year: 2026,
    marks_obtained: 168,
    max_marks: 180,
    percentile: 99.91,
    all_india_rank: 14,
    state_rank: 14,
    category: 'UR',
    result_status: 'ROUND 1 SEAT ALLOTTED',
    allotted_college: 'BMS College of Engineering (Computer Science Engineering)',
    pdf_url: 'https://cetonline.karnataka.gov.in/docs/KCET_2026_Counselling_Schedule.pdf',
    official_notice_title: 'UGCET 2026 First Round Seat Allotment',
    published_date: '2026-08-20',
    subject_marks: { physics: 56, chemistry: 54, biology_maths: 58 },
    verification_hash: 'SHA256-KEA2026-0984-BMSCE'
  }
];

// Seed Database Function
export async function seedDatabaseIfEmpty() {
  try {
    const sourcesCount = await SourceModel.countDocuments();
    if (sourcesCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial portal sources...');
      await SourceModel.insertMany(initialSources);
    }

    const docsCount = await DocumentModel.countDocuments();
    if (docsCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial documents...');
      await DocumentModel.insertMany(initialDocuments);
    }

    const extCount = await ExtractionModel.countDocuments();
    if (extCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial AI extractions...');
      await ExtractionModel.insertMany(initialExtractions);
    }

    const notifCount = await NotificationModel.countDocuments();
    if (notifCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial published notifications...');
      await NotificationModel.insertMany(initialNotifications);
    }

    const studentResCount = await StudentResultModel.countDocuments();
    if (studentResCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial student result records...');
      await StudentResultModel.insertMany(initialStudentResults);
    }

    const logsCount = await AuditLogModel.countDocuments();
    if (logsCount === 0) {
      console.log('[MongoDB Atlas] Seeding initial audit logs...');
      await AuditLogModel.insertMany(initialAuditLogs);
    }

    const crawlerCount = await CrawlerStatusModel.countDocuments();
    if (crawlerCount === 0) {
      console.log('[MongoDB Atlas] Seeding crawler status...');
      await CrawlerStatusModel.create({
        key: 'global_status',
        is_running: true,
        started_at: new Date().toISOString(),
        duplicates_skipped: 38
      });
    }

    console.log('✅ [MongoDB Atlas] Database seed check completed successfully.');
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Error during database seeding:', err.message);
  }
}

// Export Initial Seed Data for In-Memory Fallback
export { initialSources, initialDocuments, initialExtractions, initialNotifications, initialAuditLogs, initialStudentResults };

// In-Memory Storage Fallback Cache
export const inMemoryDB = {
  sources: [...initialSources],
  documents: [...initialDocuments],
  extractions: [...initialExtractions],
  notifications: [...initialNotifications],
  studentResults: [...initialStudentResults],
  auditLogs: [...initialAuditLogs],
  crawlerStatus: { key: 'global_status', is_running: true, started_at: new Date().toISOString(), duplicates_skipped: 38 }
};

// Database Connection Helper
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    mongoose.set('bufferCommands', false);
    console.log('[MongoDB Atlas] Connecting to database...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('🚀 [MongoDB Atlas] Connected successfully to MongoDB Atlas database!');
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Connection failed or timed out:', err.message);
    console.log('💡 [Fallback Engine] Using In-Memory Local Database mode for seamless operation.');
  }
}


