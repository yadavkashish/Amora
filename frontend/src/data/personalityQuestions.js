// ============================================================================
// 🎯 OPTIMIZED QUESTIONNAIRE - 26 QUESTIONS (REORGANIZED)
// Text Questions → Bubble Questions → Dealbreaker Questions
// Enhanced for relationship compatibility & personality profiling
// ============================================================================

export const QUESTION_TYPES = {
  TEXT: 'text',
  BUBBLE: 'bubble',
  QUICK_POLL: 'quick_poll',
  EMOJI_SCALE: 'emoji_scale',
  DEALBREAKER_TOGGLE: 'dealbreaker_toggle'
};

export const bubbleOptions = [
  'Strongly Agree',
  'Agree',
  'Neutral',
  'Disagree',
  'Strongly Disagree'
];

export const emojiScaleOptions = [
  { value: 1, emoji: '😶', label: 'Not at all' },
  { value: 2, emoji: '🤔', label: 'Somewhat' },
  { value: 3, emoji: '🎯', label: 'Definitely' },
  { value: 4, emoji: '💫', label: 'Very much' }
];

// ============================================================================
// REORGANIZED 26-QUESTION ARRAY - TEXT FIRST, THEN BUBBLE, THEN DEALBREAKER
// ============================================================================

export const personalityQuestions = [
  // ==================== PHASE 1: TEXT QUESTIONS (13 Total) ====================
  // SECTION 1: Welcome & Ready? (1 Text)
  {
    id: 1,
    section: 1,
    sectionTitle: 'Welcome & Ready?',
    sectionEmoji: '⚡',
    type: QUESTION_TYPES.TEXT,
    question: "What's your current relationship status?",
    options: [
      'Single and actively looking',
      'Single but open to meeting someone',
      'Casually dating',
      'Exploring what\'s out there'
    ],
    required: true,
    phase: 'text'
  },

  // SECTION 2: Love & Relationships (5 Text)
  {
    id: 3,
    section: 2,
    sectionTitle: 'Love & Relationships',
    sectionEmoji: '💕',
    type: QUESTION_TYPES.TEXT,
    question: 'How do you prefer to express love in a relationship?',
    options: [
      'Through words and compliments',
      'Through actions and thoughtful gestures',
      'By spending quality time together',
      'Through physical affection or closeness'
    ],
    compatibilityWeight: 'high',
    required: true,
    phase: 'text'
  },
  {
    id: 4,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: 'How do you handle conflicts in a relationship?',
    options: [
      'Calmly talk things out immediately',
      'Take time to cool down first, then discuss',
      'Avoid arguments until it settles naturally',
      'Get emotional but resolve it quickly'
    ],
    compatibilityWeight: 'critical',
    required: true,
    phase: 'text'
  },
  {
    id: 5,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: "What's your love language?",
    options: [
      'Words of affirmation',
      'Acts of service',
      'Receiving gifts',
      'Quality time',
      'Physical touch'
    ],
    compatibilityWeight: 'critical',
    required: true,
    phase: 'text'
  },
  {
    id: 8,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: 'When your partner is upset, how do you usually respond?',
    options: [
      'Listen and comfort them immediately',
      'Give them space and talk later',
      'Try to cheer them up or distract them',
      'Feel unsure how to help'
    ],
    attachmentIndicator: true,
    compatibilityWeight: 'high',
    required: true,
    phase: 'text'
  },
  {
    id: 9,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: 'How comfortable are you with emotional vulnerability?',
    options: [
      'Very comfortable - I share openly',
      'Comfortable with the right person',
      'It takes time to open up',
      'I keep some walls up'
    ],
    attachmentIndicator: true,
    compatibilityWeight: 'critical',
    required: true,
    phase: 'text'
  },

  // SECTION 4: Values & Lifestyle (3 Text)
  {
    id: 17,
    section: 4,
    sectionTitle: 'Values & Lifestyle',
    sectionEmoji: '🌟',
    type: QUESTION_TYPES.TEXT,
    question: 'How important is financial stability in a relationship?',
    options: [
      "Very important - it's a foundation for security",
      'Important, but I value experiences over money',
      "I'm flexible - we'll figure it out together",
      'Not very important - love matters more'
    ],
    compatibilityWeight: 'high',
    required: true,
    phase: 'text'
  },
  {
    id: 18,
    section: 4,
    type: QUESTION_TYPES.TEXT,
    question: 'How would you prefer to spend a free weekend with your partner?',
    options: [
      'Adventure activities or exploring new places',
      'Quiet time at home, relaxing together',
      'Social gatherings with friends and family',
      'Mix of activities - keep it spontaneous'
    ],
    compatibilityWeight: 'medium',
    required: true,
    phase: 'text'
  },
  {
    id: 24,
    section: 5,
    sectionTitle: 'Connection & Communication',
    sectionEmoji: '🔗',
    type: QUESTION_TYPES.TEXT,
    question: 'How do you prefer to handle shared expenses with a partner?',
    options: [
      'Split everything 50/50',
      'Split based on income proportion',
      'One person handles finances primarily',
      'Flexible - depends on the situation'
    ],
    compatibilityWeight: 'medium',
    required: true,
    phase: 'text'
  },

  // ==================== PHASE 2: EMOJI SCALE (1 Total) ====================
  {
    id: 2,
    section: 1,
    type: QUESTION_TYPES.EMOJI_SCALE,
    question: 'How ready do you feel for a committed relationship right now?',
    options: emojiScaleOptions,
    required: true,
    phase: 'bubble'
  },

  // ==================== PHASE 3: BUBBLE QUESTIONS (12 Total) ====================
  // SECTION 2: Love & Relationships (2 Bubble)
  {
    id: 6,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I need reassurance from my partner regularly.',
    options: bubbleOptions,
    attachmentIndicator: true,
    personalityDimension: 'Neuroticism',
    required: true,
    phase: 'bubble'
  },
  {
    id: 7,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'Personal space in a relationship is essential for me.',
    options: bubbleOptions,
    attachmentIndicator: true,
    required: true,
    phase: 'bubble'
  },

  // SECTION 3: Your Personality (7 Bubble)
  {
    id: 10,
    section: 3,
    sectionTitle: 'Your Personality',
    sectionEmoji: '🎭',
    type: QUESTION_TYPES.BUBBLE,
    question: 'I enjoy being the center of attention.',
    options: bubbleOptions,
    personalityDimension: 'Extraversion',
    required: true,
    phase: 'bubble'
  },
  {
    id: 12,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: "I like trying new things, even if they're risky.",
    options: bubbleOptions,
    personalityDimension: 'Openness',
    required: true,
    phase: 'bubble'
  },
  {
    id: 13,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: "I find it easy to empathize with others' feelings.",
    options: bubbleOptions,
    personalityDimension: 'Agreeableness',
    compatibilityWeight: 'critical',
    required: true,
    phase: 'bubble'
  },
  {
    id: 14,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I make decisions based on logic rather than emotions.',
    options: bubbleOptions,
    personalityDimension: 'Conscientiousness',
    required: true,
    phase: 'bubble'
  },
  {
    id: 16,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I tend to plan my life in detail.',
    options: bubbleOptions,
    personalityDimension: 'Conscientiousness',
    required: true,
    phase: 'bubble'
  },

  // SECTION 4: Values & Lifestyle (2 Bubble)
  {
    id: 19,
    section: 4,
    type: QUESTION_TYPES.BUBBLE,
    question: "I feel anxious when I haven't heard from my partner for a while.",
    options: bubbleOptions,
    attachmentIndicator: true,
    personalityDimension: 'Neuroticism',
    required: true,
    phase: 'bubble'
  },
  {
    id: 20,
    section: 4,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I believe compromising in a relationship means losing part of yourself.',
    options: bubbleOptions,
    personalityDimension: 'Agreeableness',
    compatibilityWeight: 'high',
    required: true,
    phase: 'bubble'
  },

  // SECTION 5: Connection & Communication (3 Bubble)
  {
    id: 21,
    section: 5,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I need frequent communication throughout the day.',
    options: bubbleOptions,
    attachmentIndicator: true,
    compatibilityWeight: 'medium',
    required: true,
    phase: 'bubble'
  },
  {
    id: 22,
    section: 5,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I prefer to handle problems on my own before involving my partner.',
    options: bubbleOptions,
    attachmentIndicator: true,
    required: true,
    phase: 'bubble'
  },
  {
    id: 23,
    section: 5,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I am comfortable expressing my needs and desires directly.',
    options: bubbleOptions,
    attachmentIndicator: true,
    compatibilityWeight: 'high',
    required: true,
    phase: 'bubble'
  },

  // ==================== PHASE 4: QUICK POLL (2 Total) ====================
  {
    id: 11,
    section: 3,
    type: QUESTION_TYPES.QUICK_POLL,
    question: 'In new social situations, I typically...?',
    options: [
      'Jump right in and start conversations',
      'Observe first, then join in',
      'Prefer one-on-one conversations'
    ],
    personalityDimension: 'Extraversion',
    required: true,
    phase: 'bubble'
  },
  {
    id: 15,
    section: 3,
    type: QUESTION_TYPES.QUICK_POLL,
    question: 'I tend to get stressed when things go wrong?',
    options: [
      "Yes, I'm sensitive to stress",
      'Sometimes, depends on the situation',
      "Not really, I'm pretty calm"
    ],
    personalityDimension: 'Neuroticism',
    required: true,
    phase: 'bubble'
  },

  // ==================== PHASE 5: DEALBREAKER TOGGLES (5 Total) ====================
  {
    id: 'db_1',
    section: 6,
    sectionTitle: 'Relationship Dealbreakers',
    sectionEmoji: '⚠️',
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must agree on having/not having children',
    name: 'kids',
    compatibilityWeight: 'absolute',
    required: true,
    phase: 'dealbreaker'
  },
  {
    id: 'db_2',
    section: 6,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must agree on monogamy vs open relationship',
    name: 'monogamy',
    compatibilityWeight: 'absolute',
    required: true,
    phase: 'dealbreaker'
  },
  {
    id: 'db_3',
    section: 6,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must align on religion/spirituality',
    name: 'religion',
    compatibilityWeight: 'absolute',
    required: true,
    phase: 'dealbreaker'
  },
  {
    id: 'db_4',
    section: 6,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must share similar values (political, social)',
    name: 'values',
    compatibilityWeight: 'absolute',
    required: true,
    phase: 'dealbreaker'
  },
  {
    id: 'db_5',
    section: 6,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must share lifestyle preferences (smoking, drinking, diet)',
    name: 'lifestyle',
    compatibilityWeight: 'absolute',
    required: true,
    phase: 'dealbreaker'
  }
];

