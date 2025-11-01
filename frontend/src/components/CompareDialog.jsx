// CompareDialog.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Props:
 * - open (bool)
 * - onClose (fn)
 * - otherReport (object)  // the report of the person whose profile you're viewing
 */
export default function CompareDialog({ open, onClose, otherReport }) {
  const [myReport, setMyReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const traitNames = ["extraversion", "openness", "agreeableness", "conscientiousness", "stability"];

  // small helper: compute compatibility %
  const computeCompatibility = (a, b) => {
    // similarity per trait: 1 - abs(diff)/100
    let sum = 0;
    let count = 0;
    traitNames.forEach((t) => {
      const va = (a?.traits?.[t] ?? null);
      const vb = (b?.traits?.[t] ?? null);
      if (va !== null && vb !== null && !isNaN(va) && !isNaN(vb)) {
        const sim = 1 - (Math.abs(va - vb) / 100);
        sum += sim;
        count++;
      }
    });
    if (count === 0) return 0;
    return Math.round((sum / count) * 100); // percent
  };

  const buildInsights = (a, b) => {
    if (!a || !b) return { bullets: [], summary: "" };
    const bullets = [];
    // highlight close matches and big gaps
    traitNames.forEach((t) => {
      const va = a.traits?.[t];
      const vb = b.traits?.[t];
      if (va == null || vb == null) return;
      const diff = Math.abs(va - vb);
      if (diff <= 10) {
        bullets.push(`Both of you are similar on ${t} (${va} / ${vb}) — this helps smooth interactions.`);
      } else if (diff <= 30) {
        bullets.push(`Moderate difference in ${t} (${va} / ${vb}) — can complement each other if both adapt.`);
      } else {
        bullets.push(`Large difference in ${t} (${va} / ${vb}) — may cause friction unless communicated about.`);
      }
    });

    // conflict warning: if one very introverted (low extraversion) and other high extroversion
    const extA = a.traits?.extraversion ?? 50;
    const extB = b.traits?.extraversion ?? 50;
    if ((extA <= 30 && extB >= 70) || (extB <= 30 && extA >= 70)) {
      bullets.push("Potential friction: one partner enjoys lots of social energy while the other prefers quiet — set expectations for social time.");
    }

    // emotional stability gap
    const stA = a.traits?.stability ?? 50;
    const stB = b.traits?.stability ?? 50;
    if (Math.abs(stA - stB) > 40) {
      bullets.push("Emotional reactivity differs a lot — agree on how to support each other during stress.");
    }

    const compatibility = computeCompatibility(a, b);
    const summary =
      compatibility >= 80
        ? "High compatibility — you have similar approaches and should find it easy to sync."
        : compatibility >= 60
        ? "Good compatibility — a few differences, but manageable with communication."
        : compatibility >= 40
        ? "Moderate compatibility — some work needed; set expectations early."
        : "Low compatibility — significant differences; be mindful and communicate boundaries.";

    return { bullets, summary, compatibility };
  };

  useEffect(() => {
    if (!open) return;
    // fetch logged-in user's report
    const fetchMine = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:5000/api/personality/report/me", {
          withCredentials: true,
        });
        // backend returns { report: ... }
        setMyReport(res.data.report ?? res.data);
      } catch (err) {
        console.error("Compare dialog fetch my report error:", err);
        setError("Failed to load your personality report. Make sure you're logged in and have taken the test.");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, [open]);

  if (!open) return null;

  const other = otherReport;
  const mine = myReport;
  const insights = buildInsights(mine, other);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-auto p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Personality Comparison</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading your report…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Mine */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">You</h4>
                <p className="text-sm mb-2 italic">{mine?.personalityType ?? "No type"}</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(mine?.traits ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="capitalize">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Other Person</h4>
                <p className="text-sm mb-2 italic">{other?.personalityType ?? "No type"}</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(other?.traits ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="capitalize">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compatibility score + summary */}
            <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Compatibility Score</div>
                  <div className="text-2xl font-bold">{insights.compatibility ?? "—"}%</div>
                </div>
                <div className="max-w-xl text-sm text-gray-700">{insights.summary}</div>
              </div>
            </div>

            {/* Insights bullets */}
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Insights & Suggestions</h5>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {insights.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Action tips */}
            <div className="mb-2 text-sm text-gray-700">
              <strong>Tips:</strong> If a difference is highlighted—talk about expectations, schedule social time, and agree on stress-handling strategies.
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  // maybe open chat or profile message flow in your app
                  onClose();
                }}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg"
              >
                Got it
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
