// CompareDialog.jsx
import React, { useMemo } from "react";

/* -------------------------
   Helper utilities
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
    openness:
      "One of you is more adventurous, the other prefers stability. Balance novelty with comfort—try new things together at a pace you both enjoy.",
    conscientiousness:
      "Different organization styles can clash. Agree on shared responsibilities and check in regularly to avoid miscommunication.",
    extraversion:
      "One prefers social gatherings, the other quiet time. Respect each other's energy needs and find activities that satisfy both.",
    agreeableness:
      "One is more direct, the other more diplomatic. Practice clear, compassionate communication to avoid misunderstandings.",
    neuroticism:
      "Different stress responses. Create a safe space to discuss feelings and develop coping strategies together.",
  };
  return suggestions[trait] || "Discuss differences openly and find compromises that work for both.";
}

/* -------------------------
   Compatibility calculation (same logic you already had)
   ------------------------- */

function computeDetailedCompatibility(aReport, bReport) {
  if (!aReport || !bReport) {
    return {
      score: null,
      summary: "Comparison unavailable: one or both users do not have a personality report.",
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
      trait: t,
      a: av,
      b: bv,
      diff,
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
  else if (score >= 40) reasons.push("Low compatibility — meaningful connection is possible but requires intentional communication.");
  else reasons.push("Very different personalities — compatibility requires significant patience and understanding.");

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
      reasons.push(`${t.trait.charAt(0).toUpperCase() + t.trait.slice(1)}: ${t.aLabel} vs ${t.bLabel} — potential area for growth.`);
      suggestions.push(suggestionForTrait(t.trait));
    });
  }

  if (aEnn && bEnn) {
    if (String(aEnn) === String(bEnn)) reasons.push(`Both are Enneagram type ${aEnn} — shared core motivations.`);
    else {
      reasons.push(`Different Enneagram types (${aEnn} vs ${bEnn}).`);
      suggestions.push(`As ${aEnn} and ${bEnn}, your core motivations differ. Discuss what drives each of you.`);
    }
  }

  if (sharedStrengths.length > 0) {
    reasons.push(`Shared strengths: ${sharedStrengths.slice(0, 3).join(", ")}`);
    suggestions.push("Collaborate using your shared strengths for maximum impact.");
  }

  if (bStrengthsCoversAWeakness.length > 0 || aStrengthsCoversBWeakness.length > 0) {
    reasons.push("Complementary skills — you balance each other well.");
    suggestions.push("Lean on each other's strengths to cover areas where you're naturally less inclined.");
  }

  const compatibilityBreakdown = {
    traitAlignement: Math.round(avgDiff > 20 ? 50 - avgDiff : 80 - avgDiff * 1.5),
    enneagramMatch: aEnn && bEnn && String(aEnn) === String(bEnn) ? 90 : 50,
    strengthComplementarity: sharedStrengths.length + bStrengthsCoversAWeakness.length + aStrengthsCoversBWeakness.length > 3 ? 85 : 60,
  };

  const uniqSuggestions = Array.from(new Set(suggestions)).slice(0, 8);

  return {
    score: Math.round(score),
    summary: reasons[0],
    reasons,
    suggestions: uniqSuggestions,
    traits: traitComparisons,
    enneagrams: { a: aEnn, b: bEnn },
    sharedStrengths,
    complementaryWeaknesses: { bCoversA: bStrengthsCoversAWeakness, aCoversB: aStrengthsCoversBWeakness },
    compatibilityBreakdown,
  };
}

/* -------------------------
   CompareDialog component
   ------------------------- */

/**
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - meReport (object)
 *  - otherReport (object)
 *  - compatibilityScore (number | optional)  // score from Dashboard (preferred display)
 */
