const mongoose = require("mongoose");

const compatibilitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // 23 Answers (1–5 values usually, but depends on question)
  answers: {
    Q1: { type: Number, required: true },
    Q2: { type: Number, required: true },
    Q3: { type: Number, required: true },
    Q4: { type: Number, required: true },
    Q5: { type: Number, required: true },
    Q6: { type: Number, required: true },
    Q7: { type: Number, required: true },
    Q8: { type: Number, required: true },
    Q9: { type: Number, required: true },
    Q10: { type: Number, required: true },
    Q11: { type: Number, required: true },
    Q12: { type: Number, required: true },
    Q13: { type: Number, required: true },
    Q14: { type: Number, required: true },
    Q15: { type: Number, required: true },
    Q16: { type: Number, required: true },
    Q17: { type: Number, required: true },
    Q18: { type: Number, required: true },
    Q19: { type: Number, required: true },
    Q20: { type: Number, required: true },
    Q21: { type: Number, required: true },
    Q22: { type: Number, required: true },
    Q23: { type: Number, required: true },
  },

  // Dealbreaker preferences
  dealbreakers: {
    kids: { type: Boolean, default: false },
    monogamy: { type: Boolean, default: false },
    religion: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Compatibility", compatibilitySchema);
