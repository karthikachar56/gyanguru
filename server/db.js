import fs from 'fs';
import path from 'path';

class InMemoryDB {
  constructor() {
    this.sources = [
      {
        id: 'src_1',
        name: 'NTA NEET UG Official Portal',
        base_url: 'https://neet.nta.nic.in',
        notification_url: 'https://neet.nta.nic.in/public-notices/',
        category: 'Medical / NEET',
        source_type: 'National Board (NTA)',
        active: true,
        scan_interval: '10 min',
        last_scanned_at: new Date(Date.now() - 120000).toISOString(),
        documents_found: 42
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
        last_scanned_at: new Date(Date.now() - 300000).toISOString(),
        documents_found: 28
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
        last_scanned_at: new Date(Date.now() - 60000).toISOString(),
        documents_found: 51
      }
    ];

    this.documents = [
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

    this.extractions = [
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

    this.notifications = [
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
        created_at: new Date(Date.now() - 7000000).toISOString()
      }
    ];

    this.audit_logs = [
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
    this.crawler_status = {
      is_running: true,
      started_at: new Date().toISOString(),
      total_downloaded: 14,
      total_transcribed: 14,
      duplicates_skipped: 38
    };
  }
}

export const db = new InMemoryDB();
