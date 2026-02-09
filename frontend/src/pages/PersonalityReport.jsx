"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Chip,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
const MotionBox = motion(Box);

// Icons
import PsychologyIcon from "@mui/icons-material/Psychology";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import GroupsIcon from "@mui/icons-material/Groups";

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(12),
  background: "linear-gradient(to bottom right, #fce4ec, #f3e5f5, #e3f2fd)",
}));

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 4),
    borderRadius: "9999px",
    "&.Mui-selected": {
      background: "linear-gradient(to right, #ec4899, #a855f7)",
      color: "#fff",
      boxShadow: theme.shadows[4],
    },
    "&.Mui-focusVisible": {
      backgroundColor: "rgba(100, 95, 228, 0.12)",
    },
  })
);

const DetailedInsightCard = ({ icon, title, description, sections }) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 3, md: 4 },
      borderRadius: 6,
      background: "linear-gradient(to bottom right, #ffffff, #f9fafb)",
      borderLeft: "4px solid",
      borderImageSource: "linear-gradient(to bottom, #ec4899, #a855f7)",
      borderImageSlice: 1,
    }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      display="flex"
      alignItems="center"
      gap={2}
      mb={2}
    >
      {icon} {title}
    </Typography>
    <Typography color="text.secondary" lineHeight={1.7} mb={2}>
      {description || "No data available."}
    </Typography>
    {sections && (
      <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
        {sections.map((section, idx) => (
          <Chip key={idx} label={section} size="small" variant="outlined" />
        ))}
      </Box>
    )}
  </Paper>
);

// Enneagram type -> common name map
const ENNEAGRAM_NAMES = {
  1: "Type 1 — The Reformer",
  2: "Type 2 — The Helper",
  3: "Type 3 — The Achiever",
  4: "Type 4 — The Individualist",
  5: "Type 5 — The Investigator",
  6: "Type 6 — The Loyalist",
  7: "Type 7 — The Enthusiast",
  8: "Type 8 — The Challenger",
  9: "Type 9 — The Peacemaker",
};

