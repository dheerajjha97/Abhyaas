import { NoteData, NoteSection } from '../types/notes';

export interface VisualEnrichment {
  headerIllustration: string;
  headerIllustrationAlt: string;
  overviewSummary: string;
  examImportantPoints: string[];
  rememberPoints: string[];
  keyTerms: string[];
  sectionImages: Record<string, { url: string; caption?: string; alt?: string }>;
  quickRevisionStrip: Array<{ id: string; label: string; value: string }>;
}

// Curated high quality illustrations and diagrams for NCERT / State Board topics
// SVG & Webp curated educational visuals that load instantly with ZERO latency & ZERO AI token cost
const TOPIC_VISUAL_MAP: Record<string, {
  headerIllustration: string;
  headerAlt: string;
  sectionImages?: Record<string, { url: string; caption?: string; alt?: string }>;
}> = {
  // History / Prehistory
  'prehistoric': {
    headerIllustration: 'https://images.unsplash.com/photo-1544985361-b421c6eb3b47?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'प्रागैतिहासिक शैलचित्र एवं पाषाण कालीन संस्कृति',
    sectionImages: {
      'bhimbetka': {
        url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=500&auto=format&fit=crop&q=80',
        caption: 'भीमबेटका (मध्य प्रदेश) - यूनेस्को विश्व धरोहर शैलचित्र',
        alt: 'Bhimbetka Cave Painting'
      }
    }
  },
  // Political Science: Constitution
  'constitution': {
    headerIllustration: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'भारतीय संविधान सभा एवं विधि का शासन',
    sectionImages: {
      'assembly': {
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=500&auto=format&fit=crop&q=80',
        caption: 'संसद भवन व संविधान सभा के ऐतिहासिक सत्र',
        alt: 'Indian Parliament & Constitution'
      },
      'preamble': {
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
        caption: 'भारतीय संविधान की उद्देशिका (प्रस्तावना)',
        alt: 'Preamble of Indian Constitution'
      }
    }
  },
  // Cold War Era / International Politics
  'cold war': {
    headerIllustration: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'शीत युद्ध का दौर - द्विध्रुवीय विश्व',
    sectionImages: {
      'non-aligned': {
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
        caption: 'गुटनिरपेक्ष आंदोलन (NAM) एवं वैश्विक कूटनीति',
        alt: 'Global Diplomacy and NAM'
      }
    }
  },
  // Harappan Civilization
  'harappa': {
    headerIllustration: 'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'हड़प्पा सभ्यता - नगर नियोजन एवं कांस्य युगीन संस्कृति',
    sectionImages: {
      'mohenjodaro': {
        url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&auto=format&fit=crop&q=80',
        caption: 'सिंधु घाटी सभ्यता की मुहरें व स्नानागार',
        alt: 'Indus Valley civilization seals and baths'
      }
    }
  },
  // Geography / Resources / Environment
  'geography': {
    headerIllustration: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'भूगोल: संसाधन, जलवायु एवं मानव विकास',
    sectionImages: {
      'resources': {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=80',
        caption: 'प्राकृतिक संसाधन एवं पर्यावरण संतुलन',
        alt: 'Natural Resources and Climate'
      }
    }
  },
  // Generic Indian History / Culture
  'history': {
    headerIllustration: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80',
    headerAlt: 'भारतीय इतिहास एवं पुरातात्विक धरोहर',
    sectionImages: {
      'monument': {
        url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=500&auto=format&fit=crop&q=80',
        caption: 'प्राचीन भारतीय स्थापत्य कला एवं अभिलेख',
        alt: 'Historical monuments and inscriptions'
      }
    }
  }
};

/**
 * Generates an SVG Illustration Data URI for instant zero-load rendering
 */
