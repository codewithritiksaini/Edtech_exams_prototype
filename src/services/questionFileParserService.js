// =============================================================================
// QUESTION FILE PARSER SERVICE — PHASE 5 DOCUMENT PARSING & EXTRACTION
// Parses PDF, Word (.docx / .doc), and text documents into structured MCQs.
// Supports multi-choice questions, vignettes, option detection (A-E),
// answer key extraction, and clinical rationale extraction.
// =============================================================================

export const SAMPLE_MCQ_DOCUMENT_TEXT = `1. A 58-year-old male with a history of long-standing hypertension presents with acute substernal chest pressure radiating to the left shoulder and jaw. An ECG reveals ST-segment elevation in leads V1 through V4. Which of the following coronary arteries is most likely occluded?
A) Right coronary artery
B) Left anterior descending artery
C) Left circumflex artery
D) Posterior descending artery
Answer: B
Explanation: ST elevation in leads V1-V4 represents an acute anteroseptal myocardial infarction, which is classically caused by acute thrombotic occlusion of the Left Anterior Descending (LAD) coronary artery.

2. A 24-year-old female presents with acute shortness of breath, wheezing, and chest tightness following exposure to cold air. Peak expiratory flow is reduced to 55% of predicted. Which first-line pharmacotherapeutic agent should be administered immediately for acute bronchospasm relief?
A) Inhaled short-acting beta-2 agonist (Albuterol)
B) Oral leukotriene receptor antagonist (Montelukast)
C) Inhaled long-acting beta-2 agonist (Salmeterol)
D) Oral systemic corticosteroid (Prednisone)
Answer: A
Explanation: Inhaled short-acting beta-2 agonists (SABAs) such as Albuterol provide rapid bronchodilation within minutes and are the first-line acute rescue medication for acute asthma exacerbations.

3. A 45-year-old patient with chronic kidney disease (Stage 4) presents with severe muscle weakness and palpitations. Serum potassium is 6.8 mEq/L. ECG shows peaked T waves and widened QRS complexes. What is the immediate next step in management to stabilize cardiac myocyte membranes?
A) Intravenous regular insulin with 50% dextrose
B) Intravenous calcium gluconate
C) Oral sodium polystyrene sulfonate
D) Nebulized albuterol
Answer: B
Explanation: In severe hyperkalemia with ECG changes, Intravenous Calcium Gluconate (or Calcium Chloride) must be administered immediately to stabilize the cardiac membrane and prevent lethal ventricular arrhythmias.

4. A 62-year-old female presents with sudden onset painless jaundice, dark urine, and unintended weight loss of 15 lbs over 2 months. Physical examination reveals a palpable, non-tender gallbladder. What is the most likely diagnosis?
A) Acute calculous cholecystitis
B) Pancreatic adenocarcinoma of the head of pancreas
C) Choledocholithiasis
D) Primary sclerosing cholangitis
Answer: B
Explanation: Courvoisier's law states that the presence of an enlarged, non-tender gallbladder accompanied by painless jaundice is most commonly caused by malignant obstruction of the common bile duct, typically pancreatic head adenocarcinoma.`;

/**
 * Extracts plain text from a File object (.txt, .docx, .doc, .pdf).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error('No file provided for extraction.');

  const fileName = file.name.toLowerCase();

  // 1. Plain text / Markdown
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.includes('text/plain')) {
    return await file.text();
  }

  // 2. Word (.docx) Document extraction
  if (fileName.endsWith('.docx')) {
    try {
      const buffer = await file.arrayBuffer();
      // DOCX is a zip containing word/document.xml. In browser, search for XML text tags <w:t>
      const textDecoder = new TextDecoder('utf-8');
      const rawString = textDecoder.decode(buffer);
      
      // Look for XML text patterns inside word/document.xml
      const textMatches = rawString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches && textMatches.length > 10) {
        const cleaned = textMatches
          .map(tag => tag.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
          .join(' ')
          .replace(/\s+/g, ' ');
        return cleaned;
      }
    } catch (e) {
      console.warn('[questionFileParserService] DOCX binary text extraction fallback:', e);
    }
  }

  // 3. PDF / Binary fallback: extract readable ASCII and UTF-8 string chunks
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let extracted = '';
    let currentWord = '';

    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      // Printable ASCII characters and newline
      if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
        currentWord += String.fromCharCode(b);
      } else {
        if (currentWord.length > 2) {
          extracted += currentWord + ' ';
        }
        currentWord = '';
      }
    }
    if (currentWord.length > 2) extracted += currentWord;

    // Filter PDF artifacts (streams, fonts, xref)
    const cleanedText = extracted
      .replace(/\/Type|\/Page|\/Catalog|\/Length\s+\d+|stream[\s\S]*?endstream|xref|trailer/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (cleanedText.length > 50) {
      return cleanedText;
    }
  } catch (e) {
    console.warn('[questionFileParserService] Binary parsing fallback error:', e);
  }

  // If text could not be parsed reliably from binary
  throw new Error(`Could not parse text directly from "${file.name}". You can paste the question text into the "Paste Document Text" box.`);
}

/**
 * Parses raw text into structured question candidate objects.
 * @param {string} rawText
 * @param {object} defaultMetadata
 * @returns {Array<object>}
 */
