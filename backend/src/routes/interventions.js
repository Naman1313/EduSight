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