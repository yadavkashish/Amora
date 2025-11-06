import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { personalityQuestions } from "../data/personalityQuestions";

export default function CompatibilityForm() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dealbreakers, setDealbreakers] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [sectionStartTime, setSectionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Organize questions by section
  const questionsBySection = {};
  personalityQuestions.forEach((q) => {
    if (!questionsBySection[q.section]) {
      questionsBySection[q.section] = [];
    }
    questionsBySection[q.section].push(q);
  });

  const sections = Object.keys(questionsBySection)
    .map(Number)
    .sort((a, b) => a - b);
  const currentSection = personalityQuestions[currentIndex]?.section;
  const sectionQuestions = questionsBySection[currentSection] || [];
  const indexInSection = sectionQuestions.findIndex(
    (q) => q.id === personalityQuestions[currentIndex]?.id
  );

  const currentQuestion = personalityQuestions[currentIndex];
  const totalQuestions = personalityQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Keyboard navigation
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
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleAnswerChange(currentQuestion.id, optionIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, answers, currentQuestion]);

  // Track time per section
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
    setAnswers({ ...answers, [qId]: parseInt(value) });

    // Auto-advance for non-dealbreaker questions
    if (currentQuestion?.type !== "dealbreaker_toggle") {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setDirection(1);
          setCurrentIndex(currentIndex + 1);
          setSectionStartTime(Date.now());
        }
      }, 300);
    }
  };

  const handleDealbreakerChange = (name) => {
    setDealbreakers({
      ...dealbreakers,
      [name]: !dealbreakers[name],
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
      setSectionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
      setSectionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    // Only require text and bubble questions (not dealbreakers or toggles)
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
      setCurrentIndex(firstUnanswered);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const payload = {
        answers,
        dealbreakers,
        timeSpent,
        totalTimeSpent: Date.now() - sectionStartTime,
        completedAt: new Date().toISOString(),
      };

      // ✅ Make sure withCredentials is set
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      };


    // Save the answers for compatibility and personality
    await axios.post(`${API_URL}/api/compatibility/submit`, payload, config);
    await axios.post(`${API_URL}/api/personality/submit`, { answers }, config);

     setMessage("✅ Your answers have been saved. Generating your personality report...");

      // Now trigger the AI generation for the user's personality
    await axios.post(`${API_URL}/api/personality/generate-report`, {}, config);

    setMessage("✅ Report generated! Redirecting...");




      

      setTimeout(() => {
        navigate("/profileform");
      }, 1500);
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
    center: {
      zIndex: 1,
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
      y: -20,
      scale: 0.98,
    },
  };

  // Get section emoji and title
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

  // Get format badge info
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-23 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header with Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sectionInfo.emoji}</span>
              <span className="font-semibold text-gray-700">
                {sectionInfo.title}
              </span>
            </div>
            <span className="font-semibold text-pink-600">
              {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Section Progress */}
          <div className="text-xs text-gray-500 mt-2 text-center">
            Question {indexInSection + 1} of {sectionQuestions.length} in this
            section
          </div>
        </motion.div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
          <div className="relative overflow-hidden flex-1 min-h-[320px]">
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
                  opacity: { duration: 0.3, ease: "easeInOut" },
                  scale: { duration: 0.3, ease: "easeInOut" },
                }}
                className="h-full flex flex-col"
              >
                {/* Format Badge */}
                <div className="mb-6">
                  <span
                    className={`inline-block ${formatBadge.bg} ${formatBadge.text} text-xs font-semibold px-3 py-1 rounded-full`}
                  >
                    {formatBadge.label}
                  </span>
                </div>

                {/* Question Text */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">
                  {currentQuestion.question}
                </h2>

                {/* Options Container */}
                <div className="space-y-3 flex-1">
                  {/* TEXT OPTIONS */}
                  {currentQuestion.type === "text" && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((opt, i) => {
                        const isSelected =
                          answers[currentQuestion.id] === i + 1;
                        return (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i + 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleAnswerChange(currentQuestion.id, i + 1)
                            }
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-pink-500 bg-pink-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-pink-500 bg-pink-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </motion.svg>
                                )}
                              </div>
                              <span
                                className={`text-base md:text-lg ${
                                  isSelected
                                    ? "text-pink-700 font-semibold"
                                    : "text-gray-700"
                                }`}
                              >
                                <span className="text-pink-400 font-bold mr-2">
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

                  {/* BUBBLE SCALE */}
                  {currentQuestion.type === "bubble" && (
                    <motion.div
                      className="pt-4 flex-1 flex flex-col justify-center"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                          },
                        },
                      }}
                    >
                      <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center mb-6">
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
                            "w-20 h-20 md:w-24 md:h-24",
                            "w-16 h-16 md:w-20 md:h-20",
                            "w-14 h-14 md:w-16 md:h-16",
                            "w-16 h-16 md:w-20 md:h-20",
                            "w-20 h-20 md:w-24 md:h-24",
                          ];
                          const bubbleLabels = ["SA", "A", "N", "D", "SD"];

                          const bubbleVariants = {
                            hidden: { opacity: 0, scale: 0.5 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              },
                            },
                          };

                          return (
                            <motion.button
                              type="button"
                              key={i}
                              variants={bubbleVariants}
                              whileHover={{
                                scale: 1.1,
                                y: -5,
                                transition: { type: "spring", stiffness: 300 },
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleAnswerChange(currentQuestion.id, i + 1)
                              }
                              className={`flex items-center justify-center rounded-full border-4 transition-all duration-200 focus:outline-none font-bold text-white ${
                                bubbleSizes[i]
                              } ${colorSchemes[i]} ${
                                isSelected
                                  ? "ring-4 ring-offset-2 ring-pink-400 scale-110 shadow-xl"
                                  : "opacity-70 hover:opacity-100 shadow-lg"
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
                    <div className="space-y-3 pt-4">
                      {currentQuestion.options.map((opt, i) => {
                        const isSelected =
                          answers[currentQuestion.id] === i + 1;
                        return (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleAnswerChange(currentQuestion.id, i + 1)
                            }
                            className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-base md:text-lg font-semibold ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50 shadow-md text-indigo-700"
                                : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm text-gray-700"
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
                    <div className="flex flex-col gap-6 pt-4">
                      {currentQuestion.options.map((option, i) => {
                        const isSelected =
                          answers[currentQuestion.id] === option.value;
                        return (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i + 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleAnswerChange(
                                currentQuestion.id,
                                option.value
                              )
                            }
                            className={`w-full p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                              isSelected
                                ? "border-yellow-500 bg-yellow-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm"
                            }`}
                          >
                            <span className="text-4xl">{option.emoji}</span>
                            <span
                              className={`text-lg font-semibold ${
                                isSelected ? "text-yellow-700" : "text-gray-700"
                              }`}
                            >
                              {option.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* DEALBREAKER TOGGLE */}
                  {currentQuestion.type === "dealbreaker_toggle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="flex items-start p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border-2 border-gray-200">
                        <input
                          type="checkbox"
                          checked={dealbreakers[currentQuestion.name] || false}
                          onChange={() =>
                            handleDealbreakerChange(currentQuestion.name)
                          }
                          className="mt-1 w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                        />
                        <span className="ml-4 text-gray-700 text-base md:text-lg">
                          {currentQuestion.question}
                        </span>
                      </label>
                      <p className="text-center text-xs text-gray-500 mt-3">
                        (Select all that apply, or proceed without selection)
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <motion.div
            className="mt-8 flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: currentIndex === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Previous
            </motion.button>

            {!isLastQuestion ? (
              <motion.button
                whileHover={{ scale: isAnswered ? 1.05 : 1 }}
                whileTap={{ scale: isAnswered ? 0.95 : 1 }}
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  isAnswered
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      ></path>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-4 p-4 rounded-xl text-center font-medium ${
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
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-6 space-y-2"
        >
          <p>
            💡 Use arrow keys to navigate | Press 1-4 for quick text selection
          </p>
          <p className="text-xs">
            {currentQuestion.type === "emoji_scale" && "Click emoji to select"}
            {currentQuestion.type === "quick_poll" &&
              "Tap any button to answer"}
            {currentQuestion.type === "bubble" && "Tap bubble circles to rate"}
            {currentQuestion.type === "dealbreaker_toggle" &&
              "Check boxes that matter to you"}
            {currentQuestion.type === "text" && "Select an option to continue"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
