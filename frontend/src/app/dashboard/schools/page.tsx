"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, School, Users, AlertTriangle, CheckCircle } from "lucide-react"
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

export default function SchoolsPage() {
    const [schools, setSchools] = useState<SchoolStat[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

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
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "0.625rem",
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                <card.icon size={14} style={{ color: card.color }} />
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                                {card.label}
                            </p>
                            <p
                                className="risk-score-display"
                                style={{ fontSize: "2rem", color: card.color, lineHeight: 1.1, marginTop: "2px" }}
                            >
                                {typeof card.value === "number" ? (
                                    <AnimatedCounter value={card.value} duration={1000} />
                                ) : card.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div
                    className="text-center py-20"
                    style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem", color: "var(--text-muted)" }}
                >
                    Loading school data...
                </div>
            )}

            {!loading && schools.length === 0 && (
                <div
                    className="text-center py-20"
                    style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem", color: "var(--text-muted)" }}
                >
                    <School size={32} className="mx-auto mb-3 opacity-30" />
                    <p style={{ fontSize: "14px" }}>No school data found. Upload a CSV first.</p>
                </div>
            )}

            {!loading && schools.length > 0 && (
                <div className="space-y-4">
                    <p className="section-label">Schools in your block</p>
                    {schools.map((school) => {
                        const risk = getRiskLevel(school)
                        const highPct = Math.round((school.high / school.total) * 100)
                        const medPct = Math.round((school.medium / school.total) * 100)
                        const lowPct = Math.round((school.low / school.total) * 100)

                        return (
                            <div
                                key={school.school_id}
                                style={{
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised)",
                                    borderRadius: "1.25rem",
                                    padding: "1.25rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onClick={() => window.location.href = `/dashboard/students?school=${school.school_id}`}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
                                        ; (e.currentTarget as HTMLElement).style.boxShadow = "8px 8px 18px #C4CAD4, -8px -8px 18px #FFFFFF"
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                                        ; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-raised)"
                                }}
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "0.875rem",
                                                background: "var(--neu-bg)",
                                                boxShadow: "var(--shadow-inset-sm)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
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
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        padding: "4px 12px",
                                        borderRadius: "999px",
                                        background: risk.bg,
                                        color: risk.color,
                                        flexShrink: 0,
                                    }}>
                                        {risk.label}
                                    </span>
                                </div>

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
                                                    className="risk-bar-fill"
                                                    style={{ width: `${bar.pct}%`, background: bar.color }}
                                                />
                                            </div>
                                            <span style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: bar.color,
                                                width: "60px",
                                                textAlign: "right",
                                                flexShrink: 0,
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}>
                                                {bar.count} ({bar.pct}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className="flex items-center justify-between mt-4 pt-3"
                                    style={{ borderTop: "1px solid rgba(196,202,212,0.5)" }}
                                >
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                        Click to view all students →
                                    </span>
                                    {school.high > 0 && (
                                        <span style={{
                                            fontSize: "11px",
                                            color: "var(--accent-red)",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}>
                                            <AlertTriangle size={11} /> {school.high} need immediate action
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}