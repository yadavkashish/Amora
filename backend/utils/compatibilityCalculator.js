// Category weights
const CATEGORY_WEIGHTS = {
  personality: 0.20,
  attachment: 0.15,
  loveLanguages: 0.15,
  values: 0.20,
  conflict: 0.15,
  interests: 0.05,
  expectations: 0.10,
  emotional: 0.00 // merged into expectations if needed
};

// Map questions into categories
const QUESTION_CATEGORIES = {
  personality: ["Q1", "Q2", "Q3"],
  attachment: ["Q4", "Q5"],
  loveLanguages: ["Q6", "Q7"],
  values: ["Q8", "Q9", "Q10", "Q11"],
  conflict: ["Q12", "Q13", "Q14"],
  interests: ["Q15", "Q16", "Q17"],
  expectations: ["Q18", "Q19", "Q20", "Q21"],
  emotional: ["Q22", "Q23"]
};

// Normalized similarity
function calculateSimilarity(ansA, ansB, maxValue = 5) {
  const diff = Math.abs(ansA - ansB);
  return 1 - (diff / (maxValue - 1));
}

// Special handling rules
function applySpecialHandling(userA, userB, rawScore) {
  let finalScore = rawScore;

  // Dealbreakers
  if (userA.dealbreakers.kids && userA.answers.Q9 !== userB.answers.Q9) {
    return 0.40;
  }
  if (userA.dealbreakers.monogamy && userA.answers.Q19 !== userB.answers.Q19) {
    return 0.40;
  }
  if (userA.dealbreakers.religion && userA.answers.Q11 !== userB.answers.Q11) {
    return 0.40;
  }

  // Attachment mismatch (anxious vs avoidant)
  const attachA = userA.answers.Q4;
  const attachB = userB.answers.Q4;
  if ((attachA === 2 && attachB === 3) || (attachA === 3 && attachB === 2)) {
    finalScore -= 0.10;
  }

  // Love language mismatch
  if (userA.answers.Q6 !== userB.answers.Q6) {
    finalScore -= 0.05;
  }

  return Math.max(0, finalScore);
}

// Full compatibility function
function calculateCompatibility(userA, userB) {
  let totalScore = 0;

  for (let category in QUESTION_CATEGORIES) {
    const questions = QUESTION_CATEGORIES[category];
    let categorySum = 0;

    questions.forEach(q => {
      const sim = calculateSimilarity(userA.answers[q], userB.answers[q], 5);
      categorySum += sim;
    });

    const avgCategory = categorySum / questions.length;
    totalScore += avgCategory * CATEGORY_WEIGHTS[category];
  }

  return applySpecialHandling(userA, userB, totalScore);
}

function interpretScore(score) {
  const percent = (score * 100).toFixed(1);
  if (percent >= 85) return `${percent}% - Excellent Match 💖`;
  if (percent >= 70) return `${percent}% - Good Match 💫`;
  if (percent >= 50) return `${percent}% - Moderate Match 🙂`;
  return `${percent}% - Low Match ⚠️`;
}

module.exports = { calculateCompatibility, interpretScore };
