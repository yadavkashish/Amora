import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Target, Flame, Info, Heart, Sparkles, Award, ShieldCheck, Lightbulb } from "lucide-react";

/* -------------------------
   RESTORED ORIGINAL LOGIC
   ------------------------- */

function normalizeTraitValue(v) {
  if (v == null) return null;
  if (v > 0 && v <= 1) return Math.round(v * 100);
  if (v >= 0 && v <= 100) return Math.round(v);
  const n = Number(v);
  if (!isNaN(n)) {
    if (n <= 1) return Math.round(n * 100);
    return Math.round(n);
  }
  return null;
}

// Map of Enneagram Numbers to Names
const getEnneagramName = (type) => {
  const names = {
    1: "The Reformer",
    2: "The Helper",
    3: "The Achiever",
    4: "The Individualist",
    5: "The Investigator",
    6: "The Loyalist",
    7: "The Enthusiast",
    8: "The Challenger",
    9: "The Peacemaker"
  };
  return names[String(type)] || "Unknown Type";
};

function getTraitLabel(trait, value) {
  const mid = 50;
  const diff = value - mid;
  const labels = {
    openness: { high: "Very open to new experiences", low: "Prefers routine and tradition" },
    conscientiousness: { high: "Highly organized & disciplined", low: "More spontaneous & flexible" },
    extraversion: { high: "Very outgoing & social", low: "More introverted & reserved" },
    agreeableness: { high: "Very compassionate & cooperative", low: "More independent & direct" },
    neuroticism: { high: "More emotionally reactive", low: "Very emotionally stable" },
  };
  const traitLabels = labels[trait] || { high: "High", low: "Low" };
  return Math.abs(diff) > 15 ? (diff > 0 ? traitLabels.high : traitLabels.low) : "Moderate";
}

function suggestionForTrait(trait) {
  const suggestions = {
    openness: "One of you is more adventurous, the other prefers stability. Balance novelty with comfort—try new things together at a pace you both enjoy.",
    conscientiousness: "Different organization styles can clash. Agree on shared responsibilities and check in regularly to avoid miscommunication.",
    extraversion: "One prefers social gatherings, the other quiet time. Respect each other's energy needs and find activities that satisfy both.",
    agreeableness: "One is more direct, the other more diplomatic. Practice clear, compassionate communication to avoid misunderstandings.",
    neuroticism: "Different stress responses. Create a safe space to discuss feelings and develop coping strategies together.",
  };
  return suggestions[trait] || "Discuss differences openly and find compromises that work for both.";
}

