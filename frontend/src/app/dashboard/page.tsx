"use client"

import { SkeletonStatCard, SkeletonSchoolRow } from "@/components/shared/SkeletonCard"
import { useState, useEffect } from "react"
import {
    Upload, FileText, CheckCircle, AlertCircle,
    ArrowRight, School, Users, AlertTriangle, TrendingUp
} from "lucide-react"
import { useTranslations } from "@/lib/useTranslations"
import { ToastContainer } from "@/components/shared/Toast"
import { useToast } from "@/lib/useToast"
import AnimatedCounter from "@/components/shared/AnimatedCounter"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import DonutChart from "@/components/shared/DonutChart"


interface Stats {
    total_schools: number
    total_students: number
    high_risk: number
    medium_risk: number
    low_risk: number
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

interface ImpactStats {
    total_students: number
    high_risk_flagged: number
    interventions_logged: number
    students_actioned: number
    futures_saved: number
}

export default function DashboardPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState("")
    const [stats, setStats] = useState<Stats | null>(null)
    const [schools, setSchools] = useState<SchoolStat[]>([])
    const [statsLoading, setStatsLoading] = useState(true)
    const { toasts, toast, removeToast } = useToast()
    const [impact, setImpact] = useState<ImpactStats | null>(null)
    const [progress, setProgress] = useState<{ processed: number, total: number } | null>(null)
    const { t } = useTranslations()

    useEffect(() => {
        fetchStats()
        fetchImpact()
    }, [])

