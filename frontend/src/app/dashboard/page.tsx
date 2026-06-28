"use client"

import { useState, useEffect } from "react"
import {
    Upload, FileText, CheckCircle, AlertCircle,
    ArrowRight, School, Users, AlertTriangle, TrendingUp
} from "lucide-react"
import { useTranslations } from "@/lib/useTranslations"

interface Stats {
    total_schools: number
    total_students: number
    high_risk: number
    pending_actions: number
}

interface SchoolStat {
    school_id: string
    school_name: string
    total: number
    high: number
    medium: number
    low: number
}

export default function DashboardPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState("")
    const [stats, setStats] = useState<Stats | null>(null)
    const [schools, setSchools] = useState<SchoolStat[]>([])
    const { t } = useTranslations()

    useEffect(() => { fetchStats() }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/schools/stats", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) { setStats(data.stats); setSchools(data.schools) }
        } catch { console.error("Could not fetch stats") }
    }

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) { setError("Only CSV files are supported."); return }
        setError(""); setFile(f)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true); setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("http://localhost:5000/api/students/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setUploaded(true); fetchStats()
        } catch (err: any) {
            setError(err.message || "Upload failed")
        } finally { setUploading(false) }
    }

    const statCards = [
        {
            icon: School,
            label: t.dashboard.schoolsMonitored,
            value: stats ? stats.total_schools : "—",
            sub: stats ? `${stats.total_students} ${t.dashboard.totalStudents}` : t.dashboard.uploadToSee,
            color: "var(--accent-blue)",
            href: "/dashboard/schools",
        },
        {
            icon: AlertTriangle,
            label: t.dashboard.studentsAtRisk,
            value: stats ? stats.high_risk : "—",
            sub: stats ? t.dashboard.clickToView : t.dashboard.uploadToSee,
            color: "var(--accent-red)",
            href: "/dashboard/students?filter=high",
        },
        {
            icon: Users,
            label: t.dashboard.actionsPending,
            value: stats ? stats.pending_actions : "—",
            sub: stats ? t.dashboard.highNotActioned : t.dashboard.uploadToSee,
            color: "var(--accent-amber)",
            href: "/dashboard/students",
        },
    ]

    return (
        <div className="space-y-8">

            {/* Page header */}
            <div>
                <p className="section-label mb-1">Block Education Dashboard</p>
                <h2 className="page-title">{t.dashboard.welcome}</h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {t.dashboard.subtitle}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="stat-card"
                        onClick={() => window.location.href = card.href}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "0.75rem",
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <card.icon size={16} style={{ color: card.color }} />
                            </div>
                            <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                            {card.label}
                        </p>
                        <p
                            className="risk-score-display"
                            style={{
                                fontSize: "2.25rem",
                                color: card.color,
                                lineHeight: 1.1,
                                margin: "4px 0",
                            }}
                        >
                            {card.value}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* School overview */}
            {schools.length > 0 && (
        <div
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--shadow-raised)",
            borderRadius: "1.25rem",
            padding: "1.5rem",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label">{t.dashboard.schoolOverview}</p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                {t.dashboard.riskBreakdown}
              </p>
            </div>
            <a
              href="/dashboard/schools"
              style={{
                fontSize: "12px",
                color: "var(--accent-blue)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {schools.map((school) => (
              <div
                key={school.school_id}
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                style={{ boxShadow: "var(--shadow-inset-sm)" }}
                onClick={() => window.location.href = `/dashboard/students?school=${school.school_id}`}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-raised-sm)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-inset-sm)"
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {school.school_name}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {school.total} students
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {school.high > 0 && (
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "var(--accent-red-light)",
                      color: "var(--accent-red)",
                      fontWeight: 600,
                    }}>
                      {school.high} high
                    </span>
                  )}
                  {school.medium > 0 && (
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "var(--accent-amber-light)",
                      color: "var(--accent-amber)",
                      fontWeight: 600,
                    }}>
                      {school.medium} mid
                    </span>
                  )}
                  {school.low > 0 && (
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "var(--accent-green-light)",
                      color: "var(--accent-green)",
                      fontWeight: 600,
                    }}>
                      {school.low} low
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
    )}

{/* Upload card */ }
<div
    style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--shadow-raised)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
    }}
>
    <p className="section-label mb-1">{t.dashboard.uploadTitle}</p>
    <p style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: "4px",
    }}>
        {t.dashboard.uploadSubtitle}
    </p>
    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
        Upload attendance CSV to generate AI-powered dropout risk scores for all students.
    </p>

    <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("csv-input")?.click()}
        style={{
            boxShadow: dragOver
                ? `inset 3px 3px 8px #C4CAD4, inset -3px -3px 8px #FFFFFF, inset 0 0 0 2px var(--accent-blue)`
                : "var(--shadow-inset)",
            borderRadius: "1rem",
            padding: "2.5rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: dragOver ? "var(--accent-blue-light)" : "var(--neu-bg)",
        }}
    >
        <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <div
            style={{
                width: "48px",
                height: "48px",
                borderRadius: "0.75rem",
                background: "var(--neu-bg)",
                boxShadow: "var(--shadow-raised-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
            }}
        >
            <Upload size={20} style={{ color: "var(--accent-blue)" }} />
        </div>
        <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
            {t.dashboard.dropCSV}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Supports: student_id, name, class, absences, marks columns
        </p>
    </div>

    {error && (
        <div
            className="flex items-center gap-2 mt-3 p-3 rounded-xl"
            style={{ background: "var(--accent-red-light)", color: "var(--accent-red)", fontSize: "13px" }}
        >
            <AlertCircle size={14} /> {error}
        </div>
    )}

    {file && !uploaded && (
        <div
            className="flex items-center justify-between mt-3 p-3 rounded-xl"
            style={{ boxShadow: "var(--shadow-inset-sm)" }}
        >
            <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {file.name}
                </span>
                <span style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "var(--accent-blue-light)",
                    color: "var(--accent-blue)",
                }}>
                    {(file.size / 1024).toFixed(1)} KB
                </span>
            </div>
            <button
                className="neu-btn-primary px-4 py-2"
                style={{ fontSize: "12px" }}
                onClick={handleUpload}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    )}

    {uploaded && (
        <div className="mt-3 space-y-3">
            <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: "var(--accent-green-light)", color: "var(--accent-green)", fontSize: "13px", fontWeight: 500 }}
            >
                <CheckCircle size={14} /> {t.dashboard.uploadSuccess}
            </div>
            <button
                className="neu-btn flex items-center gap-2 px-4 py-2"
                style={{ fontSize: "13px", color: "var(--accent-blue)" }}
                onClick={() => window.location.href = "/dashboard/students"}
            >
                {t.dashboard.viewScores} <ArrowRight size={13} />
            </button>
        </div>
    )}
</div>

    </div >
  )
}