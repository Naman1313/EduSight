const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class_grade: String,
  school_id: String,
  school_name: String,
  absences_this_month: { type: Number, default: 0 },
  absence_streak: { type: Number, default: 0 },
  math_score: { type: Number, default: 0 },
  science_score: { type: Number, default: 0 },
  seasonal_flag: { type: Boolean, default: false },
  dropout_label: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  risk_level: { type: String, default: "low" },
  top_signals: [String],
  intervention_action: String,
  status: { type: String, enum: ["pending", "actioned"], default: "pending" },
}, { timestamps: true })

module.exports = mongoose.model("Student", studentSchema)