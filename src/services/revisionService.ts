import { questionRepository, normalizeSubject, normalizeClass } from './questionRepository';
import { notesRepository } from './notesRepository';
import { syllabusRepository } from './syllabusRepository';
import { Paper, MCQ, ShortQuestion, LongQuestion } from '../types/question';

export interface Flashcard {
  id: string;
  topic: string;
  front: string; // Question or Concept
  back: string; // Crisp Model Answer / Key Definition / Bullet Points
  type: 'definition' | 'mcq' | 'short' | 'concept';
  marks?: number;
  year?: string;
  isImportant?: boolean;
}

export interface HighYieldQuestion {
  id: string;
  question: string;
  answer: string;
  type: 'mcq' | 'short' | 'long';
  marks: number;
  years: string[];
  repeatCount: number;
  importanceRating: 'very_high' | 'high' | 'medium';
  topic: string;
  keyPoints?: string[];
}

export interface ChapterRevisionSummary {
  chapterId: string;
  chapterTitle: string;
  chapterNumber?: number;
  weightage?: string;
  keyTakeaways: string[];
  importantTerms: { term: string; explanation: string }[];
  questions: HighYieldQuestion[];
  flashcardsCount: number;
}

export interface QuickRevisionGuide {
  subject: string;
  classId: string;
  totalPapersAnalyzed: number;
  totalQuestionsAnalyzed: number;
  highYieldQuestions: HighYieldQuestion[];
  flashcards: Flashcard[];
  chapters: ChapterRevisionSummary[];
  top5MarkFormulasOrPoints: { title: string; points: string[]; sampleQuestion: string }[];
  generatedAt: string;
}

