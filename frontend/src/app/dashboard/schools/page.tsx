"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, School, Users, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedCounter from "@/components/shared/AnimatedCounter"

interface SchoolStat {
    school_id: string
    school_name: string
    total: number
    high: number
    medium: number
    low: number
}

interface Stats {
    total_schools: number
    total_students: number
    high_risk: number
    pending_actions: number
}

interface ClassStat {
    class: string
    total: number
    high: number
    medium: number
    low: number
}

export default function SchoolsPage() {
    const [schools, setSchools] = useState<SchoolStat[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedSchool, setExpandedSchool] = useState<string | null>(null)
    const [classData, setClassData] = useState<Record<string, ClassStat[]>>({})
    const [loadingClass, setLoadingClass] = useState<string | null>(null)

    useEffect(() => { fetchSchools() }, [])

    const fetchSchools = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/schools/stats", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) { setSchools(data.schools); setStats(data.stats) }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchClassData = async (schoolId: string) => {
        if (classData[schoolId]) return
        setLoadingClass(schoolId)
        try {
            const res = await fetch(
                `http://localhost:5000/api/schools/classwise/${schoolId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            const data = await res.json()
            if (res.ok) setClassData((prev) => ({ ...prev, [schoolId]: data }))
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingClass(null)
        }
    }

    const toggleExpand = (schoolId: string) => {
        if (expandedSchool === schoolId) {
            setExpandedSchool(null)
        } else {
            setExpandedSchool(schoolId)
            fetchClassData(schoolId)
        }
    }

    const getRiskLevel = (school: SchoolStat) => {
        const pct = (school.high / school.total) * 100
        if (pct >= 30) return { label: "Critical", color: "var(--accent-red)", bg: "var(--accent-red-light)" }
        if (pct >= 15) return { label: "Needs attention", color: "var(--accent-amber)", bg: "var(--accent-amber-light)" }
        return { label: "Stable", color: "var(--accent-green)", bg: "var(--accent-green-light)" }
    }

    const statCards = [
        { icon: School, label: "Total schools", value: stats?.total_schools ?? "—", color: "var(--accent-blue)" },
        { icon: Users, label: "Total students", value: stats?.total_students ?? "—", color: "var(--accent-blue)" },
        { icon: AlertTriangle, label: "High risk", value: stats?.high_risk ?? "—", color: "var(--accent-red)" },
        { icon: CheckCircle, label: "Actions pending", value: stats?.pending_actions ?? "—", color: "var(--accent-amber)" },
    ]

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-3">
                <button className="neu-btn p-2" onClick={() => window.location.href = "/dashboard"}>
                    <ArrowLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <div>
                    <p className="section-label">Block overview</p>
                    <h2 className="page-title">School Overview</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Block-level dropout risk across all monitored schools
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div key={card.label} className="stat-card">
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "0.625rem",
                                background: "var(--neu-bg)", boxShadow: "var(--shadow-raised-sm)",
                                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px",
                            }}>
                                <card.icon size={14} style={{ color: card.color }} />
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{card.label}</p>
                            <p className="risk-score-display" style={{ fontSize: "2rem", color: card.color, lineHeight: 1.1, marginTop: "2px" }}>
                                {typeof card.value === "number"
                                    ? <AnimatedCounter value={card.value} duration={1000} />
                                    : card.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem", padding: "5rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading school data...
                </div>
            )}

            {!loading && schools.length === 0 && (
                <div style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem", padding: "5rem", textAlign: "center" }}>
                    <School size={32} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No school data found. Upload a CSV first.</p>
                </div>
            )}

            {!loading && schools.length > 0 && (
                <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    <p className="section-label">Schools in your block</p>

                    {schools.map((school) => {
                        const risk = getRiskLevel(school)
                        const highPct = Math.round((school.high / school.total) * 100)
                        const medPct = Math.round((school.medium / school.total) * 100)
                        const lowPct = Math.round((school.low / school.total) * 100)
                        const isExpanded = expandedSchool === school.school_id
                        const classes = classData[school.school_id] || []

                        return (
                            <motion.div
                                key={school.school_id}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
                                }}
                                style={{
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised)",
                                    borderRadius: "1.25rem",
                                    overflow: "hidden",
                                }}
                            >
                                {/* School header - clickable to view students */}
                                <div
                                    style={{ padding: "1.25rem", cursor: "pointer" }}
                                    onClick={() => window.location.href = `/dashboard/students?school=${school.school_id}`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                width: "44px", height: "44px", borderRadius: "0.875rem",
                                                background: "var(--neu-bg)", boxShadow: "var(--shadow-inset-sm)",
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                            }}>
                                                <School size={20} style={{ color: "var(--accent-blue)" }} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>
                                                    {school.school_name}
                                                </p>
                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                    {school.total} students enrolled
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: "11px", fontWeight: 600, padding: "4px 12px",
                                            borderRadius: "999px", background: risk.bg, color: risk.color, flexShrink: 0,
                                        }}>
                                            {risk.label}
                                        </span>
                                    </div>

                                    {/* Risk bars */}
                                    <div className="space-y-2">
                                        {[
                                            { label: "High risk", count: school.high, pct: highPct, color: "var(--accent-red)" },
                                            { label: "Medium", count: school.medium, pct: medPct, color: "var(--accent-amber)" },
                                            { label: "Low risk", count: school.low, pct: lowPct, color: "var(--accent-green)" },
                                        ].map((bar) => (
                                            <div key={bar.label} className="flex items-center gap-3">
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "60px", flexShrink: 0 }}>
                                                    {bar.label}
                                                </span>
                                                <div className="risk-bar-track flex-1">
                                                    <div
                                                        className="risk-bar-fill-animated"
                                                        style={{
                                                            "--bar-width": `${bar.pct}%`,
                                                            background: bar.color,
                                                        } as React.CSSProperties}
                                                    />
                                                </div>
                                                <span style={{
                                                    fontSize: "11px", fontWeight: 600, color: bar.color,
                                                    width: "60px", textAlign: "right", flexShrink: 0,
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                }}>
                                                    {bar.count} ({bar.pct}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Class-wise toggle button */}
                                <div
                                    style={{
                                        borderTop: "1px solid rgba(107, 122, 153, 0.15)",
                                        padding: "0.75rem 1.25rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                    }}
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(school.school_id) }}
                                >
                                    <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                                        {isExpanded ? "Hide class-wise breakdown" : "View class-wise breakdown"}
                                    </span>
                                    <div style={{
                                        background: "var(--neu-bg)",
                                        boxShadow: "var(--shadow-raised-sm)",
                                        borderRadius: "0.5rem",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                        {isExpanded
                                            ? <ChevronUp size={14} style={{ color: "var(--accent-blue)" }} />
                                            : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                                        }
                                    </div>
                                </div>

                                {/* Class-wise breakdown */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <div style={{ padding: "0 1.25rem 1.25rem" }}>
                                                <p className="section-label mb-3">Class-wise risk breakdown</p>

                                                {loadingClass === school.school_id && (
                                                    <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)", fontSize: "13px" }}>
                                                        Loading class data...
                                                    </div>
                                                )}

                                                {classes.length > 0 && (
                                                    <div className="space-y-3">
                                                        {classes.map((cls) => {
                                                            const clsHighPct = Math.round((cls.high / cls.total) * 100)
                                                            const clsMedPct = Math.round((cls.medium / cls.total) * 100)
                                                            const clsLowPct = Math.round((cls.low / cls.total) * 100)
                                                            const dominantRisk = cls.high > cls.medium && cls.high > cls.low
                                                                ? { color: "var(--accent-red)", label: "High risk dominant" }
                                                                : cls.medium > cls.low
                                                                    ? { color: "var(--accent-amber)", label: "Medium risk dominant" }
                                                                    : { color: "var(--accent-green)", label: "Mostly safe" }

                                                            return (
                                                                <div
                                                                    key={cls.class}
                                                                    style={{
                                                                        boxShadow: "var(--shadow-inset-sm)",
                                                                        borderRadius: "0.875rem",
                                                                        padding: "0.875rem",
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div style={{
                                                                                width: "28px", height: "28px", borderRadius: "0.5rem",
                                                                                background: "var(--neu-bg)", boxShadow: "var(--shadow-raised-sm)",
                                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                            }}>
                                                                                <span style={{ fontSize: "11px", fontWeight: 700, color: dominantRisk.color }}>
                                                                                    {cls.class.replace("Class ", "")}
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                                                                    {cls.class}
                                                                                </p>
                                                                                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                                                                                    {cls.total} students
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span style={{
                                                                            fontSize: "10px", fontWeight: 600,
                                                                            color: dominantRisk.color,
                                                                        }}>
                                                                            {dominantRisk.label}
                                                                        </span>
                                                                    </div>

                                                                    {/* Mini stacked bar */}
                                                                    <div className="flex rounded-full overflow-hidden" style={{ height: "6px", gap: "1px" }}>
                                                                        {clsHighPct > 0 && (
                                                                            <div style={{
                                                                                width: `${clsHighPct}%`, background: "var(--accent-red)",
                                                                                boxShadow: "0 0 4px var(--accent-red)",
                                                                                transition: "width 0.8s ease",
                                                                            }} />
                                                                        )}
                                                                        {clsMedPct > 0 && (
                                                                            <div style={{
                                                                                width: `${clsMedPct}%`, background: "var(--accent-amber)",
                                                                                transition: "width 0.8s ease",
                                                                            }} />
                                                                        )}
                                                                        {clsLowPct > 0 && (
                                                                            <div style={{
                                                                                width: `${clsLowPct}%`, background: "var(--accent-green)",
                                                                                transition: "width 0.8s ease",
                                                                            }} />
                                                                        )}
                                                                    </div>

                                                                    {/* Counts */}
                                                                    <div className="flex justify-between mt-2">
                                                                        <span style={{ fontSize: "10px", color: "var(--accent-red)", fontFamily: "'JetBrains Mono', monospace" }}>
                                                                            {cls.high} high
                                                                        </span>
                                                                        <span style={{ fontSize: "10px", color: "var(--accent-amber)", fontFamily: "'JetBrains Mono', monospace" }}>
                                                                            {cls.medium} med
                                                                        </span>
                                                                        <span style={{ fontSize: "10px", color: "var(--accent-green)", fontFamily: "'JetBrains Mono', monospace" }}>
                                                                            {cls.low} low
                                                                        </span>
                                                                        <button
                                                                            style={{
                                                                                fontSize: "10px", color: "var(--accent-blue)",
                                                                                background: "none", border: "none", cursor: "pointer",
                                                                                fontWeight: 600,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                window.location.href = `/dashboard/students?school=${school.school_id}`
                                                                            }}
                                                                        >
                                                                            View →
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        )
                    })}
                </motion.div>
            )}

        </div>
    )
}