export default function CompareDialog({ open, onClose, meReport, otherReport, compatibilityScore = undefined }) {
  if (!open) return null;

  const computed = useMemo(() => computeDetailedCompatibility(meReport, otherReport), [meReport, otherReport]);

  // finalScore: prefer dashboard compatibilityScore when provided (but we will still show both)
  const finalScore = typeof compatibilityScore === "number" ? Math.round(compatibilityScore) : computed.score;
  const computedScore = computed.score;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-green-400 to-emerald-600";
    if (score >= 65) return "from-blue-400 to-blue-600";
    if (score >= 50) return "from-yellow-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💕</span>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Compatibility</h2>
              <p className="text-gray-500 text-sm">Personality analysis & suggestions</p>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-900 text-2xl font-bold">✕</button>
        </div>

        {/* Score Card (main) */}
        {finalScore !== null && (
          <div className={`rounded-2xl p-6 mb-4 text-white bg-gradient-to-br ${getScoreColor(finalScore)} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold opacity-90 tracking-wider">COMPATIBILITY SCORE</div>
                <div className="text-4xl font-bold">{finalScore}%</div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">
                  {finalScore >= 80 ? "Exceptional Match 🎉" : finalScore >= 65 ? "Strong Connection ✨" : finalScore >= 50 ? "Good Potential 💫" : "Worth Exploring 🌟"}
                </div>
                <div className="text-sm opacity-90 italic mt-1">{computed.summary}</div>
              </div>
            </div>

            {/* Dashboard vs Computed badges */}
            <div className="mt-4 flex items-center gap-3">
              {typeof compatibilityScore === "number" && (
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <span className="font-semibold">Dashboard</span>
                  <span className="bg-white/30 px-2 py-0.5 rounded text-xs font-bold">{Math.round(compatibilityScore)}%</span>
                </div>
              )}

              {computedScore !== null && (
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <span className="text-xs">Computed</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{computedScore}%</span>
                </div>
              )}

              <div className="ml-auto text-xs italic text-white/90">
                {typeof compatibilityScore === "number" ? "Using dashboard score" : "Using computed score"}
              </div>
            </div>
          </div>
        )}

        {/* Compatibility Breakdown */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-bold mb-3">Compatibility Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(computed.compatibilityBreakdown).map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">{k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</div>
                  <div className="text-sm font-bold text-gray-800">{v}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traits, strengths, suggestions (unchanged) */}
        {computed.traits && computed.traits.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold mb-3">Big Five Trait Comparison</h4>
            <div className="space-y-3">
              {computed.traits.map((t) => (
                <div key={t.trait} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold capitalize">{t.trait.replace(/_/g, " ")}</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${t.compatibility >= 80 ? "bg-green-100 text-green-800" : t.compatibility >= 60 ? "bg-blue-100 text-blue-800" : t.compatibility >= 40 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {t.compatibility}% aligned
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-2">You</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div className="h-2.5 bg-blue-500 rounded-full" style={{ width: `${t.a}%` }} />
                        </div>
                        <div className="text-xs font-bold w-8 text-right">{t.a}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{t.aLabel}</div>
                    </div>

                    <div className="text-gray-300 font-bold">vs</div>

                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-2">Them</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div className="h-2.5 bg-pink-500 rounded-full" style={{ width: `${t.b}%` }} />
                        </div>
                        <div className="text-xs font-bold w-8 text-right">{t.b}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{t.bLabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h5 className="font-semibold mb-2">Shared Strengths</h5>
            {computed.sharedStrengths && computed.sharedStrengths.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-green-900">
                {computed.sharedStrengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : <div className="text-sm text-gray-600">No clear shared strengths found.</div>}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h5 className="font-semibold mb-2">Complementary Skills</h5>
            {(computed.complementaryWeaknesses?.aCoversB?.length > 0 || computed.complementaryWeaknesses?.bCoversA?.length > 0) ? (
              <div className="space-y-2 text-sm text-blue-900">
                {computed.complementaryWeaknesses.bCoversA?.map((s, i) => <div key={`b-${i}`}>They cover: {s}</div>)}
                {computed.complementaryWeaknesses.aCoversB?.map((s, i) => <div key={`a-${i}`}>You cover: {s}</div>)}
              </div>
            ) : <div className="text-sm text-gray-600">No strong complementary matches identified.</div>}
          </div>
        </div>

        {computed.enneagrams && (computed.enneagrams.a || computed.enneagrams.b) && (
          <div className="mb-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h5 className="font-semibold mb-3">Enneagram</h5>
            <div className="flex gap-4">
              <div className="flex-1 text-center bg-white rounded-lg p-3 border border-purple-100">
                <div className="text-xs text-gray-600">You</div>
                <div className="text-2xl font-bold text-purple-700">{computed.enneagrams.a || "—"}</div>
              </div>
              <div className="flex-1 text-center bg-white rounded-lg p-3 border border-purple-100">
                <div className="text-xs text-gray-600">Them</div>
                <div className="text-2xl font-bold text-pink-600">{computed.enneagrams.b || "—"}</div>
              </div>
            </div>
          </div>
        )}

        {computed.reasons && computed.reasons.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold mb-2">Key Insights</h5>
            <ul className="list-disc pl-5 text-sm">
              {computed.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {computed.suggestions && computed.suggestions.length > 0 && (
          <div className="mb-4 bg-pink-50 rounded-lg p-4 border border-pink-100">
            <h5 className="font-semibold mb-2">Actionable Suggestions</h5>
            <ul className="list-disc pl-5 text-sm">
              {computed.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
