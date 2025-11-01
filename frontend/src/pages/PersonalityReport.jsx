import React, { useEffect, useState } from "react";
import axios from "axios";

const PersonalityReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/personality/report/me", {
          withCredentials: true,
        });

        console.log("Fetched Report:", res.data.report); // 👈 Debug log
        setReport(res.data.report);
      } catch (err) {
        console.error("Report Fetch Error:", err);
        setError("Failed to load personality report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Loading your report...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  if (!report)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No report found. Please take the personality test first.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 my-10">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
        Your Personality Report
      </h1>

      {report.personalityType && (
        <p className="text-center text-lg text-gray-700 mb-6 italic">
          ✨ <strong>{report.personalityType}</strong>
        </p>
      )}

      {/* Summary Section */}
      {report.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Core Personality
          </h2>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </section>
      )}

      {/* Traits Section */}
      {report.traits && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Trait Scores
          </h2>
          <ul className="space-y-1 text-gray-700">
            <li>
              <strong>Extroversion:</strong>{" "}
              {report.traits.extraversion ?? "N/A"}
            </li>
            <li>
              <strong>Openness:</strong> {report.traits.openness ?? "N/A"}
            </li>
            <li>
              <strong>Agreeableness:</strong> {report.traits.agreeableness ?? "N/A"}
            </li>
            <li>
              <strong>Conscientiousness:</strong>{" "}
              {report.traits.conscientiousness ?? "N/A"}
            </li>
            <li>
              <strong>Emotional Stability:</strong>{" "}
              {report.traits.stability ?? "N/A"}
            </li>
          </ul>
        </section>
      )}

      {/* Relationship Style */}
      {report.relationshipStyle && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Relationship Style
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {report.relationshipStyle}
          </p>
        </section>
      )}

      {/* Ideal Partner Type */}
      {report.partnerType && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Ideal Partner Type
          </h2>
          <p className="text-gray-700 leading-relaxed">{report.partnerType}</p>
        </section>
      )}

      {/* Strengths Section */}
      {report.strengths && report.strengths.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Strengths
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {report.strengths.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Challenges Section */}
      {report.challenges && report.challenges.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Challenges
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {report.challenges.map((c, index) => (
              <li key={index}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default PersonalityReport;
