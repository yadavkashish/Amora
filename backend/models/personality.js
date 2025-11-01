const mongoose = require("mongoose");

const personalitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // 35 personality test answers (values like 1–5)
  answers: {
    Q1:  { type: Number, required: true },
    Q2:  { type: Number, required: true },
    Q3:  { type: Number, required: true },
    Q4:  { type: Number, required: true },
    Q5:  { type: Number, required: true },
    Q6:  { type: Number, required: true },
    Q7:  { type: Number, required: true },
    Q8:  { type: Number, required: true },
    Q9:  { type: Number, required: true },
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
    Q24: { type: Number, required: true },
    Q25: { type: Number, required: true },
    Q26: { type: Number, required: true },
    Q27: { type: Number, required: true },
    Q28: { type: Number, required: true },
    Q29: { type: Number, required: true },
    Q30: { type: Number, required: true },
    Q31: { type: Number, required: true },
    Q32: { type: Number, required: true },
    Q33: { type: Number, required: true },
    Q34: { type: Number, required: true },
    Q35: { type: Number, required: true },
  },

  // Generated report after analysis
  report: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model("Personality", personalitySchema);