function computeDetailedCompatibility(aReport, bReport) {
  if (!aReport || !bReport) {
    return {
      score: null,
      summary: "Comparison unavailable.",
      reasons: [],
      suggestions: [],
      traits: [],
      enneagrams: { a: null, b: null },
      sharedStrengths: [],
      complementaryWeaknesses: { aCoversB: [], bCoversA: [] },
      compatibilityBreakdown: {},
    };
  }

  const getBigFiveFrom = (report) =>
    report.bigFive ?? report.scores ?? (report.aiGeneratedReport && report.aiGeneratedReport.bigFive) ?? {};
  const getEnneagramFrom = (report) =>
    report?.enneagramType ?? report?.aiGeneratedReport?.enneagramType ?? report?.detailedReport?.enneagramAnalysis?.type ?? null;
  const getStrengthsFrom = (report) =>
    report?.detailedReport?.detailedInsights?.strengths ?? report?.strengths ?? report?.aiGeneratedReport?.strengths ?? [];
  const getWeaknessesFrom = (report) =>
    report?.detailedReport?.detailedInsights?.developmentAreas ?? report?.developmentAreas ?? report?.aiGeneratedReport?.developmentAreas ?? report?.challenges ?? report?.aiGeneratedReport?.challenges ?? [];

  const aBig = getBigFiveFrom(aReport) || {};
  const bBig = getBigFiveFrom(bReport) || {};

  const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
  let traitComparisons = [];
  let totalDiff = 0;
  let count = 0;

  for (const t of traits) {
    const av = normalizeTraitValue(aBig[t]);
    const bv = normalizeTraitValue(bBig[t]);
    if (av == null || bv == null) continue;

    const diff = Math.abs(av - bv);
    const compatibility = Math.max(0, 100 - diff * 1.5);

    traitComparisons.push({
      trait: t, a: av, b: bv,
      compatibility: Math.round(compatibility),
      aLabel: getTraitLabel(t, av),
      bLabel: getTraitLabel(t, bv),
    });

    totalDiff += diff;
    count++;
  }

  const avgDiff = count ? totalDiff / count : 50;
  const baseScore = Math.round((100 - avgDiff) * 0.85 + 15);

  const aEnn = getEnneagramFrom(aReport);
  const bEnn = getEnneagramFrom(bReport);
  const ennBonus = aEnn && bEnn && String(aEnn) === String(bEnn) ? 12 : aEnn && bEnn ? 5 : 0;

  const aStr = (getStrengthsFrom(aReport) || []).map((s) => String(s).toLowerCase());
  const bStr = (getStrengthsFrom(bReport) || []).map((s) => String(s).toLowerCase());
  const sharedStrengths = aStr.filter((s) => bStr.includes(s));
  const sharedBonus = Math.min(10, sharedStrengths.length * 4);

  const aWeak = (getWeaknessesFrom(aReport) || []).map((w) => String(w).toLowerCase());
  const bWeak = (getWeaknessesFrom(bReport) || []).map((w) => String(w).toLowerCase());
  const bStrengthsCoversAWeakness = aWeak.filter((w) => bStr.includes(w));
  const aStrengthsCoversBWeakness = bWeak.filter((w) => aStr.includes(w));
  const complementaryBonus = Math.min(8, (bStrengthsCoversAWeakness.length + aStrengthsCoversBWeakness.length) * 2);

  let score = Math.min(100, Math.max(0, baseScore + ennBonus + sharedBonus + complementaryBonus));

  const reasons = [];
  const suggestions = [];

  if (score >= 85) reasons.push("Exceptional compatibility — you are likely to have a deeply harmonious connection.");
  else if (score >= 70) reasons.push("Strong compatibility — solid foundation with natural understanding.");
  else if (score >= 55) reasons.push("Moderate compatibility — potential for a meaningful connection with effort.");
  else if (score >= 40) reasons.push("Low compatibility — connection is possible but requires intentional work.");
  else reasons.push("Very different personalities — compatibility requires significant patience.");

  traitComparisons.sort((x, y) => x.compatibility - y.compatibility);
  const topMismatches = traitComparisons.slice(0, 2);
  const topMatches = [...traitComparisons].sort((x, y) => y.compatibility - x.compatibility).slice(0, 2);

  if (topMatches.length > 0) {
    topMatches.forEach((t) => {
      reasons.push(`${t.trait.charAt(0).toUpperCase() + t.trait.slice(1)}: ${t.aLabel === t.bLabel ? t.aLabel : "Similar levels — natural alignment"}.`);
    });
  }

  if (topMismatches.length > 0) {
    topMismatches.forEach((t) => {
      reasons.push(`${t.trait.charAt(0).toUpperCase() + t.trait.slice(1)}: ${t.aLabel} vs ${t.bLabel}.`);
      suggestions.push(suggestionForTrait(t.trait));
    });
  }

  if (aEnn && bEnn) {
    if (String(aEnn) === String(bEnn)) reasons.push(`Both are Enneagram type ${aEnn} — shared core motivations.`);
    else {
      reasons.push(`Different Enneagram types (${aEnn} vs ${bEnn}).`);
      suggestions.push(`As types ${aEnn} and ${bEnn}, your core motivations differ. Discuss what drives you.`);
    }
  }

  if (sharedStrengths.length > 0) {
    reasons.push(`Shared strengths: ${sharedStrengths.slice(0, 3).join(", ")}`);
    suggestions.push("Collaborate using your shared strengths for maximum impact.");
  }

  const compatibilityBreakdown = {
    traitAlignement: Math.round(avgDiff > 20 ? 50 - avgDiff : 80 - avgDiff * 1.5),
    enneagramMatch: aEnn && bEnn && String(aEnn) === String(bEnn) ? 90 : 50,
    strengthComplementarity: sharedStrengths.length + bStrengthsCoversAWeakness.length + aStrengthsCoversBWeakness.length > 3 ? 85 : 60,
  };

  return {
    score: Math.round(score),
    summary: reasons[0],
    reasons,
    suggestions: Array.from(new Set(suggestions)).slice(0, 8),
    traits: traitComparisons,
    enneagrams: { a: aEnn, b: bEnn },
    sharedStrengths,
    complementaryWeaknesses: { bCoversA: bStrengthsCoversAWeakness, aCoversB: aStrengthsCoversBWeakness },
    compatibilityBreakdown,
  };
}

