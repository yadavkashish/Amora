// utils/personalityCalculator.js

// Map each question to the traits it influences
const TRAIT_MAPPING = {
  introversion: ["Q1", "Q3", "Q29", "Q35"],
  extraversion: ["Q1", "Q15", "Q16", "Q17", "Q29"],
  openness: ["Q2", "Q16", "Q17", "Q24", "Q25", "Q30"],
  agreeableness: ["Q3", "Q12", "Q13", "Q14", "Q22", "Q31", "Q33"],
  conscientiousness: ["Q2", "Q4", "Q27", "Q35"],
  emotional_stability: ["Q3", "Q12", "Q13", "Q33", "Q34"],
};

// Each answer is 0–3 (index of selected option)
function calculatePersonalityScores(answers) {
  const traitScores = {
    introversion: 0,
    extraversion: 0,
    openness: 0,
    agreeableness: 0,
    conscientiousness: 0,
    emotional_stability: 0,
  };

  // Add up scores
  Object.entries(TRAIT_MAPPING).forEach(([trait, questions]) => {
    let total = 0;
    questions.forEach(q => {
      const ans = Number(answers[q]);
      if (!isNaN(ans)) total += ans;
    });
    traitScores[trait] = total / questions.length;
  });

  // Normalize to 0–100
  Object.keys(traitScores).forEach(t => {
    traitScores[t] = Math.round((traitScores[t] / 3) * 100);
  });

  return traitScores;
}

function generatePersonalityReport(scores) {
  let summary = [];

  if (scores.extraversion > 60)
    summary.push("You’re social, outgoing, and energized by people.");
  else if (scores.introversion > 60)
    summary.push("You’re reflective, thoughtful, and enjoy deep one-on-one conversations.");

  if (scores.openness > 60)
    summary.push("You’re imaginative and open to new experiences.");
  else
    summary.push("You prefer familiarity and stability over unpredictability.");

  if (scores.agreeableness > 60)
    summary.push("You’re empathetic, kind, and value harmony in relationships.");
  else
    summary.push("You’re assertive and value honesty over diplomacy.");

  if (scores.conscientiousness > 60)
    summary.push("You’re dependable and organized — a planner by nature.");
  else
    summary.push("You prefer flexibility and spontaneity over strict routines.");

  if (scores.emotional_stability > 60)
    summary.push("You handle stress well and stay composed in challenges.");
  else
    summary.push("You feel emotions deeply and may need space to process them.");

  const personalityType =
    scores.extraversion > 60 && scores.openness > 60
      ? "Adventurous Extrovert"
      : scores.introversion > 60 && scores.agreeableness > 60
      ? "Empathetic Listener"
      : scores.conscientiousness > 60
      ? "Reliable Realist"
      : "Free-Spirited Dreamer";

  // 💡 new fields for frontend compatibility
  const relationshipStyle =
    scores.agreeableness > 60
      ? "You are emotionally supportive, compassionate, and value connection."
      : "You appreciate independence and authenticity in relationships.";

  const partnerType =
    scores.openness > 60
      ? "Creative and emotionally expressive partners suit you best."
      : "Stable, grounded partners who value routine complement you well.";

  const strengths = [];
  const challenges = [];

  if (scores.conscientiousness > 70) strengths.push("Highly reliable and organized.");
  else challenges.push("May struggle with consistency in routines.");

  if (scores.agreeableness > 70) strengths.push("Kind, empathetic, and understanding.");
  else challenges.push("Sometimes too blunt or self-focused.");

  if (scores.openness > 70) strengths.push("Imaginative and curious about new ideas.");
  else challenges.push("May resist sudden changes or experimentation.");

  if (scores.extraversion > 70) strengths.push("Excellent communicator and motivator.");
  else challenges.push("May withdraw during group interactions.");

  if (scores.emotional_stability < 50) challenges.push("Tends to overthink or stress easily.");
  else strengths.push("Calm and composed under pressure.");

  return {
    traits: {
      extraversion: scores.extraversion,
      openness: scores.openness,
      agreeableness: scores.agreeableness,
      conscientiousness: scores.conscientiousness,
      stability: scores.emotional_stability,
    },
    personalityType,
    summary: summary.join(" "),
    relationshipStyle,
    partnerType,
    strengths,
    challenges,
  };
}

module.exports = { calculatePersonalityScores, generatePersonalityReport };


module.exports = { calculatePersonalityScores, generatePersonalityReport };