// Verify array length
if (personalityQuestions.length !== 26) {
  console.error(
    `❌ ERROR: personalityQuestions has ${personalityQuestions.length} questions, should have 26!`
  );
}

// ============================================================================
// QUESTION PHASE SEPARATION
// ============================================================================

export const getQuestionsByPhase = () => {
  return {
    text: personalityQuestions.filter(q => q.phase === 'text'),
    bubble: personalityQuestions.filter(q => q.phase === 'bubble'),
    dealbreaker: personalityQuestions.filter(q => q.phase === 'dealbreaker')
  };
};

// ============================================================================
// STRICT ORDERING VERIFICATION
// ============================================================================

export const verifyOrdering = () => {
  console.log('🔍 Verifying strict question ordering...');
  
  let textCount = 0;
  let emojiCount = 0;
  let bubbleCount = 0;
  let pollCount = 0;
  let dealCount = 0;

  personalityQuestions.forEach((q) => {
    const type = q.type;
    if (type === QUESTION_TYPES.TEXT) textCount++;
    if (type === QUESTION_TYPES.EMOJI_SCALE) emojiCount++;
    if (type === QUESTION_TYPES.BUBBLE) bubbleCount++;
    if (type === QUESTION_TYPES.QUICK_POLL) pollCount++;
    if (type === QUESTION_TYPES.DEALBREAKER_TOGGLE) dealCount++;
  });

  console.log('✅ Question Breakdown:');
  console.log(`   Text: ${textCount} questions`);
  console.log(`   Emoji Scale: ${emojiCount} questions`);
  console.log(`   Bubble: ${bubbleCount} questions`);
  console.log(`   Quick Poll: ${pollCount} questions`);
  console.log(`   Dealbreaker Toggle: ${dealCount} questions`);
  console.log(`   Total: ${textCount + emojiCount + bubbleCount + pollCount + dealCount} questions`);

  const total = textCount + emojiCount + bubbleCount + pollCount + dealCount;
  return total === 26;
};

// Run verification
if (typeof window !== 'undefined') {
  verifyOrdering();
}

// ============================================================================
// SECTION MAPPING (for progress display)
// ============================================================================

export const getSectionInfo = (section) => {
  const sectionInfo = {
    1: { emoji: "⚡", title: "Welcome & Ready?" },
    2: { emoji: "💕", title: "Love & Relationships" },
    3: { emoji: "🎭", title: "Your Personality" },
    4: { emoji: "🌟", title: "Values & Lifestyle" },
    5: { emoji: "🔗", title: "Connection & Communication" },
    6: { emoji: "⚠️", title: "Relationship Dealbreakers" },
  };
  return sectionInfo[section] || { emoji: "📋", title: "Questions" };
};