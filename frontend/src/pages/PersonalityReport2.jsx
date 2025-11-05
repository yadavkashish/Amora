"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function PersonalityReportDisplay() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchReport();
  }, []);

  // Generate report first time
  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/personality/generate-report`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Report generated:", response.data);

      // After generation, fetch the complete report
      await fetchReport();
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.response?.data?.error || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  // Fetch existing report
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/personality/my-report`,
        {
          withCredentials: true,
        }
      );

      console.log("Full API Response:", response.data);
      setReport(response.data.report);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report:", err);
      if (err.response?.status === 404 || err.response?.data?.code === "REPORT_NOT_GENERATED") {
        // Report doesn't exist or not generated - prompt to generate
        setError("Generate your personalized report");
        setLoading(false);
      } else {
        setError(err.response?.data?.error || "Failed to fetch report");
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading your personality profile...
          </p>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            🤖 Generating your AI-powered personality report...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This will take 15-30 seconds. We're analyzing your personality
            deeply.
          </p>
        </div>
      </div>
    );
  }

  if (!report && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error}
          </h2>
          <p className="text-gray-600 mb-6">
            Complete the personality quiz and let our AI generate your unique,
            personalized report.
          </p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Take the personality quiz to see your detailed report.
          </p>
        </div>
      </div>
    );
  }

  // Helper Components