// Subject specific topic keywords for auto-clustering
const SUBJECT_TOPIC_RULES: Record<string, { topic: string; keywords: string[] }[]> = {
  'Political Science': [
    {
      topic: 'शीतयुद्ध का दौर एवं दो ध्रुवीयता का अंत',
      keywords: ['शीतयुद्ध', 'cold war', 'वारसा', 'nato', 'नाटो', 'क्यूबा', 'सोवियत संघ', 'ussr', 'बर्लिन', 'शॉक थेरेपी', 'ग्लासनोस्त', 'पेरेस्त्रोइका', 'द्विध्रुवीयता', 'गोरबाचेव'],
    },
    {
      topic: 'सत्ता के समकालीन केंद्र एवं दक्षिण एशिया',
      keywords: ['यूरोपीय संघ', 'आसियान', 'asean', 'सार्क', 'saarc', 'ब्रिक्स', 'brics', 'चीन', 'दक्षिण एशिया', 'भारत-पाक', 'नेपाल', 'श्रीलंका', 'ताशकंद', 'शिमला'],
    },
    {
      topic: 'अंतर्राष्ट्रीय संगठन एवं वैश्विक सुरक्षा',
      keywords: ['संयुक्त राष्ट्र', 'uno', 'सुरक्षा परिषद', 'veto', 'वीटो', 'विश्व बैंक', 'imf', 'परमाणु अप्रसार', 'npt', 'पर्यावरण', 'क्योटो प्रोटोकॉल', 'रियो सम्मेलन', 'सुरक्षा'],
    },
    {
      topic: 'राष्ट्र-निर्माण की चुनौतियाँ एवं नियोजित विकास',
      keywords: ['विभाजन', 'रियासत', 'पटेल', 'कश्मीर', 'हैदराबाद', 'भाषा', 'नीति आयोग', 'योजना आयोग', 'पंचवर्षीय', 'हरित क्रांति', 'मिश्रित अर्थव्यवस्था'],
    },
    {
      topic: 'भारत की विदेश नीति एवं संबंध',
      keywords: ['गुटनिरपेक्ष', 'non-aligned', 'nam', 'नेहरू', 'पंचशील', '1962', '1965', '1971', 'परमाणु नीति'],
    },
    {
      topic: 'कांग्रेस प्रणाली, आपातकाल एवं लोकतांत्रिक व्यवस्था',
      keywords: ['कांग्रेस', 'सिंडिकेट', 'आपातकाल', '1975', 'जेपी', 'जयप्रकाश', 'जनता पार्टी', 'इंदिरा गांधी', 'शाह आयोग'],
    },
    {
      topic: 'क्षेत्रीय आकांक्षाएं एवं भारतीय राजनीति के नए बदलाव',
      keywords: ['गठबंधन', 'मंडल आयोग', 'अयोध्या', 'गठबंधन सरकार', 'एनडीए', 'यूपीए', 'क्षेत्रीय दल', 'पंजाब', 'असम'],
    },
  ],
  'History': [
    {
      topic: 'ईंटें, मनके तथा अस्थियां (हड़प्पा सभ्यता)',
      keywords: ['हड़प्पा', 'सिंधु', 'मोहनजोदड़ो', 'लोथल', 'कालीबंगा', 'अन्नागार', 'स्नानागार', 'मुहर', 'सड़कें', 'जल निकास'],
    },
    {
      topic: 'राजा, किसान और नगर (आरंभिक राज्य एवं मौर्यकाल)',
      keywords: ['मौर्य', 'अशोक', 'चाणक्य', 'मेगस्थनीज', 'महाजनपद', 'मगध', 'सिक्के', 'शिलालेख', 'अभिलेख', 'गुप्त काल'],
    },
    {
      topic: 'बंधुत्व, जाति तथा वर्ग (आरंभिक समाज एवं महाभारत)',
      keywords: ['महाभारत', 'जाति', 'वर्ण', 'गोत्र', 'मनुस्मृति', 'विवाह', 'स्त्रीधन'],
    },
    {
      topic: 'विचारक, विश्वास और इमारतें (बौद्ध एवं जैन धर्म)',
      keywords: ['बुद्ध', 'महावीर', 'स्तूप', 'सांची', 'अमरावती', 'हीनयान', 'महायान', 'तीर्थंकर', 'त्रिरत्न', 'अष्टांगिक मार्ग'],
    },
    {
      topic: 'यात्रियों के नज़रिए एवं भक्ति-सूफ़ी परंपराएं',
      keywords: ['इब्न बतूता', 'अल-बिरूनी', 'बर्नियर', 'भक्ति', 'सूफ़ी', 'कबीर', 'गुरु नानक', 'मीराबाई', 'सिलसिला', 'चिश्ती', 'ख्वाजा'],
    },
    {
      topic: 'विजयनगर साम्राज्य एवं मुगल दरबार',
      keywords: ['विजयनगर', 'कृष्णदेव राय', 'हम्पी', 'मुगल', 'अकबर', 'आईन-ए-अकबरी', 'मनसबदारी', 'अबुल फजल'],
    },
    {
      topic: '1857 का विद्रोह एवं उपनिवेशवाद',
      keywords: ['1857', 'विद्रोह', 'मंगल पांडे', 'झांसी', 'बहादुर शाह', 'कारतूस', 'संथाल', 'इस्तमरारी', 'रैयतवाड़ी', 'महालवाड़ी'],
    },
    {
      topic: 'महात्मा गांधी और राष्ट्रीय आंदोलन एवं संविधान निर्माण',
      keywords: ['गांधी', 'असहयोग', 'सविनय अवज्ञा', 'दांडी', 'भारत छोड़ो', 'कैबिनेट मिशन', 'संविधान सभा', 'अंबेडकर', 'प्रारूप समिति'],
    },
  ],
  'Geography': [
    {
      topic: 'मानव भूगोल के मूल सिद्धांत एवं जनसंख्या',
      keywords: ['मानव भूगोल', 'पर्यावरणीय निश्चयवाद', 'संभववाद', 'जनसंख्या घनत्व', 'प्रवास', 'लिंगानुपात', 'मानव विकास सूचकांक', 'hdi'],
    },
    {
      topic: 'मानव व्यवसाय: प्राथमिक, द्वितीयक एवं तृतीयक क्रियाएं',
      keywords: ['कृषि', 'रोपण कृषि', 'खनन', 'उद्योग', 'विनिर्माण', 'सेवा क्षेत्र', 'परिवहन', 'संचार', 'व्यापार'],
    },
    {
      topic: 'भारत: जनसंख्या, संसाधन एवं कृषि',
      keywords: ['चावल', 'गेहूं', 'कपास', 'सिंचाई', 'जल संसाधन', 'भू-संसाधन', 'हरित क्रांति', 'फसल प्रारूप'],
    },
    {
      topic: 'खनिज, ऊर्जा संसाधन एवं उद्योग',
      keywords: ['लोहा', 'कोयला', 'पेट्रोलियम', 'बॉक्साइट', 'सौर ऊर्जा', 'सूती वस्त्र', 'लौह-इस्पात'],
    },
    {
      topic: 'परिवहन, अंतर्राष्ट्रीय व्यापार एवं पर्यावरण',
      keywords: ['रेलवे', 'सड़क मार्ग', 'पत्तनों', 'बंदरगाह', 'प्रदूषण', 'नमामि गंगे', 'अम्लीय वर्षा'],
    },
  ],
  'Physics': [
    {
      topic: 'स्थिर वैद्युतिकी एवं धारा विद्युत (Electrostatics & Current)',
      keywords: ['गाउस', 'कूलॉम', 'विद्युत क्षेत्र', 'विभव', 'संधारित्र', 'धारिता', 'ओम का नियम', 'किरचॉफ', 'व्हीटस्टोन', 'विद्युत वाहक बल'],
    },
    {
      topic: 'विद्युत धारा के चुंबकीय प्रभाव एवं चुंबकत्व',
      keywords: ['बायो-सावर्ट', 'एम्पीयर', 'लॉरेंट्ज', 'साइक्लोट्रॉन', 'गैल्वेनोमीटर', 'चुंबकीय आघूर्ण', 'नमन कोण'],
    },
    {
      topic: 'वैद्युतचुंबकीय प्रेरण एवं प्रत्यावर्ती धारा (EMI & AC)',
      keywords: ['फैराडे', 'लेंज', 'स्वप्रेरण', 'अन्योन्य प्रेरण', 'ट्रांसफॉर्मर', 'ac परिपथ', 'lcr', 'अनुनाद'],
    },
    {
      topic: 'प्रकाशिकी (Ray & Wave Optics)',
      keywords: ['अपवर्तन', 'परावर्तन', 'लेंस', 'प्रिज्म', 'व्यतिकरण', 'विवर्तन', 'ध्रुवण', 'हाइगेंस', 'सूक्ष्मदर्शी', 'दूरदर्शी'],
    },
    {
      topic: 'आधुनिक भौतिकी (Modern Physics & Semiconductor)',
      keywords: ['प्रकाश विद्युत प्रभाव', 'आइंस्टीन', 'डी-ब्रोग्ली', 'बोहर', 'नाभिक', 'रेडियोएक्टिविटी', 'डायोड', 'अर्धचालक', 'p-n संधि'],
    },
  ],
};

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function assignTopic(questionText: string, answerText: string, subject: string): string {
  const normSubject = normalizeSubject(subject);
  const rules = SUBJECT_TOPIC_RULES[normSubject];
  const combined = `${questionText} ${answerText}`.toLowerCase();

  if (rules && rules.length > 0) {
    for (const rule of rules) {
      for (const kw of rule.keywords) {
        if (combined.includes(kw.toLowerCase())) {
          return rule.topic;
        }
      }
    }
  }

  // Fallback to broad units
  return 'सामान्य एवं महत्वपूर्ण संकल्पनाएं (General Core Concepts)';
}

