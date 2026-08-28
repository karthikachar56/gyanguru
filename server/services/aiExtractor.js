// AI PDF Document Intelligence & Validation Service

export function processPdfAndExtract(document, rawText) {
  // Simulate AI document intelligence reading PDF text and extracting structured JSON fields
  console.log(`[AI Engine] Processing document ID: ${document.id}`);

  // Determine metadata from title or raw text
  let exam_name = 'NEET UG';
  if (document.title.toLowerCase().includes('kcet') || document.title.toLowerCase().includes('ugcet')) {
    exam_name = 'KCET';
  } else if (document.title.toLowerCase().includes('jee')) {
    exam_name = 'JEE Main';
  } else if (document.title.toLowerCase().includes('cbse')) {
    exam_name = 'CBSE 12th';
  }

  const currentYear = new Date().getFullYear();

  const extracted_data = {
    exam_name,
    year: currentYear,
    notification_type: document.title.includes('Result') ? 'Result Declaration' : 'Official Notice',
    title: document.title,
    publication_date: document.published_at || new Date().toISOString().split('T')[0],
    application_start: `${currentYear}-08-01`,
    application_end: `${currentYear}-09-10`,
    result_date: `${currentYear}-09-15`,
    counselling_start: `${currentYear}-09-20`,
    counselling_end: `${currentYear}-10-05`,
    eligibility: `Standard eligibility for ${exam_name} ${currentYear} admissions as mandated by official conducting body.`,
    important_instructions: 'Candidates must regularly check the official portal for merit list updates and upload verified documents.',
    official_link: document.pdf_url
  };

  // Run Validation Layer on extracted JSON
  const validationFlags = [];
  
  // Date validation check
  const pubDate = new Date(extracted_data.publication_date);
  if (isNaN(pubDate.getTime())) {
    validationFlags.push('INVALID_PUBLICATION_DATE');
  }

  // Year validation check
  if (extracted_data.year < 2024 || extracted_data.year > 2030) {
    validationFlags.push('YEAR_MISMATCH_WARNING');
  }

  const confidenceScore = Math.floor(88 + Math.random() * 11);

  return {
    extracted_data,
    validation: {
      is_valid: validationFlags.length === 0,
      flags: validationFlags,
      confidence_score: confidenceScore
    }
  };
}
