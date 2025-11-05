// ============================================================================
// 🎯 FINAL QUESTIONNAIRE - GUARANTEED STRICT ORDER
// TEXT QUESTIONS FIRST → BUBBLE QUESTIONS → DEALBREAKER TOGGLES
// ============================================================================
// This version uses a FLAT array with guaranteed strict ordering
// No mixing of types - questions are physically arranged in order
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
// SINGLE FLAT ARRAY - NO MIXING TYPES
// This is the ONLY array - questions appear in EXACT order they will be shown
// ============================================================================

export const personalityQuestions = [
  // ==================== PART 1: TEXT QUESTIONS (15 Questions) ====================
  // Questions 0-14 are 100% TEXT only
  {
    id: 1,
    section: 1,
    sectionTitle: 'Welcome & Ready?',
    sectionEmoji: '⚡',
    type: QUESTION_TYPES.TEXT,
    question: "What's your current relationship status?",
    options: [
      'Single and looking',
      'Single but open to meeting someone',
      'Casually dating',
      'Exploring what\'s out there'
    ],
    required: true
  },
  {
    id: 3,
    section: 1,
    type: QUESTION_TYPES.TEXT,
    question: 'What matters most in your dating journey?',
    options: [
      'Finding a genuine connection',
      'Taking things slow and exploring',
      'Building something long-term',
      'Meeting interesting people'
    ],
    required: true
  },
  {
    id: 4,
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
    required: true
  },
  {
    id: 6,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: 'What does emotional intimacy mean to you?',
    options: [
      'Deep conversations about our feelings and fears',
      'Being vulnerable and fully known by someone',
      'Feeling safe to be completely myself',
      'A combination of all of these'
    ],
    required: true
  },
  {
    id: 8,
    section: 2,
    type: QUESTION_TYPES.TEXT,
    question: 'How do you handle conflicts in a relationship?',
    options: [
      'Calmly talk things out immediately',
      'Take time to cool down first, then discuss',
      'Avoid arguments until it settles naturally',
      'Get emotional but resolve it quickly'
    ],
    required: true
  },
  {
    id: 10,
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
    required: true
  },
  {
    id: 19,
    section: 4,
    sectionTitle: 'Life & Goals',
    sectionEmoji: '🚀',
    type: QUESTION_TYPES.TEXT,
    question: 'Where do you see yourself in 5 years?',
    options: [
      'Established in my career with a partner',
      'Focused on personal growth and exploration',
      'Building something meaningful with someone',
      'Open to wherever life takes me'
    ],
    required: true
  },
  {
    id: 21,
    section: 4,
    type: QUESTION_TYPES.TEXT,
    question: 'What role does travel play in your ideal life?',
    options: [
      'I love exploring new places regularly',
      "I enjoy travel but don't need it constantly",
      'I prefer establishing roots in one place',
      'Adventure over stability'
    ],
    required: true
  },
  {
    id: 23,
    section: 4,
    type: QUESTION_TYPES.TEXT,
    question: 'How important is financial stability to you?',
    options: [
      'Very important - stability equals security',
      'Important, but I value adventure too',
      "I'm more about experiences than money",
      'Depends on the situation'
    ],
    required: true
  },
  {
    id: 27,
    section: 5,
    sectionTitle: 'Money Matters',
    sectionEmoji: '💰',
    type: QUESTION_TYPES.TEXT,
    question: 'How do you prefer to handle shared expenses with a partner?',
    options: [
      'Split everything 50/50',
      'Split based on income',
      'One person handles finances',
      'Depends on the situation'
    ],
    required: true
  },
  {
    id: 29,
    section: 6,
    sectionTitle: 'Connection & Communication',
    sectionEmoji: '🔗',
    type: QUESTION_TYPES.TEXT,
    question: 'When your partner is upset, how do you usually respond?',
    options: [
      'Listen and comfort them immediately',
      'Give them space and talk later',
      'Try to cheer them up or distract them',
      'Feel unsure how to help'
    ],
    attachmentIndicator: true,
    required: true
  },
  {
    id: 32,
    section: 6,
    type: QUESTION_TYPES.TEXT,
    question: 'How comfortable are you with emotional vulnerability?',
    options: [
      'Very comfortable - I share openly',
      'Comfortable with the right person',
      'It takes time to open up',
      'I keep some walls up'
    ],
    attachmentIndicator: true,
    required: true
  },
  {
    id: 34,
    section: 6,
    type: QUESTION_TYPES.TEXT,
    question: 'How do you prefer to discuss difficult topics?',
    options: [
      'Direct and honest, get to the point',
      'Gently, with care for feelings',
      'After cooling down, when emotions settle',
      'Depends on the situation'
    ],
    required: true
  },
  {
    id: 35,
    section: 7,
    sectionTitle: 'Final Compatibility Check',
    sectionEmoji: '⚠️',
    type: QUESTION_TYPES.TEXT,
    question: 'What does loyalty mean to you?',
    options: [
      'Being emotionally and physically faithful',
      'Being transparent and honest always',
      'Standing by each other through challenges',
      'Prioritizing each other above others'
    ],
    required: true
  },

  // ==================== PART 2: EMOJI SCALE QUESTIONS (2 Questions) ====================
  // Questions 15-16 are EMOJI SCALE
  {
    id: 2,
    section: 1,
    type: QUESTION_TYPES.EMOJI_SCALE,
    question: 'How ready do you feel for a relationship right now?',
    options: emojiScaleOptions,
    required: true
  },
  {
    id: 26,
    section: 5,
    type: QUESTION_TYPES.EMOJI_SCALE,
    question: 'How comfortable are you discussing finances in a relationship?',
    options: emojiScaleOptions,
    required: true
  },

  // ==================== PART 3: BUBBLE SCALE QUESTIONS (18 Questions) ====================
  // Questions 17-34 are 100% BUBBLE only
  {
    id: 5,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I express my feelings openly and directly.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 7,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'When my partner is upset, I know how to comfort them.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 9,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I need reassurance from my partner regularly.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 11,
    section: 2,
    type: QUESTION_TYPES.BUBBLE,
    question: 'Personal space in a relationship is essential for me.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 12,
    section: 3,
    sectionTitle: 'Your Personality',
    sectionEmoji: '🎭',
    type: QUESTION_TYPES.BUBBLE,
    question: 'I enjoy being the center of attention.',
    options: bubbleOptions,
    personalityDimension: 'Extraversion',
    required: true
  },
  {
    id: 14,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: "I like trying new things, even if they're risky.",
    options: bubbleOptions,
    personalityDimension: 'Openness',
    required: true
  },
  {
    id: 15,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: "I find it easy to empathize with others' feelings.",
    options: bubbleOptions,
    personalityDimension: 'Agreeableness',
    required: true
  },
  {
    id: 17,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I make decisions based on logic rather than emotions.',
    options: bubbleOptions,
    personalityDimension: 'Conscientiousness',
    required: true
  },
  {
    id: 18,
    section: 3,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I value honesty over politeness.',
    options: bubbleOptions,
    personalityDimension: 'Character',
    required: true
  },
  {
    id: 20,
    section: 4,
    type: QUESTION_TYPES.BUBBLE,
    question: 'Career advancement is important to my happiness.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 24,
    section: 4,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I tend to plan my life in detail.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 28,
    section: 5,
    type: QUESTION_TYPES.BUBBLE,
    question: "I'm comfortable with my partner having debt.",
    options: bubbleOptions,
    required: true
  },
  {
    id: 30,
    section: 6,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I need frequent communication throughout the day.',
    options: bubbleOptions,
    attachmentIndicator: true,
    required: true
  },
  {
    id: 33,
    section: 6,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I tend to apologize first when we have conflicts.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 36,
    section: 7,
    type: QUESTION_TYPES.BUBBLE,
    question: 'I forgive people easily.',
    options: bubbleOptions,
    required: true
  },
  {
    id: 37,
    section: 7,
    type: QUESTION_TYPES.BUBBLE,
    question: "I enjoy helping others achieve their goals.",
    options: bubbleOptions,
    required: true
  },

  // ==================== PART 4: QUICK POLL QUESTIONS (5 Questions) ====================
  // Questions 35-39 are QUICK POLL
  {
    id: 13,
    section: 3,
    type: QUESTION_TYPES.QUICK_POLL,
    question: 'In new social situations, I typically...?',
    options: [
      'Jump right in and start conversations',
      'Observe first, then join in',
      'Prefer one-on-one conversations'
    ],
    personalityDimension: 'Extraversion',
    required: true
  },
  {
    id: 16,
    section: 3,
    type: QUESTION_TYPES.QUICK_POLL,
    question: 'I tend to get stressed when things go wrong?',
    options: [
      "Yes, I'm sensitive to stress",
      'Sometimes, depends on the situation',
      "Not really, I'm pretty calm"
    ],
    personalityDimension: 'Neuroticism',
    required: true
  },
  {
    id: 22,
    section: 4,
    type: QUESTION_TYPES.QUICK_POLL,
    question: 'How do you like to spend your free time?',
    options: [
      'With friends and social activities',
      'With a partner, one-on-one',
      'Alone or pursuing hobbies'
    ],
    required: true
  },
  {
    id: 25,
    section: 5,
    type: QUESTION_TYPES.QUICK_POLL,
    question: "What's your approach to money?",
    options: [
      'Save first, spend later',
      'Balance saving and enjoying',
      'Enjoy now, worry later'
    ],
    required: true
  },
  {
    id: 31,
    section: 6,
    type: QUESTION_TYPES.QUICK_POLL,
    question: "When you're stressed, I prefer to...",
    options: [
      'Talk it out with my partner',
      'Have space to process alone',
      'Do something to distract myself'
    ],
    attachmentIndicator: true,
    required: true
  },

  // ==================== PART 5: DEALBREAKER TOGGLE QUESTIONS (5 Questions) ====================
  // Questions 40-44 are 100% DEALBREAKER TOGGLE only
  {
    id: 'db_1',
    section: 7,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must agree on having kids',
    name: 'kids',
    required: true
  },
  {
    id: 'db_2',
    section: 7,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must agree on monogamy',
    name: 'monogamy',
    required: true
  },
  {
    id: 'db_3',
    section: 7,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must align on religion/spirituality',
    name: 'religion',
    required: true
  },
  {
    id: 'db_4',
    section: 7,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must share similar values (political, social)',
    name: 'values',
    required: true
  },
  {
    id: 'db_5',
    section: 7,
    type: QUESTION_TYPES.DEALBREAKER_TOGGLE,
    question: 'Must share lifestyle preferences (smoking, drinking, diet)',
    name: 'lifestyle',
    required: true
  }
];