export function parseRawTextToQuestions(rawText = '', defaultMetadata = {}) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return [];
  }

  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split into question blocks:
  // Detects: "1.", "1)", "Q1:", "Question 1:", "Q.1", etc.
  const questionNumberRegex = /(?:^|\n)\s*(?:Question\s*#?\s*\d+|Q\s*#?\s*\d+|\d+[\.\)])\s*[:\-]?\s*/gi;
  const indices = [];
  let match;
  while ((match = questionNumberRegex.exec(normalized)) !== null) {
    indices.push(match.index);
  }

  const rawBlocks = [];
  if (indices.length > 0) {
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = i < indices.length - 1 ? indices[i + 1] : normalized.length;
      const block = normalized.substring(start, end).trim();
      if (block) rawBlocks.push(block);
    }
  } else {
    // Fallback: split by double newlines
    const blocks = normalized.split(/\n\s*\n+/);
    blocks.forEach(b => {
      if (b.trim().length > 30) rawBlocks.push(b.trim());
    });
  }

  const parsedQuestions = [];

  rawBlocks.forEach((block, idx) => {
    // Clean leading question number
    let cleanBlock = block.replace(/^\s*(?:Question\s*#?\s*\d+|Q\s*#?\s*\d+|\d+[\.\)])\s*[:\-]?\s*/i, '').trim();

    // 1. Extract Answer Key if present (e.g. "Answer: B", "Ans: A", "Correct Option: C")
    let answerKey = 'A';
    const ansMatch = cleanBlock.match(/(?:Answer|Ans|Correct(?:\s*Option)?|Key)\s*[:=\-]?\s*\(?([A-Ea-e])\)?/i);
    if (ansMatch) {
      answerKey = ansMatch[1].toUpperCase();
    }

    // 2. Extract Explanation if present (e.g. "Explanation: ...", "Rationale: ...")
    let explanation = '';
    const explMatch = cleanBlock.match(/(?:Explanation|Rationale|Reason|Notes?)\s*[:=\-]?\s*([\s\S]+)$/i);
    if (explMatch) {
      explanation = explMatch[1].trim();
      // Remove explanation from the block before parsing options
      cleanBlock = cleanBlock.substring(0, explMatch.index).trim();
    }

    // Remove the answer line from block before option matching
    if (ansMatch) {
      cleanBlock = cleanBlock.replace(/(?:Answer|Ans|Correct(?:\s*Option)?|Key)\s*[:=\-]?\s*\(?([A-Ea-e])\)?/i, '').trim();
    }

    // 3. Extract Options (A, B, C, D, E)
    // Matches: "A) ...", "A. ...", "(A) ...", "A - ..."
    const optionRegex = /(?:^|\n)\s*(?:\(?([A-Ea-e])[\.\)]|\b([A-Ea-e])\))\s*([^\n\r]+)/g;
    const options = [];
    let optionMatch;
    let firstOptionIndex = -1;

    while ((optionMatch = optionRegex.exec(cleanBlock)) !== null) {
      if (firstOptionIndex === -1) {
        firstOptionIndex = optionMatch.index;
      }
      const optLetter = (optionMatch[1] || optionMatch[2]).toUpperCase();
      const optText = optionMatch[3].trim();
      options.push({
        id: optLetter,
        text: optText
      });
    }

    // 4. Extract Prompt & Clinical Vignette
    let prompt = cleanBlock;
    if (firstOptionIndex > 0) {
      prompt = cleanBlock.substring(0, firstOptionIndex).trim();
    }

    // If no explicit options found, construct default options A-D if prompt is substantial
    if (options.length < 2) {
      // Check if options are inline separated by semicolons or commas
      const inlineMatches = cleanBlock.match(/\b([A-D])[\.\)]\s*([^A-D\n]+)/g);
      if (inlineMatches && inlineMatches.length >= 2) {
        inlineMatches.forEach(im => {
          const letter = im.slice(0, 1).toUpperCase();
          const txt = im.slice(2).trim();
          options.push({ id: letter, text: txt });
        });
      }
    }

    // Ensure at least 4 options if standard MCQ
    const finalOptions = options.length >= 2 ? options : [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' }
    ];

    if (!prompt) {
      prompt = `Clinical Question ${idx + 1}`;
    }

    parsedQuestions.push({
      id: `q-parsed-${Date.now()}-${idx + 1}`,
      type: 'single_choice',
      content: {
        prompt,
        vignette: ''
      },
      responseSchema: {
        options: finalOptions
      },
      answer: {
        correct: [answerKey]
      },
      scoring: {
        marks: 4,
        negativeMarks: -1
      },
      metadata: {
        subject: defaultMetadata.subject || 'Medicine',
        topic: defaultMetadata.topic || 'Clinical Practice',
        difficulty: defaultMetadata.difficulty || 'medium',
        tags: ['Document Upload', 'Phase 5 Parsed'],
        examId: defaultMetadata.examId || 'neet-pg'
      },
      explanation,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return parsedQuestions;
}