function InsightSection({ title, description, icon }) {
  return (
    <div className="border-l-4 border-gradient-to-b from-pink-500 to-purple-600 pl-6 py-4">
      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <span className="text-2xl mr-2">{icon}</span>
        {title}
      </h4>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

function getScoreLevel(score) {
  if (score > 75) return "Very High";
  if (score > 60) return "High";
  if (score > 40) return "Moderate";
  if (score > 25) return "Low";
  return "Very Low";
}

  const { personalityProfile, detailedReport, scores } = report;

  return (
    <div className="min-h-screen pt-23 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== HEADER SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            {personalityProfile}
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-Powered Personality Profile for Dating
          </p>
          <p className="text-sm text-purple-600 mt-2">
            ✨ Generated by AI for maximum accuracy
          </p>
        </motion.div>

        {/* ===== PERSONALITY TYPE CARD ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {detailedReport.summary.headline}
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              {detailedReport.summary.tagline}
            </p>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {detailedReport.summary.description}
            </p>
          </div>

          {/* Big Five Visualization */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Your Big Five Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {Object.entries(scores).map(([dimension, score]) => (
                <motion.div
                  key={dimension}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-flex items-center justify-center h-32 w-32 mb-4">
                    <svg className="transform -rotate-90" width="130" height="130">
                      <circle
                        cx="65"
                        cy="65"
                        r="60"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="65"
                        cy="65"
                        r="60"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray={`${(score / 100) * 377} 377`}
                        initial={{ strokeDasharray: "0 377" }}
                        animate={{
                          strokeDasharray: `${(score / 100) * 377} 377`,
                        }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {score}
                      </p>
                      <p className="text-xs text-gray-500">/ 100</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 capitalize mb-2">
                    {dimension.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getScoreLevel(score)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== TABS SECTION ===== */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              "overview",
              "insights",
              "career",
              "relationships",
              "dating",
              "enneagram",
            ].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab === "dating" ? "💕 Dating" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  About You
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {detailedReport.personalityNarrative}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* Strengths */}
                  <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✨</span>Your Strengths
                    </h4>
                    <ul className="space-y-3">
                      {detailedReport.detailedInsights.strengths.map(
                        (strength, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start">
                            <span className="text-green-500 mr-3 font-bold">
                              ✓
                            </span>
                            <span>{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Development Areas */}
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🌱</span>Areas for Growth
                    </h4>
                    <ul className="space-y-3">
                      {detailedReport.detailedInsights.developmentAreas.map(
                        (area, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-3 font-bold">
                              →
                            </span>
                            <span>{area}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8"
              >
                <InsightSection
                  title="Communication Style"
                  description={detailedReport.detailedInsights.communicationStyle}
                  icon="💬"
                />
                <InsightSection
                  title="Stress Response"
                  description={detailedReport.detailedInsights.stressResponse}
                  icon="🧠"
                />
                <InsightSection
                  title="Decision Making"
                  description={
                    detailedReport.detailedInsights.decisionMakingStyle
                  }
                  icon="🎯"
                />
                <InsightSection
                  title="Work Style"
                  description={detailedReport.detailedInsights.workStyle}
                  icon="💼"
                />
              </motion.div>
            )}

            {/* CAREER TAB */}
            {activeTab === "career" && (
              <motion.div
                key="career"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Career Guidance
                </h3>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Suggested Careers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedReport.careerGuidance.suggestedCareers.map(
                      (career, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 border-l-4 border-pink-500"
                        >
                          <p className="text-gray-800 font-semibold">{career}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
                    <h5 className="font-bold text-indigo-900 mb-3">
                      Ideal Work Environment
                    </h5>
                    <p className="text-gray-700">
                      {detailedReport.careerGuidance.workEnvironment}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                    <h5 className="font-bold text-amber-900 mb-3">
                      Leadership Style
                    </h5>
                    <p className="text-gray-700">
                      {detailedReport.careerGuidance.leadershipStyle}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RELATIONSHIPS TAB */}
            {activeTab === "relationships" && (
              <motion.div
                key="relationships"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Relationship Insights
                </h3>

                <div className="bg-pink-50 rounded-2xl p-6 border-2 border-pink-200">
                  <h5 className="font-bold text-pink-900 mb-3">
                    Communication Needs
                  </h5>
                  <p className="text-gray-700">
                    {detailedReport.relationshipInsights.communicationNeeds}
                  </p>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h5 className="font-bold text-red-900 mb-3">
                    Conflict Resolution
                  </h5>
                  <p className="text-gray-700">
                    {detailedReport.relationshipInsights.conflictStyle}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-3">
                    Intimacy Preference
                  </h5>
                  <p className="text-gray-700">
                    {detailedReport.relationshipInsights.intimacyPreference}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h5 className="font-bold text-blue-900 mb-3">
                    Partner Compatibility
                  </h5>
                  <p className="text-gray-700">
                    {detailedReport.relationshipInsights.partnerCompatibility}
                  </p>
                </div>
              </motion.div>
            )}

            {/* DATING TAB (NEW) */}
            {activeTab === "dating" && (
              <motion.div
                key="dating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Ideal Partner */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    💕 Your Ideal Partner
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {detailedReport.relationshipInsights.idealPartnerProfile ||
                      detailedReport.relationshipInsights.partnerCompatibility}
                  </p>
                </div>

                {/* Date Ideas */}
                {detailedReport.detailedReport?.dateIdeas &&
                  detailedReport.detailedReport.dateIdeas.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        🌹 Ideal Date Ideas
                      </h3>
                      <div className="space-y-4">
                        {detailedReport.detailedReport.dateIdeas.map(
                          (date, idx) => (
                            <div
                              key={idx}
                              className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-l-4 border-pink-500"
                            >
                              <h5 className="font-bold text-gray-800 mb-2">
                                {date.idea}
                              </h5>
                              <p className="text-gray-700 text-sm">
                                {date.reason}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Conversation Starters */}
                {detailedReport.detailedReport?.conversationStarters &&
                  detailedReport.detailedReport.conversationStarters.length >
                    0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        💬 Great Conversation Starters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detailedReport.detailedReport.conversationStarters.map(
                          (starter, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500"
                            >
                              <p className="text-gray-700">{starter}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Red Flags */}
                {detailedReport.detailedReport?.redFlags &&
                  detailedReport.detailedReport.redFlags.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        ⚠️ Personal Growth Areas to Watch
                      </h3>
                      <ul className="space-y-3">
                        {detailedReport.detailedReport.redFlags.map(
                          (flag, idx) => (
                            <li
                              key={idx}
                              className="text-gray-700 flex items-start"
                            >
                              <span className="text-yellow-500 mr-3 font-bold">
                                •
                              </span>
                              <span>{flag}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </motion.div>
            )}

            {/* ENNEAGRAM TAB */}
            {activeTab === "enneagram" && (
              <motion.div
                key="enneagram"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Enneagram Type
                </h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200 text-center">
                  <p className="text-6xl font-bold text-yellow-600 mb-4">
                    {detailedReport.enneagramAnalysis.type}
                  </p>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {detailedReport.enneagramAnalysis.name}
                  </h4>
                  <p className="text-gray-700 text-lg">
                    {detailedReport.enneagramAnalysis.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== ACTION ITEMS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detailedReport.actionItems.map((item, idx) => (
              <div key={idx} className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">
                  <span className="text-white font-bold">{idx + 1}</span>
                </div>
                <p className="ml-4 text-gray-700 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}