// Verify array length
if (personalityQuestions.length !== 42) {
  console.error(
    `❌ ERROR: personalityQuestions has ${personalityQuestions.length} questions, should have 42!`
  );
}

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
  let inTextSection = true;
  let inEmojiSection = false;
  let inBubbleSection = false;
  let inPollSection = false;
  let inDealSection = false;

  personalityQuestions.forEach((q, index) => {
    const type = q.type;

    // Check if we're violating strict order
    if (inTextSection && type !== QUESTION_TYPES.TEXT && type !== QUESTION_TYPES.EMOJI_SCALE) {
      inTextSection = false;
      inEmojiSection = false;
      inBubbleSection = true;
    } else if (inBubbleSection && type !== QUESTION_TYPES.BUBBLE) {
      inBubbleSection = false;
      inPollSection = true;
    } else if (inPollSection && type !== QUESTION_TYPES.QUICK_POLL) {
      inPollSection = false;
      inDealSection = true;
    }

    // Count each type
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

  // Find any out-of-order questions
  let allCorrect = true;
  let currentType = QUESTION_TYPES.TEXT;
  const typeOrder = [QUESTION_TYPES.TEXT, QUESTION_TYPES.EMOJI_SCALE, QUESTION_TYPES.BUBBLE, QUESTION_TYPES.QUICK_POLL, QUESTION_TYPES.DEALBREAKER_TOGGLE];

  personalityQuestions.forEach((q, index) => {
    const expectedTypeIndex = typeOrder.indexOf(currentType);
    const actualTypeIndex = typeOrder.indexOf(q.type);

    if (actualTypeIndex < expectedTypeIndex) {
      console.error(
        `❌ ERROR at question ${index}: Found ${q.type} after ${currentType}`
      );
      allCorrect = false;
    }

    if (actualTypeIndex > expectedTypeIndex) {
      currentType = q.type;
    }
  });

  if (allCorrect) {
    console.log('✅ Strict ordering VERIFIED - All questions in correct order!');
  } else {
    console.error('❌ Ordering violation detected!');
  }

  return allCorrect;
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
    4: { emoji: "🚀", title: "Life & Goals" },
    5: { emoji: "💰", title: "Money Matters" },
    6: { emoji: "🔗", title: "Connection & Communication" },
    7: { emoji: "⚠️", title: "Final Compatibility Check" },
  };
  return sectionInfo[section] || { emoji: "📋", title: "Questions" };
};