    const fetchStats = async () => {
        setStatsLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/schools/stats", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) { setStats(data.stats); setSchools(data.schools) }
        } catch { console.error("Could not fetch stats") }
        finally { setStatsLoading(false) }
    }

    const fetchImpact = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/schools/impact", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) setImpact(data)
        } catch { console.error("Could not fetch impact") }
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
        setUploading(true)
        setProgress({ processed: 0, total: 0 })
        setError("")
        toast.info("Uploading and processing student data...")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("http://localhost:5000/api/students/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message)
            }
            
            const reader = res.body?.getReader()
            if (!reader) throw new Error("No readable stream")
            
            const decoder = new TextDecoder()
            let buffer = ""
            let finalMessage = ""
            
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n")
                buffer = lines.pop() || ""
                
                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const data = JSON.parse(line)
                        if (data.processed !== undefined && data.total !== undefined) {
                            setProgress({ processed: data.processed, total: data.total })
                        }
                        if (data.done) {
                            finalMessage = data.message
                        }
                    } catch (e) {
                        // ignore unparseable json lines
                    }
                }
            }
            
            setUploaded(true)
            fetchStats()
            toast.success(`✓ ${finalMessage || "Uploaded successfully"}`)
        } catch (err: any) {
            setError(err.message || "Upload failed")
            toast.error("Upload failed. Please try again.")
        } finally {
            setUploading(false)
            setProgress(null)
        }
    }

    const statCards = [
        {
            icon: School,
            label: t.dashboard.schoolsMonitored,
            value: stats ? stats.total_schools : "—",
            sub: stats ? `${stats.total_students} ${t.dashboard.totalStudents}` : t.dashboard.uploadToSee,
            color: "var(--accent-blue)",
            href: "/dashboard/schools",
            glass: "blue",
        },
        {
            icon: AlertTriangle,
            label: t.dashboard.studentsAtRisk,
            value: stats ? stats.high_risk : "—",
            sub: stats ? t.dashboard.clickToView : t.dashboard.uploadToSee,
            color: "var(--accent-red)",
            href: "/dashboard/students?filter=high",
            glass: "red",
        },
        {
            icon: Users,
            label: t.dashboard.actionsPending,
            value: stats ? stats.pending_actions : "—",
            sub: stats ? t.dashboard.highNotActioned : t.dashboard.uploadToSee,
            color: "var(--accent-amber)",
            href: "/dashboard/students",
            glass: null,
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

            {/* Live Impact Banner */}
            {impact && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #4361EE15 0%, #2DC65315 50%, #4361EE10 100%)",
                            boxShadow: "var(--shadow-raised)",
                            borderRadius: "1.25rem",
                            padding: "1.5rem",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Decorative background circles */}
                        <div style={{
                            position: "absolute",
                            top: "-30px",
                            right: "-30px",
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            background: "var(--accent-blue)",
                            opacity: 0.05,
                        }} />
                        <div style={{
                            position: "absolute",
                            bottom: "-20px",
                            left: "20%",
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "var(--accent-green)",
                            opacity: 0.07,
                        }} />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="section-label mb-1">Live impact</p>
                                <p style={{
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.4,
                                    maxWidth: "420px",
                                }}>
                                    EduSight has flagged{" "}
                                    <span style={{ color: "var(--accent-red)", fontFamily: "'JetBrains Mono', monospace" }}>
                                        <AnimatedCounter value={impact.high_risk_flagged} duration={1500} />
                                    </span>
                                    {" "}at-risk students, logged{" "}
                                    <span style={{ color: "var(--accent-blue)", fontFamily: "'JetBrains Mono', monospace" }}>
                                        <AnimatedCounter value={impact.interventions_logged} duration={1500} />
                                    </span>
                                    {" "}interventions, and potentially saved{" "}
                                    <span style={{ color: "var(--accent-green)", fontFamily: "'JetBrains Mono', monospace" }}>
                                        <AnimatedCounter value={impact.futures_saved} duration={2000} />
                                    </span>
                                    {" "}educational futures.
                                </p>
                            </div>

                            <div
                                style={{
                                    flexShrink: 0,
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "1rem",
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                }}
                            >
                                🎓
                            </div>
                        </div>

                        {/* Mini stats row */}
                        <div
                            className="grid grid-cols-3 gap-3 mt-4 pt-4"
                            style={{ borderTop: "1px solid rgba(67, 97, 238, 0.1)" }}
                        >
                            {[
                                { label: "Students monitored", value: impact.total_students, color: "var(--accent-blue)" },
                                { label: "Actions taken", value: impact.students_actioned, color: "var(--accent-amber)" },
                                { label: "Futures saved", value: impact.futures_saved, color: "var(--accent-green)" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="glass-card"
                                    style={{ padding: "0.75rem", textAlign: "center" }}
                                >
                                    <p
                                        className="risk-score-display"
                                        style={{ fontSize: "1.5rem", color: item.color, lineHeight: 1 }}
                                    >
                                        <AnimatedCounter value={item.value} duration={1500} />
                                    </p>
                                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", fontWeight: 500 }}>
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stat cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {statsLoading ? (
                    [1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 16 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                            }}
                        >
                            <SkeletonStatCard />
                        </motion.div>
                    ))
                ) : (
                    statCards.map((card) => (
                        <motion.div
                            key={card.label}
                            variants={{
                                hidden: { opacity: 0, y: 16 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
                            }}
                            className={
                                card.glass === "blue"
                                    ? "glass-card"
                                    : card.glass === "red"
                                        ? "glass-card-red"
                                        : "stat-card"
                            }
                            style={{ padding: "1.5rem", cursor: "pointer", transition: "transform 0.2s ease" }}
                            onClick={() => window.location.href = card.href}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "0.75rem",
                                        background: card.glass
                                            ? "rgba(255,255,255,0.6)"
                                            : "var(--neu-bg)",
                                        boxShadow: card.glass
                                            ? "0 2px 8px rgba(0,0,0,0.08)"
                                            : "var(--shadow-raised-sm)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <card.icon size={16} style={{ color: card.color }} />
                                </div>
                                <ArrowRight size={14} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
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
                                {typeof card.value === "number" ? (
                                    <AnimatedCounter value={card.value} duration={1200} />
                                ) : card.value}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{card.sub}</p>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Risk Distribution Donut */}
            {stats && stats.total_students > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.5rem",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="section-label mb-1">Risk distribution</p>
                            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                                Student risk breakdown
                            </p>
                        </div>
                        <a
                            href="/dashboard/students"
                            style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 500, textDecoration: "none" }}
                        >
                            View all →
                        </a>
                    </div>
                    <DonutChart
                        high={stats.high_risk}
                        medium={stats.medium_risk}
                        low={stats.low_risk}
                        size={140}
                    />
                </motion.div>
            )
            }

            {/* School overview */}
            {
                schools.length > 0 && (
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
                            {statsLoading ? (
                                [1, 2, 3].map((i) => <SkeletonSchoolRow key={i} />)
                            ) : (
                                schools.map((school) => (
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
                                                    fontSize: "11px", padding: "3px 10px", borderRadius: "999px",
                                                    background: "var(--accent-red-light)", color: "var(--accent-red)", fontWeight: 600,
                                                }}>
                                                    {school.high} high
                                                </span>
                                            )}
                                            {school.medium > 0 && (
                                                <span style={{
                                                    fontSize: "11px", padding: "3px 10px", borderRadius: "999px",
                                                    background: "var(--accent-amber-light)", color: "var(--accent-amber)", fontWeight: 600,
                                                }}>
                                                    {school.medium} mid
                                                </span>
                                            )}
                                            {school.low > 0 && (
                                                <span style={{
                                                    fontSize: "11px", padding: "3px 10px", borderRadius: "999px",
                                                    background: "var(--accent-green-light)", color: "var(--accent-green)", fontWeight: 600,
                                                }}>
                                                    {school.low} low
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            }

            {/* Upload card */}
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
                            {uploading ? (progress && progress.total > 0 ? `Processing student ${progress.processed} of ${progress.total}...` : "Uploading...") : "Upload"}
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
                            onClick={() => router.push("/dashboard/students")}
                        >
                            {t.dashboard.viewScores} <ArrowRight size={13} />
                        </button>
                    </div>
                )}
            </div>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div >
    )
}