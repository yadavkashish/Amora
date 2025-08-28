'use client';
import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';



const questions = [
  {
    id: "Q1",
    text: "In social situations, you usually:",
    options: [
      "Thrive on meeting new people and feel energized by it",
      "Enjoy small groups or familiar friends but not big crowds",
      "Prefer meaningful one-on-one conversations",
      "Feel drained by too much socializing and need alone time",
    ],
  },
  {
    id: "Q2",
    text: "When faced with something new (e.g., a hobby, food, culture), your reaction is:",
    options: [
      "Excited and eager to explore",
      "Curious but a bit cautious",
      "Only try if practical or necessary",
      "Prefer to stick with what I know",
    ],
  },
  {
    id: "Q3",
    text: "When emotions run high, you tend to:",
    options: [
      "Stay calm and rationalize",
      "Express emotions openly and seek comfort",
      "Keep feelings to yourself",
      "Feel overwhelmed and need time alone",
    ],
  },
  {
    id: "Q4",
    text: "When your partner doesn’t reply quickly, you usually:",
    options: [
      "Assume they’re busy",
      "Feel anxious and worry",
      "Withdraw emotionally",
      "Feel slightly concerned but regulate emotions",
    ],
  },
  {
    id: "Q5",
    text: "In a relationship, I feel most secure when:",
    options: [
      "We’re independent but emotionally connected",
      "My partner reassures me often",
      "My partner respects my independence",
      "My partner shows reliability",
    ],
  },
  {
    id: "Q6",
    text: "I feel most loved when my partner:",
    options: [
      "Gives me quality time",
      "Expresses love verbally",
      "Shows care through actions",
      "Gives thoughtful gifts",
      "Shows affection through touch",
    ],
  },
  {
    id: "Q7",
    text: "When I want to show love, I usually:",
    options: [
      "Plan experiences together",
      "Offer words of encouragement",
      "Help them with tasks",
      "Give thoughtful gifts",
      "Show physical affection",
    ],
  },
  {
    id: "Q8",
    text: "Career ambition to me is:",
    options: [
      "Top priority, want to achieve big goals",
      "Important but balanced with relationships",
      "Less important than family and happiness",
      "Not a major focus, prefer simple life",
    ],
  },
  {
    id: "Q9",
    text: "When thinking about family in the future:",
    options: [
      "Definitely want kids",
      "Might want kids depending on circumstances",
      "Don’t want kids but value partnership",
      "Unsure, open to discussion",
    ],
  },
  {
    id: "Q10",
    text: "How do you view financial lifestyle in a relationship?",
    options: [
      "Value financial security and planning",
      "Live in the moment but responsible",
      "Prefer modest/simple lifestyle",
      "Enjoy spending luxuriously",
    ],
  },
  {
    id: "Q11",
    text: "Spirituality or religion in my life is:",
    options: [
      "Central and must be shared",
      "Important but open to differences",
      "Respectful but not practicing",
      "Not important",
    ],
  },
  {
    id: "Q12",
    text: "During disagreements, I usually:",
    options: [
      "Stay calm and problem-solve",
      "Get emotional and need reassurance",
      "Withdraw to cool off",
      "Avoid confrontation",
    ],
  },
  {
    id: "Q13",
    text: "When stressed, I prefer my partner to:",
    options: [
      "Help logically solve it",
      "Comfort me emotionally",
      "Give me space",
      "Distract me with positivity",
    ],
  },
  {
    id: "Q14",
    text: "In a fight, what feels most damaging?",
    options: [
      "Criticism/harsh words",
      "Coldness/withdrawal",
      "Being ignored",
      "Repeating same arguments",
    ],
  },
  {
    id: "Q15",
    text: "On weekends, you’d most likely prefer:",
    options: [
      "Social events with friends",
      "Quality time with partner",
      "Relaxing at home",
      "Outdoor activities/travel",
    ],
  },
  {
    id: "Q16",
    text: "Which vacation appeals to you most?",
    options: [
      "Adventure trips",
      "Cultural trips",
      "Relaxing by the beach",
      "Luxury travel",
    ],
  },
  {
    id: "Q17",
    text: "What kind of hobbies excite you most?",
    options: [
      "Creative hobbies",
      "Physical activities",
      "Intellectual hobbies",
      "Social hobbies",
    ],
  },
  {
    id: "Q18",
    text: "For me, a serious relationship means:",
    options: [
      "Partnership leading to marriage",
      "Deep bond, not necessarily marriage",
      "Commitment with independence",
      "Flexible partnership without labels",
    ],
  },
  {
    id: "Q19",
    text: "My view on monogamy:",
    options: [
      "Strongly value exclusivity",
      "Prefer monogamy but open to discussion",
      "Don’t want strict exclusivity",
      "Open to ethical non-monogamy",
    ],
  },
  {
    id: "Q20",
    text: "What is your ideal way to build a relationship?",
    options: [
      "Start as friends, grow slowly",
      "Passion and romance quickly",
      "Take things slow and steady",
      "Intense all-in connection",
    ],
  },
  {
    id: "Q21",
    text: "How do you see household roles?",
    options: [
      "Shared equally",
      "Flexible by strengths",
      "Traditional roles",
      "Open to change",
    ],
  },
  {
    id: "Q22",
    text: "When I’m upset, I prefer my partner to:",
    options: [
      "Listen and give me space",
      "Reassure me with words",
      "Offer practical solutions",
      "Lighten the mood with humor",
    ],
  },
  {
    id: "Q23",
    text: "Which would most strengthen your bond?",
    options: [
      "Growing together through challenges",
      "Building shared traditions",
      "Supporting each other’s dreams",
      "Experiencing adventures together",
    ],
  },
];

export default function CompatibilityForm({ userId }) {
  const [answers, setAnswers] = useState({});
  const [dealbreakers, setDealbreakers] = useState({
    kids: false,
    monogamy: false,
    religion: false,
  });
  const [message, setMessage] = useState("");

  const handleAnswerChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: parseInt(value) });
  };

  const handleDealbreakerChange = (e) => {
    setDealbreakers({
      ...dealbreakers,
      [e.target.name]: e.target.checked,
    });
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/compatibility/submit",
        { answers, dealbreakers }, // ✅ no userId
        { withCredentials: true }  // ✅ send JWT cookie
      );
      setMessage("✅ Your answers have been saved!");
       navigate('/profileform');
    } catch (err) {
      console.error("❌ Error saving answers:", err.response?.data || err.message);
      setMessage("❌ Error saving answers");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Compatibility Quiz
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium mb-3">
              {idx + 1}. {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="block">
                  <input
                    type="radio"
                    name={q.id}
                    value={i + 1}
                    checked={answers[q.id] === i + 1}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Dealbreaker Section */}
        <div className="p-4 border rounded-lg bg-gray-100">
          <p className="font-medium mb-3">Dealbreakers (optional):</p>
          <label className="block">
            <input
              type="checkbox"
              name="kids"
              checked={dealbreakers.kids}
              onChange={handleDealbreakerChange}
              className="mr-2"
            />
            Must agree on having kids
          </label>
          <label className="block">
            <input
              type="checkbox"
              name="monogamy"
              checked={dealbreakers.monogamy}
              onChange={handleDealbreakerChange}
              className="mr-2"
            />
            Must agree on monogamy
          </label>
          <label className="block">
            <input
              type="checkbox"
              name="religion"
              checked={dealbreakers.religion}
              onChange={handleDealbreakerChange}
              className="mr-2"
            />
            Must agree on religion/spirituality
          </label>
        </div>

        <button
          type="submit"
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Submit
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
