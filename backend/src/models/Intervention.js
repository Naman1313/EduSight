const mongoose = require("mongoose")

const interventionSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  student_name: String,
  school_name: String,
  risk_score: Number,
  risk_level: String,
  action_taken: String,
  actioned_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: String,
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
}, { timestamps: true })

module.exports = mongoose.model("Intervention", interventionSchema)