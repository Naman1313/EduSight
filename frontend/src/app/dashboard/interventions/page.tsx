"use client"

import { useEffect, useState } from "react"
import {
    ArrowLeft, CheckCircle, AlertTriangle,
    Users, TrendingDown, TrendingUp, Target
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts"
import AnimatedCounter from "@/components/shared/AnimatedCounter"

interface Intervention {
    _id: string
    student_name: string
    school_name: string
    risk_score: number
    risk_score_before: number
    risk_score_after?: number
    risk_level: string
    action_taken: string
    status: string
    createdAt: string
}

interface Stats {
    total: number
    successful: number
    pending_followup: number
    success_rate: number
    avg_score_before: number
    avg_score_after: number
}

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState<Intervention[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")
    const [followupId, setFollowupId] = useState<string | null>(null)
    const [followupScore, setFollowupScore] = useState("")
    const [savingFollowup, setSavingFollowup] = useState(false)

    useEffect(() => { fetchInterventions(); fetchStats() }, [])

    const fetchInterventions = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/interventions", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) setInterventions(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/interventions/stats", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) setStats(data)
        } catch (err) { console.error(err) }
    }

    const saveFollowup = async (id: string) => {
        if (!followupScore) return
        setSavingFollowup(true)
        try {
            await fetch(`http://localhost:5000/api/interventions/${id}/followup`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ risk_score_after: parseInt(followupScore) }),
            })
            setFollowupId(null); setFollowupScore("")
            fetchInterventions(); fetchStats()
        } catch (err) { console.error(err) }
        finally { setSavingFollowup(false) }
    }

    const filtered = interventions.filter((i) =>
        filter === "all" ? true : i.status === filter
    )

    const chartData = interventions
        .filter((i) => i.risk_score_before && i.risk_score_after)
        .map((i) => ({
            name: i.student_name.split(" ")[0],
            before: i.risk_score_before,
            after: i.risk_score_after,
        }))

    const statCards = [
        { icon: Users, label: "Total interventions", value: stats?.total ?? "—", color: "var(--accent-blue)" },
        { icon: Target, label: "Success rate", value: stats ? `${stats.success_rate}%` : "—", color: "var(--accent-green)", sub: "of followed-up cases" },
        { icon: TrendingDown, label: "Avg score before", value: stats?.avg_score_before ?? "—", color: "var(--accent-red)" },
        { icon: TrendingUp, label: "Avg score after", value: stats?.avg_score_after || "—", color: "var(--accent-green)", sub: stats?.pending_followup ? `${stats.pending_followup} awaiting follow-up` : "" },
    ]

    const getRiskColor = (level: string) => {
        if (level === "high") return { color: "var(--accent-red)", bg: "var(--accent-red-light)" }
        if (level === "medium") return { color: "var(--accent-amber)", bg: "var(--accent-amber-light)" }
        return { color: "var(--accent-green)", bg: "var(--accent-green-light)" }
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-3">
                <button className="neu-btn p-2" onClick={() => window.location.href = "/dashboard"}>
                    <ArrowLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <div>
                    <p className="section-label">Impact tracking</p>
                    <h2 className="page-title">Intervention Tracker</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        History and success rate of all actions taken
                    </p>
                </div>
            </div>

            {/* Stat cards */}
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
                            ) : typeof card.value === "string" && card.value.endsWith("%") ? (
                                <><AnimatedCounter value={parseInt(card.value)} duration={1000} />%</>
                            ) : card.value}
                        </p>
                        {card.sub && (
                            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                                {card.sub}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Before vs After chart */}
            {chartData.length > 0 && (
                <div
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.5rem",
                    }}
                >
                    <p className="section-label mb-1">Outcome analysis</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
                        Risk score: Before vs After intervention
                    </p>
                    <div style={{ height: "200px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,202,212,0.5)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--neu-bg)",
                                        boxShadow: "var(--shadow-raised-sm)",
                                        border: "none",
                                        borderRadius: "0.75rem",
                                        fontSize: "12px",
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                                <Line type="monotone" dataKey="before" stroke="var(--accent-red)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--accent-red)" }} name="Before" />
                                <Line type="monotone" dataKey="after" stroke="var(--accent-green)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--accent-green)" }} name="After" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(["all", "completed", "pending"] as const).map((f) => (
                    <button
                        key={f}
                        className={filter === f ? "neu-pressed" : "neu-btn"}
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "8px 16px",
                            color: filter === f ? "var(--accent-blue)" : "var(--text-muted)",
                            textTransform: "capitalize",
                        }}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading && (
                <div
                    className="text-center py-20"
                    style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem", color: "var(--text-muted)", fontSize: "14px" }}
                >
                    Loading interventions...
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div
                    className="text-center py-20"
                    style={{ boxShadow: "var(--shadow-inset)", borderRadius: "1.25rem" }}
                >
                    <AlertTriangle size={32} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No interventions recorded yet.</p>
                    <button
                        className="neu-btn px-4 py-2 mt-4"
                        style={{ fontSize: "12px", color: "var(--accent-blue)" }}
                        onClick={() => window.location.href = "/dashboard/students"}
                    >
                        Go to Students →
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="space-y-4">
                    {filtered.map((intervention) => {
                        const risk = getRiskColor(intervention.risk_level)
                        const improved = intervention.risk_score_after &&
                            intervention.risk_score_after < (intervention.risk_score_before ?? 100) - 10

                        return (
                            <div
                                key={intervention._id}
                                style={{
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised)",
                                    borderRadius: "1.25rem",
                                    padding: "1.25rem",
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                                                {intervention.student_name}
                                            </p>
                                            <span style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                padding: "3px 10px",
                                                borderRadius: "999px",
                                                background: risk.bg,
                                                color: risk.color,
                                            }}>
                                                {intervention.risk_level} risk
                                            </span>
                                        </div>

                                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            {intervention.school_name}
                                        </p>

                                        {/* Before / After scores */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="score-well"
                                                style={{ width: "56px", height: "56px" }}
                                            >
                                                <span className="risk-score-display" style={{ fontSize: "16px", color: "var(--accent-red)" }}>
                                                    {intervention.risk_score_before ?? intervention.risk_score}
                                                </span>
                                                <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>BEFORE</span>
                                            </div>

                                            <div style={{ flex: 1, height: "2px", background: "var(--neu-bg)", boxShadow: "var(--shadow-inset-sm)", borderRadius: "999px", position: "relative" }}>
                                                <span style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", fontSize: "12px", color: "var(--text-muted)" }}>→</span>
                                            </div>

                                            <div
                                                className="score-well"
                                                style={{ width: "56px", height: "56px" }}
                                            >
                                                <span className="risk-score-display" style={{
                                                    fontSize: "16px",
                                                    color: intervention.risk_score_after
                                                        ? improved ? "var(--accent-green)" : "var(--accent-amber)"
                                                        : "var(--text-muted)",
                                                }}>
                                                    {intervention.risk_score_after ?? "—"}
                                                </span>
                                                <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>AFTER</span>
                                            </div>

                                            {intervention.risk_score_after && (
                                                <span style={{
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    padding: "4px 10px",
                                                    borderRadius: "999px",
                                                    background: improved ? "var(--accent-green-light)" : "var(--accent-amber-light)",
                                                    color: improved ? "var(--accent-green)" : "var(--accent-amber)",
                                                }}>
                                                    {improved ? "✓ Improved" : "~ No change"}
                                                </span>
                                            )}
                                        </div>

                                        {intervention.action_taken && (
                                            <div
                                                style={{
                                                    boxShadow: "var(--shadow-inset-sm)",
                                                    borderRadius: "0.75rem",
                                                    padding: "0.75rem",
                                                }}
                                            >
                                                <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                                    Action taken
                                                </p>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                                    {(() => {
                                                        const text = intervention.action_taken;

                                                        // Fallback for simple manual text
                                                        if (!text.includes("IMMEDIATE") && text.length < 50) {
                                                            return <p>{text}</p>;
                                                        }

                                                        const verbMap: Record<string, string> = {
                                                            'conduct': 'Conducted', 'create': 'Created', 'enroll': 'Enrolled',
                                                            'check': 'Checked', 'schedule': 'Scheduled', 'arrange': 'Arranged',
                                                            'provide': 'Provided', 'assign': 'Assigned', 'monitor': 'Monitored',
                                                            'contact': 'Contacted', 'implement': 'Implemented', 'discuss': 'Discussed',
                                                            'ensure': 'Ensured', 'review': 'Reviewed', 'organize': 'Organized',
                                                            'initiate': 'Initiated', 'recommend': 'Recommended', 'start': 'Started',
                                                            'call': 'Called', 'meet': 'Met', 'assess': 'Assessed', 'coordinate': 'Coordinated',
                                                            'talk': 'Talked', 'follow': 'Followed', 'refer': 'Referred', 'evaluate': 'Evaluated',
                                                            'give': 'Gave', 'send': 'Sent', 'set': 'Set'
                                                        };

                                                        // If text is a single paragraph, split by periods
                                                        let lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                                                        if (lines.length <= 2 && lines[0].includes('. ')) {
                                                            lines = lines[0].split('. ').map(l => l.trim()).filter(Boolean);
                                                        }

                                                        const summaryLines: string[] = [];
                                                        let inEvidence = false;
                                                        for (const line of lines) {
                                                            const isHeader = line.startsWith("IMMEDIATE") ||
                                                                line.startsWith("MONITOR") ||
                                                                line.startsWith("LOW RISK") ||
                                                                line.startsWith("Key concerns") ||
                                                                line.startsWith("Recommended") ||
                                                                line.startsWith("Warning") ||
                                                                line.startsWith("Preventive");

                                                            if (line.toLowerCase().startsWith("evidence base")) {
                                                                inEvidence = true;
                                                            } else if (inEvidence && isHeader) {
                                                                inEvidence = false;
                                                            }

                                                            if (!inEvidence && !isHeader) {
                                                                let cleanLine = line.replace(/^\d+\.\s*/, '');
                                                                const match = cleanLine.match(/^([a-zA-Z]+)\b/);
                                                                if (match) {
                                                                    const firstWord = match[1].toLowerCase();
                                                                    if (verbMap[firstWord]) {
                                                                        cleanLine = cleanLine.replace(/^[a-zA-Z]+\b/, verbMap[firstWord]);
                                                                    }
                                                                }
                                                                if (!cleanLine.endsWith('.')) cleanLine += '.';
                                                                summaryLines.push(cleanLine);
                                                            }
                                                        }

                                                        if (summaryLines.length === 0) {
                                                            return <p>ACTION Taken for {intervention.student_name}</p>;
                                                        }

                                                        return (
                                                            <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", margin: "4px 0" }}>
                                                                {summaryLines.map((line, idx) => (
                                                                    <li key={idx} style={{ marginBottom: "4px" }}>{line}</li>
                                                                ))}
                                                            </ul>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {!intervention.risk_score_after && (
                                            followupId === intervention._id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="New risk score (0-100)"
                                                        value={followupScore}
                                                        onChange={(e) => setFollowupScore(e.target.value)}
                                                        className="neu-input"
                                                        style={{ padding: "8px 12px", fontSize: "13px", width: "180px" }}
                                                    />
                                                    <button
                                                        className="neu-btn-primary px-4 py-2"
                                                        style={{ fontSize: "12px" }}
                                                        onClick={() => saveFollowup(intervention._id)}
                                                        disabled={savingFollowup}
                                                    >
                                                        {savingFollowup ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        className="neu-btn px-3 py-2"
                                                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                                                        onClick={() => setFollowupId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="neu-btn px-4 py-2"
                                                    style={{ fontSize: "12px", color: "var(--accent-blue)" }}
                                                    onClick={() => setFollowupId(intervention._id)}
                                                >
                                                    + Add 30-day follow-up score
                                                </button>
                                            )
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span style={{
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            padding: "4px 10px",
                                            borderRadius: "999px",
                                            background: intervention.status === "completed"
                                                ? "var(--accent-green-light)"
                                                : "var(--accent-amber-light)",
                                            color: intervention.status === "completed"
                                                ? "var(--accent-green)"
                                                : "var(--accent-amber)",
                                        }}>
                                            {intervention.status}
                                        </span>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
                                            {formatDate(intervention.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}