import { StudentProgressData } from './progress';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'streak' | 'accuracy' | 'milestone' | 'mastery';

export interface VirtualBadge {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  criteriaText: string;
  criteriaTextHi: string;
  emoji: string;
  iconName: 'Flame' | 'Crown' | 'Zap' | 'Target' | 'Star' | 'BookOpen' | 'Trophy' | 'Clock' | 'Award';
  tier: BadgeTier;
  category: BadgeCategory;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  isUnlocked: boolean;
  statusText: string;
}

/**
 * Computes all virtual badges based on real activity data from StudentProgressProvider / Firestore
 */
export function evaluateStudentBadges(progress: StudentProgressData): VirtualBadge[] {
  const {
    totalQuestionsSolved = 0,
    accuracy = 0,
    testsCompleted = 0,
    studyStreakDays = 1,
    totalMinutesStudied = 0,
    subjectStats = {},
    recentHistory = [],
  } = progress;

  // Calculate subjects practiced
  const practicedSubjectsCount = Object.keys(subjectStats).filter(
    (key) => (subjectStats[key]?.attempted || 0) > 0
  ).length;

  // Check highest test score
  const highestScore = recentHistory.length > 0
    ? Math.max(...recentHistory.map((t) => t.percentage || 0))
    : 0;

  // Check fast test completion
  const hasSpeedTest = recentHistory.some(
    (t) => (t.timeSpentSeconds && t.timeSpentSeconds > 0 && t.timeSpentSeconds <= 180) ||
           t.testName.toLowerCase().includes('स्पीड') ||
           t.testName.toLowerCase().includes('speed')
  );

  const badges: VirtualBadge[] = [
    {
      id: 'consistent-learner',
      name: 'Consistent Learner',
      nameHi: 'नियमित अभ्यासी',
      description: 'Awarded for maintaining a dedicated daily study streak of 3 or more days.',
      descriptionHi: 'लगातार 3 या अधिक दिनों तक प्रतिदिन अभ्यास करने पर प्राप्त होता है।',
      criteriaText: 'Maintain a 3-day study streak',
      criteriaTextHi: '3 दिन की लगातार स्ट्रीक बनाएं',
      emoji: '🔥',
      iconName: 'Flame',
      tier: 'gold',
      category: 'streak',
      currentValue: studyStreakDays,
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((studyStreakDays / 3) * 100)),
      isUnlocked: studyStreakDays >= 3,
      statusText: studyStreakDays >= 3 ? 'पूर्ण हुआ (3+ दिन स्ट्रीक)' : `${studyStreakDays} / 3 दिन`,
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      nameHi: 'क्विज़ मास्टर',
      description: 'Awarded for completing 3+ tests with an overall accuracy of 80% or higher.',
      descriptionHi: '80% या अधिक सटीकता के साथ कम से कम 3 टेस्ट पूरे करने पर सम्मानित।',
      criteriaText: '3+ tests completed with >= 80% accuracy',
      criteriaTextHi: '3+ टेस्ट और 80%+ शुद्धता प्राप्त करें',
      emoji: '👑',
      iconName: 'Crown',
      tier: 'diamond',
      category: 'accuracy',
      currentValue: testsCompleted >= 3 ? accuracy : testsCompleted,
      targetValue: 80,
      progressPercent: testsCompleted >= 3
        ? Math.min(100, Math.round((accuracy / 80) * 100))
        : Math.min(60, Math.round((testsCompleted / 3) * 60)),
      isUnlocked: testsCompleted >= 3 && accuracy >= 80,
      statusText: testsCompleted >= 3 && accuracy >= 80
        ? `मास्टर स्तर (${accuracy}% सटीकता)`
        : testsCompleted < 3
        ? `${testsCompleted}/3 टेस्ट दिए गए`
        : `सटीकता: ${accuracy}% / 80%`,
    },
    {
      id: 'first-step',
      name: 'First Spark',
      nameHi: 'पहला कदम',
      description: 'Awarded for attempting your first mock test or solving initial questions.',
      descriptionHi: 'अपनी परीक्षा की तैयारी का पहला टेस्ट या प्रश्न हल करने पर प्राप्त।',
      criteriaText: 'Complete 1 test or solve 5 questions',
      criteriaTextHi: 'कम से कम 1 टेस्ट या 5 प्रश्न हल करें',
      emoji: '⚡',
      iconName: 'Zap',
      tier: 'bronze',
      category: 'milestone',
      currentValue: Math.max(testsCompleted, totalQuestionsSolved >= 5 ? 1 : 0),
      targetValue: 1,
      progressPercent: testsCompleted >= 1 || totalQuestionsSolved >= 5 ? 100 : Math.min(80, totalQuestionsSolved * 20),
      isUnlocked: testsCompleted >= 1 || totalQuestionsSolved >= 5,
      statusText: (testsCompleted >= 1 || totalQuestionsSolved >= 5) ? 'सफलतापूर्वक अनलॉक' : 'पहला टेस्ट शुरू करें',
    },
    {
      id: 'centurion',
      name: 'Centurion',
      nameHi: 'शतकवीर',
      description: 'Awarded for solving 100 objective questions with persistent effort.',
      descriptionHi: 'कठिन परिश्रम और अभ्यास से कुल 100 वस्तुनिष्ठ प्रश्न हल करने पर मिला बैज।',
      criteriaText: 'Solve 100 practice questions',
      criteriaTextHi: 'कुल 100 प्रश्न हल करें',
      emoji: '🎯',
      iconName: 'Target',
      tier: 'gold',
      category: 'milestone',
      currentValue: totalQuestionsSolved,
      targetValue: 100,
      progressPercent: Math.min(100, Math.round((totalQuestionsSolved / 100) * 100)),
      isUnlocked: totalQuestionsSolved >= 100,
      statusText: totalQuestionsSolved >= 100 ? `${totalQuestionsSolved} प्रश्न हल!` : `${totalQuestionsSolved} / 100 प्रश्न`,
    },
    {
      id: 'bullseye',
      name: 'Perfectionist',
      nameHi: 'शत-प्रतिशत',
      description: 'Awarded for scoring 90% or higher on any completed test or examination paper.',
      descriptionHi: 'किसी भी मॉक टेस्ट में 90% या अधिक उत्कृष्ट अंक प्राप्त करने पर अर्जित।',
      criteriaText: 'Score >= 90% in any test',
      criteriaTextHi: 'किसी भी टेस्ट में 90%+ स्कोर करें',
      emoji: '🌟',
      iconName: 'Star',
      tier: 'silver',
      category: 'accuracy',
      currentValue: highestScore,
      targetValue: 90,
      progressPercent: Math.min(100, Math.round((highestScore / 90) * 100)),
      isUnlocked: highestScore >= 90,
      statusText: highestScore >= 90 ? `शीर्ष स्कोर: ${highestScore}%` : `उच्चतम: ${highestScore}% / 90%`,
    },
    {
      id: 'subject-scholar',
      name: 'Subject Scholar',
      nameHi: 'सर्वगुण संपन्न',
      description: 'Awarded for practicing questions across 3 or more different subjects.',
      descriptionHi: 'संतुलित तैयारी के लिए कम से कम 3 अलग-अलग विषयों में प्रश्न हल करने पर।',
      criteriaText: 'Practice 3+ different subjects',
      criteriaTextHi: 'कम से कम 3 विषयों में अभ्यास करें',
      emoji: '📚',
      iconName: 'BookOpen',
      tier: 'silver',
      category: 'mastery',
      currentValue: practicedSubjectsCount,
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((practicedSubjectsCount / 3) * 100)),
      isUnlocked: practicedSubjectsCount >= 3,
      statusText: practicedSubjectsCount >= 3 ? `${practicedSubjectsCount} विषय पूरे!` : `${practicedSubjectsCount} / 3 विषय`,
    },
    {
      id: 'test-champion',
      name: 'Test Champion',
      nameHi: 'टेस्ट महारथी',
      description: 'Awarded for completing 5 full-length mock tests with complete determination.',
      descriptionHi: 'दृढ़ संकल्प के साथ 5 या अधिक पूर्ण मॉक टेस्ट सफलता से संपन्न करने पर।',
      criteriaText: 'Complete 5 full mock tests',
      criteriaTextHi: '5 पूरे मॉक टेस्ट समाप्त करें',
      emoji: '🏆',
      iconName: 'Trophy',
      tier: 'diamond',
      category: 'milestone',
      currentValue: testsCompleted,
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((testsCompleted / 5) * 100)),
      isUnlocked: testsCompleted >= 5,
      statusText: testsCompleted >= 5 ? `${testsCompleted} टेस्ट संपन्न` : `${testsCompleted} / 5 टेस्ट`,
    },
    {
      id: 'speed-demon',
      name: 'Quick Thinker',
      nameHi: 'द्रुतगामी',
      description: 'Awarded for completing a quick speed test or finishing under 3 minutes.',
      descriptionHi: 'तेज गति और सटीकता से 3 मिनट के अंदर टेस्ट या स्पीड क्विज़ समाप्त करने पर।',
      criteriaText: 'Complete test under 3 mins or speed quiz',
      criteriaTextHi: '3 मिनट के भीतर या स्पीड टेस्ट पूरा करें',
      emoji: '⏱️',
      iconName: 'Clock',
      tier: 'bronze',
      category: 'mastery',
      currentValue: hasSpeedTest ? 1 : 0,
      targetValue: 1,
      progressPercent: hasSpeedTest ? 100 : (testsCompleted > 0 ? 50 : 0),
      isUnlocked: hasSpeedTest,
      statusText: hasSpeedTest ? 'द्रुतगामी टेस्ट पूर्ण!' : 'स्पीड टेस्ट हल करें',
    },
  ];

  return badges;
}