export function generateEducationalSvgArt(subject: string, chapterTitle: string): string {
  const isPolScience = /pol|संविधान|राजनीति|शासन/i.test(subject + ' ' + chapterTitle);
  const isHistory = /hist|इतिहास|हड़प्पा|प्रागैतिहासिक|काल|सभ्यता/i.test(subject + ' ' + chapterTitle);
  const isGeo = /geo|भूगोल|संसाधन|जलवायु|नदी|भूमि/i.test(subject + ' ' + chapterTitle);

  let bgGradient = '<stop offset="0%" stop-color="#EFF6FF"/><stop offset="100%" stop-color="#DBEAFE"/>';
  let accentColor = '#2563EB';
  let secondaryColor = '#F59E0B';
  let badgeText = 'अध्ययन चित्र';

  if (isPolScience) {
    bgGradient = '<stop offset="0%" stop-color="#FEF3C7"/><stop offset="100%" stop-color="#FDE68A"/>';
    accentColor = '#B45309';
    secondaryColor = '#1D4ED8';
    badgeText = 'भारतीय संविधान';
  } else if (isHistory) {
    bgGradient = '<stop offset="0%" stop-color="#FFFBEB"/><stop offset="100%" stop-color="#FCD34D"/>';
    accentColor = '#92400E';
    secondaryColor = '#047857';
    badgeText = 'ऐतिहासिक साक्ष्य';
  } else if (isGeo) {
    bgGradient = '<stop offset="0%" stop-color="#ECFDF5"/><stop offset="100%" stop-color="#A7F3D0"/>';
    accentColor = '#047857';
    secondaryColor = '#3B82F6';
    badgeText = 'भौगोलिक परिदृश्य';
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <!-- Background Organic Shape -->
    <path d="M 40,20 C 150,-10 320,10 360,50 C 400,100 390,200 350,240 C 300,280 100,270 50,230 C -10,180 0,50 40,20 Z" fill="url(#bg)" opacity="0.9"/>
    
    <!-- Central Rock / Book / Emblem Art -->
    <g transform="translate(110, 45)" filter="url(#shadow)">
      <!-- Main Artifact Frame -->
      <path d="M 30,10 C 80,-5 140,5 160,35 C 180,70 170,140 145,170 C 120,195 40,190 20,160 C -5,125 5,40 30,10 Z" fill="#F8FAFC" stroke="${accentColor}" stroke-width="3"/>
      
      <!-- Internal Cave / Art Engravings -->
      <path d="M 45,55 C 55,45 75,45 85,55" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="65" cy="70" r="10" fill="${secondaryColor}"/>
      <line x1="65" y1="80" x2="65" y2="120" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
      <line x1="65" y1="95" x2="45" y2="80" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="65" y1="95" x2="85" y2="80" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="65" y1="120" x2="48" y2="145" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="65" y1="120" x2="82" y2="145" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Animal / Motif engraving on right -->
      <path d="M 105,75 Q 120,65 135,75 T 145,95" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="140" cy="72" r="4" fill="${accentColor}"/>
      <line x1="115" y1="90" x2="110" y2="115" stroke="${accentColor}" stroke-width="2"/>
      <line x1="135" y1="95" x2="140" y2="115" stroke="${accentColor}" stroke-width="2"/>
      
      <!-- Stone Tool / Book on the side -->
      <polygon points="150,110 180,95 175,150 145,160" fill="#CBD5E1" stroke="${accentColor}" stroke-width="2"/>
    </g>

    <!-- Ground Grass / Foundation -->
    <path d="M 60,240 Q 200,225 340,240" stroke="${secondaryColor}" stroke-width="4" stroke-linecap="round" fill="none"/>
    
    <!-- Topic Mini Tag -->
    <rect x="130" y="225" width="140" height="26" rx="13" fill="${accentColor}"/>
    <text x="200" y="242" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${badgeText}</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Extracts or generates structured visual assets and 3-grid summary for any note
 * with 100% caching in localStorage (Zero API load on repeat views)
 */
export function getVisualEnrichmentForNote(note: NoteData, subject: string): VisualEnrichment {
  const cacheKey = `abhyaas_note_visual_v1_${note.noteId || note.chapterNumber || 'default'}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // 1. Determine Topic Category
  const fullSearchText = `${subject} ${note.title || ''} ${note.chapterTitle || ''} ${note.chapterTitleHindi || ''} ${note.tags?.join(' ') || ''}`.toLowerCase();

  let matchedVisual = TOPIC_VISUAL_MAP['history'];
  if (/prehistoric|प्रागैतिहासिक|पाषाण|पुरापाषाण|गुफा|भीमबेटका/i.test(fullSearchText)) {
    matchedVisual = TOPIC_VISUAL_MAP['prehistoric'];
  } else if (/संविधान|constitution|सभा|अधिकार|विधि|लोकतंत्र|राजनीति|संसद/i.test(fullSearchText)) {
    matchedVisual = TOPIC_VISUAL_MAP['constitution'];
  } else if (/cold war|शीत युद्ध|गुटनिरपेक्ष|द्विध्रुवीय|सोवियत|अमेरिका/i.test(fullSearchText)) {
    matchedVisual = TOPIC_VISUAL_MAP['cold war'];
  } else if (/हड़प्पा|सिंधु|harappa|mohenjo|सभ्यता/i.test(fullSearchText)) {
    matchedVisual = TOPIC_VISUAL_MAP['harappa'];
  } else if (/भूगोल|geography|संसाधन|जलवायु|मिट्टी|कृषि|पर्यावरण/i.test(fullSearchText)) {
    matchedVisual = TOPIC_VISUAL_MAP['geography'];
  }

  // Generate artistic SVG or use curated Unsplash educational photo
  const headerIllustration = matchedVisual.headerIllustration || generateEducationalSvgArt(subject, note.chapterTitleHindi || note.title);
  const headerIllustrationAlt = matchedVisual.headerAlt || `${note.chapterTitleHindi || note.title} शैक्षणिक चित्र`;

  // 2. Extract 1-Line Overview Summary
  let overviewSummary = note.overviewSummary || '';
  if (!overviewSummary) {
    if (note.sections && note.sections.length > 0) {
      const firstSectionContent = note.sections[0].content || '';
      const cleanLines = firstSectionContent.split('\n').map(l => l.trim()).filter(l => l.length > 20 && !l.startsWith('#'));
      if (cleanLines.length > 0) {
        overviewSummary = cleanLines[0].replace(/^[0-9.\-*–\s]+/, '').slice(0, 180);
        if (!overviewSummary.endsWith('।') && !overviewSummary.endsWith('.')) {
          overviewSummary += '।';
        }
      }
    }
    if (!overviewSummary) {
      overviewSummary = `${note.chapterTitleHindi || note.title} का विस्तृत और सरल अध्ययन, मुख्य ऐतिहासिक एवं सैद्धांतिक तथ्यों सहित।`;
    }
  }

  // 3. Extract Exam Important Points (🎯 परीक्षा में महत्वपूर्ण)
  let examImportantPoints = note.examImportantPoints || [];
  if (examImportantPoints.length === 0 && note.keyTakeaways && note.keyTakeaways.length > 0) {
    examImportantPoints = note.keyTakeaways.slice(0, 4);
  }
  if (examImportantPoints.length === 0 && note.sections) {
    const extracted: string[] = [];
    for (const sec of note.sections) {
      if (sec.heading && !sec.heading.toLowerCase().includes('overview')) {
        extracted.push(sec.headingHindi || sec.heading);
      }
      if (sec.keyPoints) {
        for (const kp of sec.keyPoints) {
          if (extracted.length < 4) extracted.push(kp);
        }
      }
      if (extracted.length >= 4) break;
    }
    examImportantPoints = extracted.length > 0 ? extracted : [
      'अध्याय के प्रमुख सैद्धांतिक परिप्रेक्ष्य',
      'महत्वपूर्ण ऐतिहासिक कालक्रम एवं स्रोत',
      'परीक्षा में बार-बार पूछे जाने वाले प्रश्न',
      'संबंधित प्रमुख धाराएं एवं वैज्ञानिक तथ्य'
    ];
  }

  // 4. Extract Remember Points (⭐ याद रखें)
  let rememberPoints = note.rememberPoints || [];
  if (rememberPoints.length === 0) {
    const points: string[] = [];
    // Extract dates, locations, or key figures from content
    const allContent = note.sections?.map(s => s.content).join(' ') || '';
    
    if (/भीमबेटका/i.test(allContent)) points.push('भीमबेटका – मध्य प्रदेश (रायसेन जिला)');
    if (/सोहन नदी/i.test(allContent)) points.push('सोहन नदी घाटी – पुरापाषाण स्थल');
    if (/पाषाण युग/i.test(allContent)) points.push('पाषाण युग – तीन प्रमुख भागों में विभाजित');
    if (/1946|9 दिसंबर/i.test(allContent)) points.push('9 दिसंबर 1946 – संविधान सभा की प्रथम बैठक');
    if (/26 नवंबर 1949/i.test(allContent)) points.push('26 नवंबर 1949 – संविधान अंगीकृत व पारित');
    if (/26 जनवरी 1950/i.test(allContent)) points.push('26 जनवरी 1950 – भारतीय संविधान पूर्णतः लागू');
    if (/प्रारूप समिति|अम्बेडकर/i.test(allContent)) points.push('डॉ. बी. आर. अम्बेडकर – प्रारूप समिति के अध्यक्ष');

    if (points.length < 3) {
      if (note.sections?.[0]?.keyPoints) {
        points.push(...note.sections[0].keyPoints.slice(0, 3));
      }
    }
    rememberPoints = points.length >= 2 ? points.slice(0, 4) : [
      'अध्याय से जुड़े मुख्य वर्ष एवं तिथियां',
      'प्रमुख विद्वान, विचारक एवं उनके योगदान',
      'अवधारणाओं का कालक्रमानुसार वर्गीकरण'
    ];
  }

  // 5. Extract Key Terms / Chips (💡 मुख्य शब्द)
  let keyTerms = note.keyTerms || [];
  if (keyTerms.length === 0 && note.tags && note.tags.length > 0) {
    keyTerms = note.tags.slice(0, 6);
  }
  if (keyTerms.length === 0) {
    const defaultTermsBySubject = /संविधान|pol/i.test(fullSearchText)
      ? ['संविधान', 'प्रस्तावना', 'मौलिक अधिकार', 'धर्मनिरपेक्ष', 'संघवाद', 'प्रभुसत्ता']
      : /hist|इतिहास|पाषाण/i.test(fullSearchText)
      ? ['प्रागैतिहास', 'पुरापाषाण', 'मध्यपाषाण', 'नवपाषाण', 'आदि मानव', 'गुफा चित्र']
      : ['अवधारणा', 'महत्वपूर्ण तथ्य', 'विश्लेषण', 'सिद्धांत', 'वर्गीकरण', 'केस स्टडी'];
    keyTerms = defaultTermsBySubject;
  }

  // 6. Section Images Map
  const sectionImages: Record<string, { url: string; caption?: string; alt?: string }> = {};
  if (matchedVisual.sectionImages) {
    Object.assign(sectionImages, matchedVisual.sectionImages);
  }

  // 7. Quick 2-Minute Revision Strip
  const quickRevisionStrip: Array<{ id: string; label: string; value: string }> = [
    { id: '1', label: '01', value: `${keyTerms[0] || 'महत्व'} = मुख्य अवधारणा` },
    { id: '2', label: '02', value: `${keyTerms[1] || 'वर्गीकरण'} = मुख्य प्रकार` },
    { id: '3', label: '03', value: `${rememberPoints[0]?.split('–')[0]?.trim() || 'प्रमुख स्थल'} = महत्वपूर्ण तथ्य` },
    { id: '4', label: '04', value: `${keyTerms[2] || 'निष्कर्ष'} = परीक्षा बिंदु` },
  ];

  // If specific topic matches, give pinpoint accurate 2-min revision
  if (/prehistoric|प्रागैतिहासिक|पाषाण/i.test(fullSearchText)) {
    quickRevisionStrip[0] = { id: '1', label: '01', value: 'प्रागैतिहास = लेखन से पूर्व का काल' };
    quickRevisionStrip[1] = { id: '2', label: '02', value: 'पुरापाषाण = पुराने पाषाण उपकरण' };
    quickRevisionStrip[2] = { id: '3', label: '03', value: 'भीमबेटका = मध्य प्रदेश (शैलचित्र)' };
    quickRevisionStrip[3] = { id: '4', label: '04', value: 'प्रमुख प्रमाण = उपकरण + गुफा चित्र' };
  } else if (/संविधान|constitution/i.test(fullSearchText)) {
    quickRevisionStrip[0] = { id: '1', label: '01', value: 'कैबिनेट मिशन = 1946 (सभा गठन)' };
    quickRevisionStrip[1] = { id: '2', label: '02', value: 'संविधान निर्माण = 2 वर्ष 11 माह 18 दिन' };
    quickRevisionStrip[2] = { id: '3', label: '03', value: 'प्रारूप समिति = डॉ. अम्बेडकर' };
    quickRevisionStrip[3] = { id: '4', label: '04', value: '26 जन 1950 = संविधान लागू (गणतंत्र)' };
  }

  const result: VisualEnrichment = {
    headerIllustration,
    headerIllustrationAlt,
    overviewSummary,
    examImportantPoints,
    rememberPoints,
    keyTerms,
    sectionImages,
    quickRevisionStrip
  };

  // Cache permanently
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {}

  return result;
}