/* -------------------------
   NEW MODERN UI COMPONENT
   ------------------------- */

export default function CompareDialog({ open, onClose, meReport, otherReport, compatibilityScore }) {
  const computed = useMemo(() => computeDetailedCompatibility(meReport, otherReport), [meReport, otherReport]);
  const finalScore = typeof compatibilityScore === "number" ? Math.round(compatibilityScore) : computed.score;

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md" 
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#0b0f1a] border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-[#0b0f1a]/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-600/20 rounded-2xl">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Compatibility Sync</h2>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Analysis Comparison</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400"><X /></button>
          </div>

          <div className="p-8 overflow-y-auto space-y-10">
            
            {/* Main Score Card */}
            <div className="relative p-10 rounded-[2rem] bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 text-center md:text-left">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-violet-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Sync Probability</p>
                  <h3 className="text-7xl font-black text-white">{finalScore || 0}%</h3>
                </div>
                <div className="flex-1 max-w-sm">
                  <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> 
                    {finalScore >= 80 ? "Instant Resonance" : "Strong Foundation"}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {computed.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Trait Comparison Section */}
            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" /> Big Five Comparison
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {computed.traits.map(t => (
                  <div key={t.trait} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-gray-300">
                      <span>{t.trait.replace(/_/g, " ")}</span>
                      <span className="text-violet-400">{t.compatibility}% Align</span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${t.a}%` }} className="h-full bg-violet-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 italic">You: {t.aLabel}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${t.b}%` }} className="h-full bg-fuchsia-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Them: {t.bLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Grid: Strengths & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Shared Strengths
                </h4>
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 min-h-[120px]">
                  {computed.sharedStrengths.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {computed.sharedStrengths.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No shared strengths identified.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Complementary Balance
                </h4>
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 min-h-[120px]">
                  {computed.complementaryWeaknesses.bCoversA.map((s, i) => (
                    <div key={`b-${i}`} className="flex gap-2 items-center text-xs text-indigo-300 font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> They cover: {s}
                    </div>
                  ))}
                  {computed.complementaryWeaknesses.aCoversB.map((s, i) => (
                    <div key={`a-${i}`} className="flex gap-2 items-center text-xs text-indigo-300 font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> You cover: {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Insights & Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" /> Key Insights
                </h4>
                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                  {computed.reasons.map((r, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-300 leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <p className="font-medium">{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Suggestions
                </h4>
                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                  {computed.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-300 leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="font-medium">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enneagram Spotlight with Names */}
            {(computed.enneagrams.a || computed.enneagrams.b) && (
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 px-1">
                  <Flame className="w-4 h-4 text-indigo-400" /> Enneagram Duo
                </h4>
                <div className="p-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row justify-around items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest">YOU</p>
                    <div className="flex flex-col items-center">
                      <p className="text-5xl font-black text-white leading-none">{computed.enneagrams.a || "—"}</p>
                      <p className="text-xs font-bold text-violet-400 mt-2 uppercase tracking-wide">
                        {computed.enneagrams.a ? getEnneagramName(computed.enneagrams.a) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block h-16 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest">THEM</p>
                    <div className="flex flex-col items-center">
                      <p className="text-5xl font-black text-fuchsia-400 leading-none">{computed.enneagrams.b || "—"}</p>
                      <p className="text-xs font-bold text-fuchsia-300 mt-2 uppercase tracking-wide">
                        {computed.enneagrams.b ? getEnneagramName(computed.enneagrams.b) : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-800 bg-[#0b0f1a]/80 flex justify-end">
            <button onClick={onClose} className="px-10 py-3 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl shadow-xl transition active:scale-95">
              Close Analysis
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}