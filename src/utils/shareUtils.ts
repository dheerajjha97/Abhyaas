/**
 * Share Utilities for Abhyaas (अभ्यास) App
 * Ensures proper canonical link sharing across WhatsApp, Telegram, Facebook, Clipboard, etc.
 * Fixes the issue where mobile browsers drop the `url` parameter in navigator.share.
 */

export const OFFICIAL_APP_DOMAIN = 'https://abhyaaspyq.in';

/**
 * Returns the public canonical base URL of the app.
 * In development / preview (localhost, *.run.app), defaults to https://abhyaaspyq.in
 * so that shared messages contain working links that friends and students can open.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If the user has bound their custom domain or is running on abhyaaspyq.in
    if (host.includes('abhyaaspyq.in')) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // In dev / preview / cloud run containers, use canonical public URL
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('run.app')) {
      return OFFICIAL_APP_DOMAIN;
    }
    return window.location.origin;
  }
  return OFFICIAL_APP_DOMAIN;
}

/**
 * Builds a deep link for a specific route path
 */
export function getAppShareLink(path = ''): string {
  const base = getAppBaseUrl().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'failed';
  message: string;
}

/**
 * Universal content share helper.
 * Crucial Fix: Embeds the URL directly inside `text` so WhatsApp on Android does NOT drop the link!
 */
export async function shareToSocial(options: {
  title: string;
  text: string;
  path?: string;
  customUrl?: string;
}): Promise<ShareResult> {
  const shareUrl = options.customUrl || getAppShareLink(options.path || '');

  // Formatted message with app branding and direct clickable link
  const formattedText = `${options.text.trim()}\n\n📲 *अभ्यास ऐप पर पूरा देखें व हल करें:*\n👉 ${shareUrl}\n\n🇮🇳 *बिहार बोर्ड 10वीं व 12वीं परीक्षा तैयारी*\n🌐 ${OFFICIAL_APP_DOMAIN}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: formattedText,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'native',
        message: 'सफलतापूर्वक शेयर किया गया!',
      };
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (isAbort) {
        return {
          success: false,
          method: 'failed',
          message: 'शेयर रद्द किया गया',
        };
      }
      // If native share fails, fallback to clipboard
    }
  }

  // Fallback to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(formattedText);
      return {
        success: true,
        method: 'clipboard',
        message: 'प्रश्न, उत्तर व ऐप लिंक कॉपी हो गया! अब कहीं भी पेस्ट करें।',
      };
    }
  } catch {
    // Clipboard failed
  }

  return {
    success: false,
    method: 'failed',
    message: 'शेयर करने में असमर्थ। कृपया लिंक मैन्युअल कॉपी करें।',
  };
}

/**
 * Specific helper for sharing Short Questions (लघु उत्तरीय प्रश्न)
 */
export async function shareShortQuestion(params: {
  subject: string;
  classId: string;
  questionNumber: number;
  question: string;
  answer: string;
  paperId?: string;
}): Promise<ShareResult> {
  const shareTitle = `${params.subject} - लघु उत्तरीय प्रश्न (${params.questionNumber}) | अभ्यास`;
  const sharePath = params.paperId ? `/paper/${params.paperId}/short` : '/papers';

  const bodyText = `📚 *Abhyaas App | ${params.subject} (${params.classId})*\n\n❓ *लघु उत्तरीय प्रश्न (${params.questionNumber}):*\n${params.question}\n\n📖 *आदर्श उत्तर:*\n${params.answer}`;

  return shareToSocial({
    title: shareTitle,
    text: bodyText,
    path: sharePath,
  });
}

/**
 * Specific helper for sharing Long Questions (दीर्घ उत्तरीय प्रश्न)
 */
export async function shareLongQuestion(params: {
  subject: string;
  classId: string;
  questionNumber: number;
  question: string;
  answer: string;
  marks?: number;
  paperId?: string;
}): Promise<ShareResult> {
  const marksStr = params.marks ? ` [${params.marks} अंक]` : ' [5 अंक]';
  const shareTitle = `${params.subject} - दीर्घ उत्तरीय प्रश्न (${params.questionNumber})${marksStr} | अभ्यास`;
  const sharePath = params.paperId ? `/paper/${params.paperId}/long` : '/papers';

  const bodyText = `📚 *Abhyaas App | ${params.subject} (${params.classId})*\n\n❓ *दीर्घ उत्तरीय प्रश्न (${params.questionNumber})${marksStr}:*\n${params.question}\n\n📖 *विस्तृत आदर्श उत्तर:*\n${params.answer}`;

  return shareToSocial({
    title: shareTitle,
    text: bodyText,
    path: sharePath,
  });
}

/**
 * Specific helper for sharing Notes / Chapters (रिवीजन नोट्स)
 */
export async function shareChapterNote(params: {
  subject: string;
  classId: string;
  chapterNumber: number | string;
  chapterTitle: string;
  summaryText?: string;
  subjectId?: string;
}): Promise<ShareResult> {
  const shareTitle = `${params.subject} - अध्याय ${params.chapterNumber}: ${params.chapterTitle} | अभ्यास नोट्स`;
  const sharePath = params.subjectId ? `/notes/${params.subjectId}` : '/notes';

  let bodyText = `📖 *अभ्यास डिजिटल नोट्स | ${params.subject} (Class ${params.classId})*\n\n🔖 *अध्याय ${params.chapterNumber}: ${params.chapterTitle}*\n\n`;
  if (params.summaryText) {
    const cleanSnippet = params.summaryText.replace(/[#*`_]/g, '').trim().slice(0, 240);
    bodyText += `⚡ *मुख्य परीक्षा सारांश:*\n${cleanSnippet}...\n\n`;
  }
  bodyText += `💡 पूरे अध्याय के बिंदुवार हस्तलिखित नोट्स और महत्वपूर्ण प्रश्न पढ़ें।`;

  return shareToSocial({
    title: shareTitle,
    text: bodyText,
    path: sharePath,
  });
}

