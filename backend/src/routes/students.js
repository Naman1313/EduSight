const router = require("express").Router()
const csv = require("csv-parser")
const axios = require("axios")
const Student = require("../models/Student")
const authMiddleware = require("../middleware/auth")
const { Readable } = require("stream")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })

router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().sort({ risk_score: -1 })
    res.json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const results = []
    const stream = Readable.from(req.file.buffer.toString())
    stream.pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        let saved = 0
        for (const row of results) {
          try {
            const mlRes = await axios.post(`${process.env.ML_API_URL}/predict`, {
              student_id: row.student_id,
              name: row.name,
              class_grade: row.class_grade,
              absences_this_month: parseInt(row.absences_this_month),
              absence_streak: parseInt(row.absence_streak),
              math_score: parseFloat(row.math_score),
              science_score: parseFloat(row.science_score),
              seasonal_flag: row.seasonal_flag === "True" || row.seasonal_flag === "true",
            })
            const { risk_score, risk_level, top_signals } = mlRes.data
            await Student.findOneAndUpdate(
              { student_id: row.student_id },
              {
                ...row,
                absences_this_month: parseInt(row.absences_this_month),
                absence_streak: parseInt(row.absence_streak),
                math_score: parseFloat(row.math_score),
                science_score: parseFloat(row.science_score),
                seasonal_flag: row.seasonal_flag === "True" || row.seasonal_flag === "true",
                risk_score,
                risk_level,
                top_signals,
              },
              { upsert: true, new: true }
            )
            saved++
          } catch (e) {
            console.error("Error processing student:", row.student_id, e.message)
          }
        }
        res.json({ message: `Processed ${saved} students successfully` })
      })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router