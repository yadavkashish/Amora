import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { personalityQuestions } from "../data/personalityQuestions";

/**
 * CompatibilityForm
 *
 * Key behavior:
 * - Creates `renderedQuestions` from `personalityQuestions` but replaces
 *   multiple dealbreaker_toggle entries with a single grouped step called
 *   `dealbreaker_group`.
 * - The grouped step uses the original dealbreaker questions (to render checkboxes)
 *   but the UI presents them in a single screen.
 * - Backend payload remains unchanged: `dealbreakers` object is still submitted as before.
 */

export default function CompatibilityForm() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dealbreakers, setDealbreakers] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [sectionStartTime, setSectionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


  // --- Build renderedQuestions: remove all individual dealbreaker entries and
  // replace with a single synthetic grouped dealbreaker question.
  const originalDealbreakers = personalityQuestions.filter(
    (q) => q.type === "dealbreaker_toggle"
  );

  // Questions without dealbreakers
  const nonDealbreakerQuestions = personalityQuestions.filter(
    (q) => q.type !== "dealbreaker_toggle"
  );

  // Synthetic grouped step (append at the end). You can change `section` if needed.
  const dealbreakerGroup = {
    id: "dealbreaker_group",
    name: "dealbreaker_group",
    type: "dealbreaker_toggle",
    question: "Dealbreakers (grouped)",
    // optional: pick a section — if you prefer it to appear in another place,
    // change insertion logic below.
    section: originalDealbreakers.length ? originalDealbreakers[0].section : 7,
  };

  // The actual array the UI will step through
  const renderedQuestions = [...nonDealbreakerQuestions, dealbreakerGroup];

  // Expose some derived values from renderedQuestions (used by UI)
  const totalQuestions = renderedQuestions.length;
  const currentQuestion = renderedQuestions[currentIndex];
  const currentSection = currentQuestion?.section;
  const questionsBySection = {};
  renderedQuestions.forEach((q) => {
    if (!questionsBySection[q.section]) questionsBySection[q.section] = [];
    questionsBySection[q.section].push(q);
  });
  const sectionQuestions = questionsBySection[currentSection] || [];
  const indexInSection = sectionQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  // Progress (based on renderedQuestions)
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // --- Status check on mount (existing logic)
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      setStatusLoading(true);
      try {
        const config = { withCredentials: true };
        const res = await axios.get(
          `${API_URL}/api/compatibility/status`,
          config
        );
        if (!mounted) return;
        if (res?.data?.submitted) {
          setSubmitted(true);
          setMessage(
            "✅ You have already completed the compatibility form. Thanks!"
          );
        } else {
          setSubmitted(false);
          setMessage("");
        }
      } catch (err) {
        console.warn(
          "Compatibility status check failed, falling back to localStorage",
          err
        );
        const localFlag = localStorage.getItem("compatibilityFormSubmitted");
        if (localFlag === "true") {
          setSubmitted(true);
          setMessage(
            "✅ You have already completed the compatibility form (local)."
          );
        } else {
          setSubmitted(false);
          setMessage("");
        }
      } finally {
        if (mounted) setStatusLoading(false);
      }
    };

    checkStatus();
    return () => {
      mounted = false;
    };
  }, [API_URL]);

  // Keyboard navigation (works on renderedQuestions)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" && isAnswered && !isLastQuestion) {
        handleNext();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        handlePrevious();
      } else if (
        e.key >= "1" &&
        e.key <= "5" &&
        currentQuestion?.type === "text"
      ) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleAnswerChange(currentQuestion.id, optionIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, answers, currentQuestion]); // eslint-disable-line

  // Track time per section on unmount of section
  useEffect(() => {
    return () => {
      const sectionTime = Date.now() - sectionStartTime;
      setTimeSpent((prev) => ({
        ...prev,
        [`section_${currentSection}`]: sectionTime,
      }));
    };
  }, [currentSection, sectionStartTime]);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: parseInt(value, 10) }));

    // Auto-advance for non dealbreaker group (we auto-advance for any non dealbreaker_toggle)
    if (currentQuestion?.type !== "dealbreaker_toggle") {
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
          setSectionStartTime(Date.now());
        }
      }, 250);
    }
  };

  const handleDealbreakerChange = (name) => {
    setDealbreakers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setSectionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
      setSectionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    // Required questions still derive from original data model (text+bubble),
    // because those are what we expect answers for.
    const requiredQuestions = personalityQuestions.filter(
      (q) => q.type === "text" || q.type === "bubble"
    );
    const unanswered = requiredQuestions.filter((q) => !answers[q.id]);

    if (unanswered.length > 0) {
      setMessage(
        `⚠️ Please answer all questions (${unanswered.length} remaining)`
      );
      const firstUnanswered = personalityQuestions.findIndex(
        (q) => (q.type === "text" || q.type === "bubble") && !answers[q.id]
      );
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const payload = {
        answers,
        dealbreakers, // unchanged shape — backend unaffected
        timeSpent,
        totalTimeSpent: Date.now() - sectionStartTime,
        completedAt: new Date().toISOString(),
      };

      const config = {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      };

      await axios.post(`${API_URL}/api/compatibility/submit`, payload, config);
      await axios.post(
        `${API_URL}/api/personality/submit`,
        { answers },
        config
      );

      setMessage(
        "✅ Your answers have been saved. Generating your personality report..."
      );
      await axios.post(
        `${API_URL}/api/personality/generate-report`,
        {},
        config
      );
      setMessage("✅ Report generated! Redirecting...");

      localStorage.setItem("compatibilityFormSubmitted", "true");
      setSubmitted(true);

      setTimeout(() => navigate("/profileform"), 1200);
    } catch (err) {
      console.error("❌ Error details:", err.response?.data || err);
      setMessage("❌ Error saving answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isAnswered =
    currentQuestion?.type === "dealbreaker_toggle"
      ? true
      : answers[currentQuestion?.id] !== undefined;

  const questionVariants = {
    enter: { opacity: 0, y: 20, scale: 0.98 },
    center: { zIndex: 1, opacity: 1, y: 0, scale: 1 },
    exit: { zIndex: 0, opacity: 0, y: -20, scale: 0.98 },
  };

  const getSectionInfo = (section) => {
    const sectionNames = {
      1: { emoji: "⚡", title: "Welcome & Ready?" },
      2: { emoji: "💕", title: "Love & Relationships" },
      3: { emoji: "🎭", title: "Your Personality" },
      4: { emoji: "🚀", title: "Life & Goals" },
      5: { emoji: "💰", title: "Money Matters" },
      6: { emoji: "🔗", title: "Connection & Communication" },
      7: { emoji: "⚠️", title: "Final Compatibility Check" },
    };
    return sectionNames[section] || { emoji: "📋", title: "Questions" };
  };

  const sectionInfo = getSectionInfo(currentSection);

  const getFormatBadge = (type) => {
    const badges = {
      text: {
        label: "Multiple Choice",
        bg: "bg-blue-100",
        text: "text-blue-700",
      },
      bubble: {
        label: "Rate Yourself",
        bg: "bg-purple-100",
        text: "text-purple-700",
      },
      quick_poll: {
        label: "Quick Poll",
        bg: "bg-indigo-100",
        text: "text-indigo-700",
      },
      emoji_scale: {
        label: "Emoji Scale",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
      },
      dealbreaker_toggle: {
        label: "Deal Breaker",
        bg: "bg-red-100",
        text: "text-red-700",
      },
    };
    return badges[type] || badges.text;
  };

  const formatBadge = getFormatBadge(currentQuestion?.type);

  // --- Loading / submitted states UI (unchanged)
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
          <p className="text-sm text-gray-600 mt-2">
            Checking your submission status…
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ✅ You’ve already completed the compatibility form
          </h2>
          <p className="text-gray-600 mb-6">
            Thanks — your responses are saved. If you want to update them,
            contact support or use the profile page (if retake is allowed).
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/profileform")}
              className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg"
            >
              View Profile / Report
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("compatibilityFormSubmitted");
                setSubmitted(false);
                setMessage("");
              }}
              className="px-5 py-2 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Retake (clear local flag)
            </button>
          </div>
          {message && (
            <div className="mt-4 text-sm text-gray-500">{message}</div>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  // --- Main UI: works against renderedQuestions (so count reflects grouped dealbreaker)
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress placed slightly higher */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl">{sectionInfo.emoji}</span>
              <span className="font-semibold text-gray-700 text-sm md:text-base">
                {sectionInfo.title}
              </span>
            </div>
            <span className="font-semibold text-pink-600 text-sm">
              {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar moved up */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 min-h-[360px] md:min-h-[420px] max-h-[88vh] overflow-hidden flex flex-col justify-between">
          <div className="relative overflow-hidden flex-1 min-h-[220px] md:min-h-[320px]">
            <div className="h-full w-full overflow-auto md:overflow-hidden p-0 md:p-2">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={questionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.25, ease: "easeInOut" },
                    scale: { duration: 0.25, ease: "easeInOut" },
                  }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-3">
                    <span
                      className={`inline-block ${formatBadge.bg} ${formatBadge.text} text-xs font-semibold px-2 py-1 rounded-full`}
                    >
                      {formatBadge.label}
                    </span>
                  </div>

                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 leading-tight">
                    {currentQuestion.question}
                  </h2>

                  <div className="space-y-3 flex-1">
                    {/* TEXT OPTIONS */}
                    {currentQuestion.type === "text" && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, i) => {
                          const isSelected =
                            answers[currentQuestion.id] === i + 1;
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.06 * i + 0.08 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleAnswerChange(currentQuestion.id, i + 1)
                              }
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-pink-500 bg-pink-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-pink-300"
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-pink-500 bg-pink-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="3"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`text-sm md:text-base ${
                                    isSelected
                                      ? "text-pink-700 font-semibold"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span className="text-pink-400 font-bold mr-2 text-sm">
                                    {i + 1}.
                                  </span>
                                  {opt}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* BUBBLE SCALE with filled color + ring */}
                    {currentQuestion.type === "bubble" && (
                      <motion.div
                        className="pt-2 flex-1 flex flex-col justify-center"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: 0.06 } },
                        }}
                      >
                        <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center mb-4">
                          {[
                            "Strongly Agree",
                            "Agree",
                            "Neutral",
                            "Disagree",
                            "Strongly Disagree",
                          ].map((opt, i) => {
                            const isSelected =
                              answers[currentQuestion.id] === i + 1;
                            const colorSchemes = [
                              "bg-green-500 hover:bg-green-600 border-green-500",
                              "bg-green-400 hover:bg-green-500 border-green-400",
                              "bg-gray-400 hover:bg-gray-500 border-gray-400",
                              "bg-orange-400 hover:bg-orange-500 border-orange-400",
                              "bg-red-500 hover:bg-red-600 border-red-500",
                            ];
                            const bubbleSizes = [
                              "w-16 h-16 md:w-20 md:h-20",
                              "w-14 h-14 md:w-18 md:h-18",
                              "w-12 h-12 md:w-16 md:h-16",
                              "w-14 h-14 md:w-18 md:h-18",
                              "w-16 h-16 md:w-20 md:h-20",
                            ];
                            const bubbleLabels = ["SA", "A", "N", "D", "SD"];

                            const bubbleVariants = {
                              hidden: { opacity: 0, scale: 0.6 },
                              visible: {
                                opacity: 1,
                                scale: 1,
                                transition: {
                                  type: "spring",
                                  stiffness: 280,
                                  damping: 22,
                                },
                              },
                            };

                            return (
                              <motion.button
                                type="button"
                                key={i}
                                variants={bubbleVariants}
                                whileHover={{
                                  scale: 1.06,
                                  y: -4,
                                  transition: {
                                    type: "spring",
                                    stiffness: 300,
                                  },
                                }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() =>
                                  handleAnswerChange(currentQuestion.id, i + 1)
                                }
                                className={`flex items-center justify-center rounded-full border-4 transition-all duration-200 font-bold text-white ${
                                  bubbleSizes[i]
                                } ${colorSchemes[i]} ${
                                  isSelected
                                    ? "ring-4 ring-offset-2 ring-pink-400 scale-110 shadow-xl"
                                    : "opacity-80 hover:opacity-100 shadow-md"
                                }`}
                                title={opt}
                              >
                                {bubbleLabels[i]}
                              </motion.button>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs md:text-sm text-gray-600 px-2">
                          <span className="text-center">
                            Strongly
                            <br />
                            Agree
                          </span>
                          <span className="text-center">
                            Strongly
                            <br />
                            Disagree
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* QUICK POLL */}
                    {currentQuestion.type === "quick_poll" && (
                      <div className="space-y-2 pt-2">
                        {currentQuestion.options.map((opt, i) => {
                          const isSelected =
                            answers[currentQuestion.id] === i + 1;
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.06 * i + 0.06 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleAnswerChange(currentQuestion.id, i + 1)
                              }
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-sm md:text-base font-semibold ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50 shadow-sm text-indigo-700"
                                  : "border-gray-200 bg-white hover:border-indigo-300 text-gray-700"
                              }`}
                            >
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* EMOJI SCALE */}
                    {currentQuestion.type === "emoji_scale" && (
                      <div className="flex flex-col gap-4 pt-2">
                        {currentQuestion.options.map((option, i) => {
                          const isSelected =
                            answers[currentQuestion.id] === option.value;
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.06 * i + 0.06 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleAnswerChange(
                                  currentQuestion.id,
                                  option.value
                                )
                              }
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                                isSelected
                                  ? "border-yellow-500 bg-yellow-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-yellow-300"
                              }`}
                            >
                              <span className="text-2xl md:text-4xl">
                                {option.emoji}
                              </span>
                              <span
                                className={`text-sm md:text-lg font-semibold ${
                                  isSelected
                                    ? "text-yellow-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* GROUPED DEALBREAKERS: this renders only once (synthetic step) */}
                    {currentQuestion.type === "dealbreaker_toggle" && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm text-gray-600 mb-3">
                          Select any deal-breakers that apply. These are grouped
                          here so you can toggle them in one place.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {originalDealbreakers.map((db) => (
                            <label
                              key={db.id}
                              className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all border-2 border-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={!!dealbreakers[db.name]}
                                onChange={() =>
                                  handleDealbreakerChange(db.name)
                                }
                                className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                              />
                              <span className="ml-3 text-gray-700 text-sm">
                                {db.question}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                          (You can select multiple. Selections are stored in the
                          same <code>dealbreakers</code> object and submitted
                          unchanged to the backend.)
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Buttons */}
          <motion.div
            className="mt-4 flex items-center justify-between gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <motion.button
              whileHover={{ scale: currentIndex === 0 ? 1 : 1.03 }}
              whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Previous
            </motion.button>

            {!isLastQuestion ? (
              <motion.button
                whileHover={{ scale: isAnswered ? 1.03 : 1 }}
                whileTap={{ scale: isAnswered ? 0.96 : 1 }}
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isAnswered
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.96 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center text-sm">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Complete Quiz ✓"
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Message Alert */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-3 p-2 rounded-lg text-center text-sm font-medium ${
                  message.includes("✅")
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center text-xs text-gray-500 mt-4 space-y-1"
        >
          <p>
            💡 Use arrow keys to navigate | Press 1–5 for quick text selection
          </p>
          <p className="text-[11px]">
            {currentQuestion?.type === "emoji_scale" && "Click emoji to select"}
            {currentQuestion?.type === "quick_poll" &&
              "Tap any button to answer"}
            {currentQuestion?.type === "bubble" && "Tap bubble circles to rate"}
            {currentQuestion?.type === "dealbreaker_toggle" &&
              "Check boxes that matter to you"}
            {currentQuestion?.type === "text" && "Select an option to continue"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