export default function PersonalityReportDisplay() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/personality/my-report`, {
        withCredentials: true,
      });
      setReport(response.data.report);
    } catch (err) {
      if (
        err?.response?.status === 404 ||
        err?.response?.data?.code === "REPORT_NOT_GENERATED"
      ) {
        setError("Generate your personalized report");
      } else {
        setError(err?.response?.data?.error || "Failed to fetch report");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      await axios.post(
        `${API_URL}/api/personality/generate-report`,
        {},
        { withCredentials: true }
      );
      await fetchReport();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading || generating) {
    return (
      <GradientBackground
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 1, repeat: Infinity }}
            style={{
              height: 64,
              width: 64,
              border: "4px solid #fecdd3",
              borderTopColor: "#a855f7",
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
          />
          <Typography variant="h6" color="text.secondary">
            {generating
              ? "🤖 Generating your AI-powered personality report..."
              : "Loading your personality profile..."}
          </Typography>
          {generating && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              This will take 15-30 seconds.
            </Typography>
          )}
        </Box>
      </GradientBackground>
    );
  }

  if (!report && error) {
    return (
      <GradientBackground
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Paper
          elevation={12}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            maxWidth: "md",
            borderRadius: "24px",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            mb={2}
          >
            {error}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Complete the personality quiz and let our AI generate your unique,
            personalized report.
          </Typography>
          <button
            onClick={generateReport}
            disabled={generating}
            style={{
              background: "linear-gradient(to right, #ec4899, #a855f7)",
              color: "#fff",
              borderRadius: 12,
              padding: "12px 28px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {generating ? "Generating..." : "Generate Report"}
          </button>
        </Paper>
      </GradientBackground>
    );
  }

  if (!report) {
    return (
      <GradientBackground
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert severity="info">
          Please take the personality quiz to generate your report.
        </Alert>
      </GradientBackground>
    );
  }

  // Pull values with defensive fallbacks
  const { personalityProfile, detailedReport = {}, scores = {} } = report;

  // normalized nested fields (API-first). Provide tasteful dummy content when empty.
  const strengthsRaw =
    detailedReport?.detailedInsights?.strengths ??
    detailedReport?.detailedReport?.detailedInsights?.strengths ??
    report?.aiGeneratedReport?.strengths ??
    [];
  const developmentAreasRaw =
    detailedReport?.detailedInsights?.developmentAreas ??
    detailedReport?.detailedReport?.detailedInsights?.developmentAreas ??
    report?.aiGeneratedReport?.developmentAreas ??
    [];
  const conversationStartersRaw =
    detailedReport?.detailedReport?.conversationStarters ??
    report?.aiGeneratedReport?.conversationStarters ??
    [];
  const dateIdeasRaw =
    detailedReport?.detailedReport?.dateIdeas ??
    report?.aiGeneratedReport?.dateIdeas ??
    [];
  const actionItemsRaw =
    detailedReport?.actionItems ??
    detailedReport?.detailedReport?.actionItems ??
    report?.aiGeneratedReport?.actionItems ??
    [];
  const suggestedCareersRaw =
    detailedReport?.careerGuidance?.suggestedCareers ?? [];
  const careerSummaryRaw =
    detailedReport?.careerGuidance?.summary ??
    detailedReport?.careerGuidance?.workEnvironment ??
    "";

  // tasteful dummy defaults (only used when API returns no content)
  const DUMMY_STRENGTHS = [
    "Curious and open to new ideas",
    "Reliable — people trust you to follow through",
    "Good listener and emotionally present",
  ];
  const DUMMY_DEVELOPMENT = [
    "Practice saying 'no' to avoid overload",
    "Build a short daily planning ritual",
    "Allow time to recharge when stressed",
  ];
  const DUMMY_CONVERSATIONS = [
    "What small habit changed your life recently?",
    "What's a book or movie that surprised you?",
    "Tell me about one of your proudest moments.",
  ];
  const DUMMY_DATES = [
    {
      idea: "Coffee & a short museum visit",
      reason:
        "Casual, low-pressure way to connect and talk about shared interests.",
    },
    {
      idea: "Picnic at sunset",
      reason: "Quiet atmosphere for deeper conversation and relaxed vibes.",
    },
  ];
  const DUMMY_ACTIONS = [
    "Schedule 15 minutes daily reflection time.",
    "Share one appreciation with a close friend this week.",
  ];
  const DUMMY_CAREERS = [
    "Design, Content, Coaching",
    "Product, Research, Education",
  ];

  // Choose final arrays (prefer real data; otherwise use dummies)
  const strengths = strengthsRaw.length ? strengthsRaw : DUMMY_STRENGTHS;
  const developmentAreas = developmentAreasRaw.length
    ? developmentAreasRaw
    : DUMMY_DEVELOPMENT;
  const conversationStarters = conversationStartersRaw.length
    ? conversationStartersRaw
    : DUMMY_CONVERSATIONS;
  const dateIdeas = dateIdeasRaw.length ? dateIdeasRaw : DUMMY_DATES;
  const actionItems = actionItemsRaw.length ? actionItemsRaw : DUMMY_ACTIONS;
  const suggestedCareers = suggestedCareersRaw.length
    ? suggestedCareersRaw
    : DUMMY_CAREERS;
  const careerSummary =
    careerSummaryRaw ||
    "Profiles like yours do well in roles that value creativity, steady execution, and strong interpersonal skills.";

  // Enneagram: show name if available
  const enneType =
    detailedReport?.enneagramAnalysis?.type ??
    report?.enneagramType ??
    report?.aiGeneratedReport?.enneagramType ??
    null;

  const enneName =
    detailedReport?.enneagramAnalysis?.name ??
    (enneType ? ENNEAGRAM_NAMES[String(enneType)] ?? `Type ${enneType}` : null);

  const tabsConfig = [
    { label: "Overview", icon: <PersonIcon /> },
    { label: "Deep Insights", icon: <SearchIcon /> },
    { label: "Career", icon: <WorkIcon /> },
    { label: "Relationships", icon: <Diversity3Icon /> },
    { label: "Dating Guide", icon: <FavoriteIcon /> },
    { label: "Enneagram", icon: <MenuBookIcon /> },
  ];

  function getScoreLevel(score) {
    if (score > 75) return { label: "Very High", color: "#6d28d9" };
    if (score > 60) return { label: "High", color: "#8b5cf6" };
    if (score > 40) return { label: "Moderate", color: "#c084fc" };
    if (score > 25) return { label: "Low", color: "#f9a8d4" };
    return { label: "Very Low", color: "#fecdd3" };
  }

  const getScoreInterpretation = (dimension, score) => {
    const interpretations = {
      openness: {
        high: "Exceptionally open to new ideas and creative exploration.",
        low: "Values tradition and prefers proven methods.",
      },
      conscientiousness: {
        high: "Highly organized, disciplined, and goal-oriented.",
        low: "Prefers flexibility and spontaneity over strict planning.",
      },
      extraversion: {
        high: "Thrives in social settings, drawing energy from interaction.",
        low: "Introspective, preferring deep one-on-one connections.",
      },
      agreeableness: {
        high: "Empathetic, compassionate, and focused on others' wellbeing.",
        low: "Values honesty and authenticity, even if it causes friction.",
      },
      neuroticism: {
        high: "Experiences emotions deeply and is sensitive to stress.",
        low: "Emotionally resilient, stable, and recovers quickly.",
      },
    };
    const level = score > 50 ? "high" : "low";
    return (
      interpretations[dimension]?.[level] || "Understanding yourself better."
    );
  };

  return (
    <GradientBackground>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box textAlign="center" mb={6}>
            <p className="text-sm text-purple-600">
              ✨ Deeply personalized insights based on your unique psychology
            </p>
            {/* <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                            <Chip icon={<PsychologyIcon />} label="Psychology-Based" variant="outlined" sx={{ bgcolor: 'white' }} />
                            <Chip icon={<FavoriteIcon />} label="Dating Optimized" variant="outlined" sx={{ bgcolor: 'white' }} />
                            <Chip icon={<TrackChangesIcon />} label="AI Generated" variant="outlined" sx={{ bgcolor: 'white' }} />
                        </Box> */}
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, md: 8 },
              mb: 8,
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            }}
          >
            <Box textAlign="center" mb={6}>
              <Typography
                variant="h4"
                component="h2"
                fontWeight="bold"
                mb={1}
                sx={{
                  background: "linear-gradient(to right, #ec4899, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {detailedReport?.summary?.headline ?? "Your Personality"}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" mb={2}>
                {detailedReport?.summary?.tagline ?? ""}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                maxWidth="3xl"
                mx="auto"
                lineHeight={1.7}
              >
                {detailedReport?.summary?.description ??
                  "A concise summary of your personality will appear here once the report is available."}
              </Typography>
            </Box>

            <Box mt={6} pt={6} borderTop="2px solid" borderColor="grey.200">
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                mb={4}
                textAlign="center"
              >
                Your Big Five Personality Profile
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {Object.entries(scores ?? {}).length ? (
                  Object.entries(scores ?? {}).map(
                    ([dimension, score], index) => (
                      <Grid item xs={12} sm={4} md={2.4} key={dimension}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Box textAlign="center">
                            <Box
                              position="relative"
                              display="inline-flex"
                              justifyContent="center"
                              alignItems="center"
                              height={140}
                              width={140}
                              mb={2}
                              sx={{
                                transition: "transform 0.3s",
                                "&:hover": { transform: "scale(1.05)" },
                              }}
                            >
                              <svg
                                width="140"
                                height="140"
                                viewBox="0 0 160 160"
                                style={{ transform: "rotate(-90deg)" }}
                              >
                                <defs>
                                  <linearGradient
                                    id={`gradient-${dimension}`}
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                  >
                                    <stop offset="0%" stopColor="#ec4899" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                  </linearGradient>
                                </defs>
                                <circle
                                  cx="80"
                                  cy="80"
                                  r="70"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="10"
                                />
                                <motion.circle
                                  cx="80"
                                  cy="80"
                                  r="70"
                                  fill="none"
                                  stroke={`url(#gradient-${dimension})`}
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeDasharray={440}
                                  initial={{ strokeDashoffset: 440 }}
                                  animate={{
                                    strokeDashoffset:
                                      440 - ((score ?? 0) / 100) * 440,
                                  }}
                                  transition={{ duration: 1.2, delay: 0.15 }}
                                />
                              </svg>
                              <Box position="absolute" textAlign="center">
                                <Typography
                                  variant="h5"
                                  fontWeight="bold"
                                  color="text.primary"
                                >
                                  {Math.round(score ?? 0)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  / 100
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              variant="subtitle1"
                              textTransform="capitalize"
                              fontWeight="bold"
                            >
                              {dimension.replace(/([A-Z])/g, " $1").trim()}
                            </Typography>
                            <Chip
                              label={getScoreLevel(score ?? 0).label}
                              size="small"
                              sx={{
                                mt: 1,
                                mb: 1,
                                bgcolor: getScoreLevel(score ?? 0).color,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {getScoreInterpretation(dimension, score ?? 0)}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    )
                  )
                ) : (
                  // If scores absent, show a friendly placeholder
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="h6" fontWeight="bold">
                        No Big Five scores yet
                      </Typography>
                      <Typography color="text.secondary">
                        Complete the quiz to see your detailed Big Five
                        visualization.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </motion.div>

        <Box mb={4}>
          <Box
            display="flex"
            justifyContent="center"
            sx={{
              position: "sticky",
              top: 24,
              zIndex: 10,
              py: 2,
              background: "rgba(243, 239, 247, 0.8)",
              backdropFilter: "blur(6px)",
              borderRadius: "9999px",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Personality Report Tabs"
              TabIndicatorProps={{ style: { display: "none" } }}
            >
              {tabsConfig.map((tab, index) => (
                <StyledTab
                  key={index}
                  value={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  id={`report-tab-${index}`}
                  aria-controls={`report-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Box mt={2}>
              {activeTab === 0 && (
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Paper
                      elevation={4}
                      sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 6 }}
                    >
                      <Typography variant="h5" fontWeight="bold" mb={2}>
                        About You
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        lineHeight={1.7}
                      >
                        {detailedReport?.personalityNarrative ??
                          "We don't have a narrative yet — generate your report to see a full personalized narrative."}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderRadius: 6,
                        height: "100%",
                        background:
                          "linear-gradient(to bottom right, #f0fdf4, #dcfce7)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#14532d"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={2}
                      >
                        <CheckCircleOutlineIcon /> Your Strengths
                      </Typography>
                      <ul style={{ paddingLeft: 20 }}>
                        {strengths.map((s, i) => (
                          <li key={i}>
                            <Typography color="text.secondary" mb={1}>
                              {s}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderRadius: 6,
                        height: "100%",
                        background:
                          "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#1e3a8a"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={2}
                      >
                        <TrendingUpIcon /> Growth Areas
                      </Typography>
                      <ul style={{ paddingLeft: 20 }}>
                        {developmentAreas.map((a, i) => (
                          <li key={i}>
                            <Typography color="text.secondary" mb={1}>
                              {a}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <DetailedInsightCard
                      icon={<ChatBubbleOutlineIcon />}
                      title="Communication Style"
                      description={
                        detailedReport?.detailedInsights?.communicationStyle ??
                        "No specific communication notes available."
                      }
                      sections={[
                        "Expressive",
                        "Empathetic Listener",
                        "Adaptable Style",
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DetailedInsightCard
                      icon={<BoltIcon />}
                      title="Stress Response"
                      description={
                        detailedReport?.detailedInsights?.stressResponse ??
                        "No stress-response notes available."
                      }
                      sections={[
                        "Calm Under Pressure",
                        "Seeks Solutions",
                        "Needs Recharge Time",
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DetailedInsightCard
                      icon={<PublishedWithChangesIcon />}
                      title="Decision Making"
                      description={
                        detailedReport?.detailedInsights?.decisionMakingStyle ??
                        "No decision-making notes available."
                      }
                      sections={[
                        "Balances Logic & Emotion",
                        "Calculated Risks",
                        "Value-Driven",
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DetailedInsightCard
                      icon={<LeaderboardIcon />}
                      title="Work & Achievement"
                      description={
                        detailedReport?.detailedInsights?.workStyle ??
                        "No work-style notes available."
                      }
                      sections={[
                        "Collaborative",
                        "Goal-Oriented",
                        "Prefers Autonomy",
                      ]}
                    />
                  </Grid>
                </Grid>
              )}

              {activeTab === 2 && (
                <Paper
                  elevation={4}
                  sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 6 }}
                >
                  <Typography variant="h5" fontWeight="bold" mb={2}>
                    Career Guidance
                  </Typography>
                  <Typography color="text.secondary" mb={3} lineHeight={1.7}>
                    {careerSummary}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {suggestedCareers.map((c, i) => (
                      <Chip
                        key={i}
                        label={c}
                        sx={{
                          bgcolor: "#e0e7ff",
                          color: "#312e81",
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {activeTab === 3 && (
                <Paper
                  elevation={4}
                  sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 6 }}
                >
                  <Typography variant="h5" fontWeight="bold" mb={2}>
                    Relationship Insights
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DetailedInsightCard
                        icon={<QuestionAnswerIcon />}
                        title="Communication Needs"
                        description={
                          detailedReport?.relationshipInsights
                            ?.communicationNeeds ?? "No data."
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailedInsightCard
                        icon={<GroupsIcon />}
                        title="Conflict Style"
                        description={
                          detailedReport?.relationshipInsights?.conflictStyle ??
                          "No data."
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailedInsightCard
                        icon={<FavoriteIcon />}
                        title="Intimacy Preference"
                        description={
                          detailedReport?.relationshipInsights
                            ?.intimacyPreference ?? "No data."
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailedInsightCard
                        icon={<Diversity3Icon />}
                        title="Partner Compatibility"
                        description={
                          detailedReport?.relationshipInsights
                            ?.partnerCompatibility ?? "No data."
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {activeTab === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={7}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: { xs: 2.5, md: 4 },
                        borderRadius: 6,
                        background:
                          "linear-gradient(to bottom right, #fff1f2, #ffe4e6)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        mb={1}
                        color="#831843"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <FavoriteIcon /> Your Ideal Partner
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        lineHeight={1.7}
                      >
                        {detailedReport?.relationshipInsights
                          ?.idealPartnerProfile ??
                          "We don't have a specific ideal partner description yet — try generating the report for a tailored match profile."}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                    <Paper
                      elevation={4}
                      sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 6 }}
                    >
                      <Typography variant="h6" fontWeight="bold" mb={1}>
                        Conversation Starters
                      </Typography>
                      {conversationStarters.length ? (
                        <ul style={{ paddingLeft: 20 }}>
                          {conversationStarters.map((s, i) => (
                            <li key={i}>
                              <Typography color="text.secondary" mb={1}>
                                {s}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography color="text.secondary">
                          No conversation starters available.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      elevation={4}
                      sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 6 }}
                    >
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Ideal Date Ideas
                      </Typography>
                      {dateIdeas.length ? (
                        <Grid container spacing={2}>
                          {dateIdeas.map((date, idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                              <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 4 }}
                              >
                                <Typography fontWeight="bold">
                                  {date?.idea ?? date}
                                </Typography>
                                {date?.reason && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {date.reason}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography color="text.secondary">
                          No date ideas available.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 5 && (
                <Paper
                  elevation={4}
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 6,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" mb={2}>
                    Enneagram Analysis
                  </Typography>
                  <Box
                    sx={{
                      my: 3,
                      p: 2,
                      display: "inline-block",
                      background: "linear-gradient(to right, #fde68a, #f59e0b)",
                      borderRadius: "100%",
                      color: "#78350f",
                    }}
                  >
                    <Typography variant="h3" component="div" fontWeight="bold">
                      {enneType ?? "N/A"}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    {enneName ?? "Enneagram type not available"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    mb={2}
                  >
                    {detailedReport?.enneagramAnalysis?.description ??
                      "No additional description available for this Enneagram type."}
                  </Typography>
                  <Alert severity="info" icon={<MenuBookIcon />}>
                    The Enneagram is a powerful personality system describing
                    nine distinct types. Your type represents your core
                    motivation.
                  </Alert>
                </Paper>
              )}
            </Box>
          </motion.div>
        </AnimatePresence>

        <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            sx={{
              position: "sticky",
              top: 104,
              zIndex: 10,
              py: 2,
              // use theme spacing (pt: 12 ≈ 96px). Adjust pt / mt to taste.
              pt: 3, // padding-top
              pb: 4, // padding-bottom
              mt: 4, // margin-top to separate from above sections
              width: "100%",
              // ensure this block sits above sticky elements if needed
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 2.5,
                borderRadius: 4,
                background:
                  "linear-gradient(to bottom right, #f5f3ff, #ede9fe)",
                mt: 0, // keep paper margin-zero since wrapper handles spacing
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="#4c1d95"
                mb={1}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <TrackChangesIcon /> Your Personal Action Plan
              </Typography>
              <Typography color="#5b21b6" mb={2}>
                Actionable steps designed for your personality.
              </Typography>
              <Grid container spacing={2}>
                {actionItems.length ? (
                  actionItems.map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        <Chip label={idx + 1} color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                          {item}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">
                      No action items provided.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </MotionBox>

        <Box textAlign="center" my={6}>
          <Typography color="text.secondary" maxWidth="md" mx="auto">
            Your personality profile is your roadmap to better relationships and
            personal growth. Use these insights to understand yourself and
            others more deeply. 💫
          </Typography>
        </Box>
      </Container>
    </GradientBackground>
  );
}