export async function generateQuickRevisionGuide(
  classId: string,
  subject: string
): Promise<QuickRevisionGuide> {
  const normClass = normalizeClass(classId);
  const normSubject = normalizeSubject(subject);

  // 1. Fetch all papers for this subject
  const paperSummaries = await questionRepository.getPapersList(normClass, normSubject);
  const loadedPapers: Paper[] = [];

  for (const summary of paperSummaries) {
    try {
      const full = await questionRepository.getPaperById(summary.id);
      if (full) {
        loadedPapers.push(full);
      }
    } catch (e) {
      console.warn(`Could not load paper ${summary.id} for revision`, e);
    }
  }

  const allMCQs: { q: MCQ; year: string }[] = [];
  const allShort: { q: ShortQuestion; year: string }[] = [];
  const allLong: { q: LongQuestion; year: string }[] = [];

  loadedPapers.forEach((paper) => {
    const yr = String(paper.year || '2024');
    if (Array.isArray(paper.mcqs)) {
      paper.mcqs.forEach((q) => allMCQs.push({ q, year: yr }));
    }
    if (Array.isArray(paper.shortQuestions)) {
      paper.shortQuestions.forEach((q) => allShort.push({ q, year: yr }));
    }
    if (Array.isArray(paper.longQuestions)) {
      paper.longQuestions.forEach((q) => allLong.push({ q, year: yr }));
    }
  });

  const totalQuestionsAnalyzed = allMCQs.length + allShort.length + allLong.length;

  // 2. High Yield Short & Long Questions with repetition scoring
  const questionMap = new Map<
    string,
    {
      question: string;
      answer: string;
      type: 'mcq' | 'short' | 'long';
      marks: number;
      years: Set<string>;
      topic: string;
    }
  >();

  // Helper for clustering similar questions
  const getNormalizedKey = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/gi, '')
      .slice(0, 50)
      .trim();
  };

  // Aggregate Short Questions
  allShort.forEach(({ q, year }) => {
    const qClean = cleanText(q.question);
    const ansClean = cleanText(q.answer);
    const key = getNormalizedKey(qClean);
    const topic = assignTopic(qClean, ansClean, normSubject);

    if (questionMap.has(key)) {
      const existing = questionMap.get(key)!;
      existing.years.add(year);
      if (ansClean.length > existing.answer.length) {
        existing.answer = ansClean;
      }
    } else {
      questionMap.set(key, {
        question: qClean,
        answer: ansClean,
        type: 'short',
        marks: 2,
        years: new Set([year]),
        topic,
      });
    }
  });

  // Aggregate Long Questions
  allLong.forEach(({ q, year }) => {
    const qClean = cleanText(q.question);
    const ansClean = cleanText(q.answer);
    const key = getNormalizedKey(qClean);
    const topic = assignTopic(qClean, ansClean, normSubject);

    if (questionMap.has(key)) {
      const existing = questionMap.get(key)!;
      existing.years.add(year);
      existing.type = 'long';
      existing.marks = 5;
      if (ansClean.length > existing.answer.length) {
        existing.answer = ansClean;
      }
    } else {
      questionMap.set(key, {
        question: qClean,
        answer: ansClean,
        type: 'long',
        marks: 5,
        years: new Set([year]),
        topic,
      });
    }
  });

  const highYieldQuestions: HighYieldQuestion[] = [];
  let indexCounter = 1;

  questionMap.forEach((val) => {
    const yearsArr = Array.from(val.years).sort().reverse();
    const repeatCount = yearsArr.length;
    const isVeryHigh = repeatCount >= 2 || val.marks === 5;

    // Extract key points from answer
    const rawSentences = val.answer.split(/[।.\n]/).map((s) => s.trim()).filter((s) => s.length > 10);
    const keyPoints = rawSentences.slice(0, 4);

    highYieldQuestions.push({
      id: `hyq-${indexCounter++}`,
      question: val.question,
      answer: val.answer,
      type: val.type,
      marks: val.marks,
      years: yearsArr,
      repeatCount,
      importanceRating: repeatCount >= 2 ? 'very_high' : val.marks === 5 ? 'high' : 'medium',
      topic: val.topic,
      keyPoints,
    });
  });

  // Sort high yield questions: very_high first, then long questions, then short
  highYieldQuestions.sort((a, b) => {
    if (a.repeatCount !== b.repeatCount) return b.repeatCount - a.repeatCount;
    return b.marks - a.marks;
  });

  // 3. Generate Interactive Flashcards (Front/Back)
  const flashcards: Flashcard[] = [];
  let cardCounter = 1;

  // Add from high-yield short questions (first 25 crisp cards)
  highYieldQuestions.slice(0, 30).forEach((item) => {
    let crispBack = item.answer;
    if (crispBack.length > 250) {
      // Create concise bullet summary
      const sentences = crispBack.split(/[।.\n]/).filter((s) => s.trim().length > 12);
      crispBack = sentences.slice(0, 2).join('। ') + '।';
    }

    flashcards.push({
      id: `fc-${cardCounter++}`,
      topic: item.topic,
      front: item.question,
      back: crispBack,
      type: item.type === 'long' ? 'concept' : 'short',
      marks: item.marks,
      year: item.years[0] || '2024',
      isImportant: item.importanceRating === 'very_high',
    });
  });

  // Also add key MCQs as quick flashcards
  allMCQs.slice(0, 20).forEach(({ q, year }) => {
    const qClean = cleanText(q.question);
    const answerText = typeof q.answer === 'string' ? q.answer : '';
    if (answerText || (Array.isArray(q.options) && q.options.length > 0)) {
      flashcards.push({
        id: `fc-mcq-${cardCounter++}`,
        topic: assignTopic(qClean, answerText, normSubject),
        front: `${qClean}`,
        back: `✅ सही उत्तर: ${answerText || 'विकल्प देखें'}${q.explanation ? `\n\n💡 व्याख्या: ${q.explanation}` : ''}`,
        type: 'mcq',
        marks: 1,
        year,
        isImportant: true,
      });
    }
  });

  // 4. Chapter Grouping
  const chapterGroups = new Map<string, HighYieldQuestion[]>();
  highYieldQuestions.forEach((q) => {
    const t = q.topic;
    if (!chapterGroups.has(t)) {
      chapterGroups.set(t, []);
    }
    chapterGroups.get(t)!.push(q);
  });

  const chapters: ChapterRevisionSummary[] = [];
  let chNum = 1;
  chapterGroups.forEach((questions, topicTitle) => {
    // Extract key takeaways from answers
    const keyTakeaways: string[] = [];
    questions.slice(0, 4).forEach((q) => {
      if (q.keyPoints && q.keyPoints.length > 0) {
        keyTakeaways.push(q.keyPoints[0]);
      }
    });

    chapters.push({
      chapterId: `ch-${chNum}`,
      chapterTitle: topicTitle,
      chapterNumber: chNum++,
      weightage: questions.some((q) => q.marks === 5) ? '6-10 अंक' : '4-6 अंक',
      keyTakeaways: keyTakeaways.slice(0, 3),
      importantTerms: [],
      questions,
      flashcardsCount: questions.length,
    });
  });

  // 5. 5-Mark Long Answer Outlines (Must-do questions with structured points)
  const top5MarkFormulasOrPoints: { title: string; points: string[]; sampleQuestion: string }[] = [];
  const longQs = highYieldQuestions.filter((q) => q.marks === 5).slice(0, 8);

  longQs.forEach((lq) => {
    const sentences = lq.answer
      .split(/[।.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    top5MarkFormulasOrPoints.push({
      title: lq.question.slice(0, 60) + (lq.question.length > 60 ? '...' : ''),
      sampleQuestion: lq.question,
      points: sentences.slice(0, 5),
    });
  });

  return {
    subject: normSubject,
    classId: normClass,
    totalPapersAnalyzed: loadedPapers.length,
    totalQuestionsAnalyzed,
    highYieldQuestions,
    flashcards,
    chapters,
    top5MarkFormulasOrPoints,
    generatedAt: new Date().toISOString(),
  };
}
