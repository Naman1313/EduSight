const router = require("express").Router()
const Intervention = require("../models/Intervention")
const Student = require("../models/Student")
const authMiddleware = require("../middleware/auth")

router.get("/", authMiddleware, async (req, res) => {
  try {
    const interventions = await Intervention.find()
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(interventions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { student_id, action_taken, notes, status } = req.body
    const student = await Student.findById(student_id)
    if (!student) return res.status(404).json({ message: "Student not found" })

    const intervention = await Intervention.create({
      student_id,
      student_name: student.name,
      school_name: student.school_name,
      risk_score_before: student.risk_score,
      risk_level_before: student.risk_level,
      risk_score: student.risk_score,
      risk_level: student.risk_level,
      action_taken,
      actioned_by: req.user.id,
      notes,
      status: status || "completed",
    })

    await Student.findByIdAndUpdate(student_id, {
      status: "actioned",
      intervention_action: action_taken,
    })

    res.json(intervention)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const interventions = await Intervention.find({ status: "completed" })
    const total = interventions.length
    const successful = interventions.filter((i) => {
      if (!i.risk_score_after) return false
      return i.risk_score_after < i.risk_score_before - 10
    }).length
    const pending_followup = interventions.filter((i) => !i.risk_score_after).length
    const success_rate = total > 0
      ? Math.round((successful / (total - pending_followup || 1)) * 100)
      : 0

    const avg_score_before = total > 0
      ? Math.round(interventions.reduce((a, b) => a + (b.risk_score_before || 0), 0) / total)
      : 0

    const with_followup = interventions.filter((i) => i.risk_score_after)
    const avg_score_after = with_followup.length > 0
      ? Math.round(with_followup.reduce((a, b) => a + (b.risk_score_after || 0), 0) / with_followup.length)
      : 0

    res.json({
      total,
      successful,
      pending_followup,
      success_rate,
      avg_score_before,
      avg_score_after,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/:id/followup", authMiddleware, async (req, res) => {
  try {
    const { risk_score_after } = req.body
    const intervention = await Intervention.findByIdAndUpdate(
      req.params.id,
      {
        risk_score_after,
        followup_date: new Date(),
        status: "completed",
      },
      { new: true }
    )
    res.json(intervention)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/student/:student_id", authMiddleware, async (req, res) => {
  try {
    const interventions = await Intervention.find({
      student_id: req.params.student_id
    }).sort({ createdAt: -1 })
    res.json(interventions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router