/**
 * Specific helper for sharing Quick Revision High-Yield Questions
 */
export async function shareQuickRevisionQuestion(params: {
  subject: string;
  classId: string;
  question: string;
  answer: string;
  marks?: number;
  subjectId?: string;
}): Promise<ShareResult> {
  const marksStr = params.marks ? ` [${params.marks} अंक]` : '';
  const shareTitle = `${params.subject} - त्वरित रिवीजन प्रश्न${marksStr} | अभ्यास`;
  const sharePath = params.subjectId ? `/quick-revision/${params.subjectId}` : '/quick-revision';

  const bodyText = `📚 *Abhyaas App | त्वरित रिवीज़न*\n\n🔥 *${params.subject} (Class ${params.classId}) - महत्वपूर्ण प्रश्न${marksStr}:*\n${params.question}\n\n📖 *आदर्श उत्तर:*\n${params.answer}`;

  return shareToSocial({
    title: shareTitle,
    text: bodyText,
    path: sharePath,
  });
}

/**
 * Specific helper for sharing Quiz / Mock Test score
 */
export async function shareQuizResult(params: {
  subject: string;
  classId: string;
  year?: string;
  score: number;
  total: number;
  percentage: number;
  gradeText: string;
}): Promise<ShareResult> {
  const shareTitle = `${params.subject} मॉक टेस्ट परिणाम: ${params.percentage}% | अभ्यास`;
  const sharePath = '/mock-test';

  const bodyText = `🏆 *मेरा अभ्यास मॉक टेस्ट स्कोर*\n\n📖 *विषय:* ${params.subject} (Class ${params.classId})\n🎯 *अंक:* ${params.score}/${params.total} (${params.percentage}%)\n🎖️ *ग्रेड:* ${params.gradeText}\n\nक्या आप इस स्कोर को बीट कर सकते हैं? अभ्यास ऐप पर फ्री OMR मॉक टेस्ट दें!`;

  return shareToSocial({
    title: shareTitle,
    text: bodyText,
    path: sharePath,
  });
}
