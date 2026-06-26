const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors({ origin: "http://localhost:3000" }))
app.use(express.json())

app.use("/api/auth", require("./routes/auth"))
app.use("/api/students", require("./routes/students"))
app.use("/api/schools", require("./routes/schools"))

app.get("/", (req, res) => {
  res.json({ status: "EduSight Node API is running" })
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => console.error("MongoDB error:", err))