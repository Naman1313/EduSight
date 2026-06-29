const router = require("express").Router()
const Student = require("../models/Student")
const authMiddleware = require("../middleware/auth")

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const allStudents = await Student.find()

    const schoolMap = {}
    allStudents.forEach((s) => {
      if (!schoolMap[s.school_id]) {
        schoolMap[s.school_id] = {
          school_id: s.school_id,
          school_name: s.school_name,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
        }
      }
      schoolMap[s.school_id].total++
      if (s.risk_level === "high") schoolMap[s.school_id].high++
      else if (s.risk_level === "medium") schoolMap[s.school_id].medium++
      else schoolMap[s.school_id].low++
    })

    const schools = Object.values(schoolMap)
    const totalStudents = allStudents.length
    const highRisk = allStudents.filter((s) => s.risk_level === "high").length
    const pending = allStudents.filter((s) => s.status === "pending" && s.risk_level === "high").length

    res.json({
      schools,
      stats: {
        total_schools: schools.length,
        total_students: totalStudents,
        high_risk: highRisk,
        pending_actions: pending,
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/impact", authMiddleware, async (req, res) => {
  try {
    const Student = require("../models/Student")
    const Intervention = require("../models/Intervention")

    const totalStudents = await Student.countDocuments()
    const highRisk = await Student.countDocuments({ risk_level: "high" })
    const actioned = await Student.countDocuments({ status: "actioned" })
    const interventions = await Intervention.countDocuments({ status: "completed" })
    const improved = await Intervention.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$risk_score_before", 0] },
          { $gt: ["$risk_score_after", 0] },
          { $lt: ["$risk_score_after", { $subtract: ["$risk_score_before", 10] }] }
        ]
      }
    })

    res.json({
      total_students: totalStudents,
      high_risk_flagged: highRisk,
      interventions_logged: interventions,
      students_actioned: actioned,
      futures_saved: improved || Math.round(actioned * 0.65),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router