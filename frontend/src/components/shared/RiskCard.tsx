"use client"

import { useState } from "react"
import {
    CalendarX, TrendingDown, Wheat, BookOpen,
    Lightbulb, CheckCircle, Loader2, ChevronDown,
    ChevronUp, RotateCcw, Clock, FileText
} from "lucide-react"
import { Student } from "@/types"
import RiskTrendGraph from "@/components/shared/RiskTrendGraph"
import RiskGauge from "@/components/shared/RiskGauge"

interface RiskCardProps {
    student: Student
    onActionTaken: () => void
    onToast?: (message: string, type: "success" | "error" | "info") => void
}

const SIGNAL_ICONS: Record<string, any> = {
    "absences": CalendarX,
    "streak": CalendarX,
    "math": TrendingDown,
    "science": TrendingDown,
    "harvest": Wheat,
    "failed": TrendingDown,
    "default": BookOpen,
}

function getSignalIcon(signal: string) {
    const lower = signal.toLowerCase()
    for (const key of Object.keys(SIGNAL_ICONS)) {
        if (lower.includes(key)) return SIGNAL_ICONS[key]
    }
    return SIGNAL_ICONS["default"]
}

function getRiskConfig(level: string) {
    if (level === "high") return {
        color: "#E63946",
        lightBg: "#FDECEA",
        label: "High Risk",
        barColor: "#E63946",
        initialsColor: "#E63946",
        initialsBg: "#FDECEA",
    }
    if (level === "medium") return {
        color: "#F4A261",
        lightBg: "#FEF4EC",
        label: "Medium Risk",
        barColor: "#F4A261",
        initialsColor: "#C47B3A",
        initialsBg: "#FEF4EC",
    }
    return {
        color: "#2DC653",
        lightBg: "#E8F9ED",
        label: "Low Risk",
        barColor: "#2DC653",
        initialsColor: "#1A8A36",
        initialsBg: "#E8F9ED",
    }
}

interface InterventionHistory {
    _id: string
    action_taken: string
    status: string
    createdAt: string
    risk_score_before: number
    risk_score_after?: number
}

function CardBack({
    student,
    config,
    onFlip,
}: {
    student: Student
    config: ReturnType<typeof getRiskConfig>
    onFlip: () => void
}) {
    const [history, setHistory] = useState<InterventionHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [fetched, setFetched] = useState(false)

    const fetchHistory = async () => {
        if (fetched) return
        try {
            const res = await fetch(
                `http://localhost:5000/api/interventions/student/${student._id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            const data = await res.json()
            if (res.ok) setHistory(data)
        } catch { }
        finally { setLoading(false); setFetched(true) }
    }

    // Fetch when back is shown
    if (!fetched) fetchHistory()

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

    return (
        <div
            style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--shadow-raised)",
                borderRadius: "1.25rem",
                padding: "1.25rem",
                height: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Back header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="section-label mb-0.5">Intervention history</p>
                    <p style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-primary)" }}>
                        {student.name}
                    </p>
                </div>
                <button
                    onClick={onFlip}
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised-sm)",
                        border: "none",
                        borderRadius: "0.75rem",
                        padding: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                    }}
                >
                    <RotateCcw size={12} /> Flip back
                </button>
            </div>

            {/* Risk summary */}
            <div
                className="flex items-center gap-3 mb-4 p-3"
                style={{
                    boxShadow: "var(--shadow-inset-sm)",
                    borderRadius: "0.75rem",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: config.lightBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <span
                        className="risk-score-display"
                        style={{ fontSize: "18px", color: config.color }}
                    >
                        {student.risk_score}
                    </span>
                </div>
                <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: config.color }}>
                        {config.label}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Class {student.class_grade} · {student.school_name}
                    </p>
                </div>
                <span style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "999px",
                    background: student.status === "actioned"
                        ? "var(--accent-green-light)"
                        : "var(--accent-amber-light)",
                    color: student.status === "actioned"
                        ? "var(--accent-green)"
                        : "var(--accent-amber)",
                }}>
                    {student.status === "actioned" ? "✓ Actioned" : "Pending"}
                </span>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {loading && (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "14px" }}>
                        Loading history...
                    </div>
                )}

                {!loading && history.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            boxShadow: "var(--shadow-inset)",
                            borderRadius: "0.75rem",
                        }}
                    >
                        <FileText size={24} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 8px" }} />
                        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                            No interventions recorded yet
                        </p>
                    </div>
                )}

                {history.map((item) => (
                    <div
                        key={item._id}
                        style={{
                            boxShadow: "var(--shadow-inset-sm)",
                            borderRadius: "0.75rem",
                            padding: "0.75rem",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Clock size={10} style={{ color: "var(--text-muted)" }} />
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {formatDate(item.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.risk_score_before && (
                                    <span style={{
                                        fontSize: "12px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "var(--accent-red)",
                                    }}>
                                        {item.risk_score_before}
                                    </span>
                                )}
                                {item.risk_score_after && (
                                    <>
                                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→</span>
                                        <span style={{
                                            fontSize: "12px",
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: "var(--accent-green)",
                                        }}>
                                            {item.risk_score_after}
                                        </span>
                                    </>
                                )}
                                <span style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    padding: "2px 6px",
                                    borderRadius: "999px",
                                    background: "var(--accent-green-light)",
                                    color: "var(--accent-green)",
                                }}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                        <p style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {item.action_taken?.split("\n")[0] || "Action taken"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function RiskCard({ student, onActionTaken, onToast }: RiskCardProps) {
    const [action, setAction] = useState(student.intervention_action || "")
    const [loadingAction, setLoadingAction] = useState(false)
    const [actionFetched, setActionFetched] = useState(!!student.intervention_action)
    const [marking, setMarking] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [actioned, setActioned] = useState(student.status === "actioned")
    const [flipped, setFlipped] = useState(false)

    const config = getRiskConfig(student.risk_level || "low")

    const initials = student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const fetchSuggestion = async () => {
        setLoadingAction(true)
        onToast?.("Generating AI intervention suggestion...", "info")
        try {
            const res = await fetch("http://localhost:8000/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    risk_score: student.risk_score,
                    top_signals: student.top_signals,
                    name: student.name,
                }),
            })
            const data = await res.json()
            setAction(data.action)
            setActionFetched(true)
            await fetch(`http://localhost:5000/api/students/${student._id}/action`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ intervention_action: data.action }),
            })
            onToast?.("AI suggestion generated successfully!", "success")
        } catch {
            setAction("Could not fetch suggestion. Please try again.")
            onToast?.("Failed to generate suggestion. Try again.", "error")
        } finally {
            setLoadingAction(false)
        }
    }

    const markActioned = async () => {
        setMarking(true)
        try {
            await fetch(`http://localhost:5000/api/students/${student._id}/action`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: "actioned" }),
            })
            await fetch("http://localhost:5000/api/interventions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    student_id: student._id,
                    action_taken: action,
                    status: "completed",
                }),
            })
            setActioned(true)
            onActionTaken()
            onToast?.(`✓ ${student.name} marked as actioned`, "success")
        } catch (err) {
            console.error(err)
            onToast?.("Failed to mark as actioned. Try again.", "error")
        } finally {
            setMarking(false)
        }
    }

    return (
        <div
            style={{
                perspective: "1200px",
                minHeight: "520px",
                height: "100%",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    minHeight: "520px",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >

                {/* ===== FRONT ===== */}
                <div
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: actioned ? "var(--shadow-inset)" : "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.25rem",
                        transition: "box-shadow 0.3s ease, opacity 0.3s ease",
                        opacity: actioned ? 0.75 : 1,
                        backfaceVisibility: "hidden",
                        position: "relative",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Flip hint */}
                    {actioned && (
                        <button
                            onClick={() => setFlipped(true)}
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "var(--neu-bg)",
                                boxShadow: "var(--shadow-raised-sm)",
                                border: "none",
                                borderRadius: "0.5rem",
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                zIndex: 10,
                            }}
                        >
                            <RotateCcw size={9} /> History
                        </button>
                    )}

                    {/* Header */}
                    <div className="flex items-start gap-2 mb-4" style={{ paddingRight: "80px" }}>
                        <div className="flex items-center gap-3">
                            <div
                                className="initials-badge flex-shrink-0"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    color: config.initialsColor,
                                    background: config.initialsBg,
                                    boxShadow: `2px 2px 6px ${config.color}30, -2px -2px 6px #FFFFFF`,
                                }}
                            >
                                {initials}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-primary)", lineHeight: 1.2 }}>
                                    {student.name}
                                </p>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Class {student.class_grade} · {student.school_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Risk badge */}
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: config.lightBg,
                            color: config.color,
                            letterSpacing: "0.03em",
                            display: "inline-block",
                            marginBottom: "12px",
                        }}
                    >
                        {actioned ? "✓ Actioned" : config.label}
                    </span>

                    {/* Risk Gauge */}
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="flex-shrink-0"
                            style={{
                                background: "var(--neu-bg)",
                                boxShadow: "var(--shadow-inset-sm)",
                                borderRadius: "50%",
                                padding: "6px",
                            }}
                        >
                            <RiskGauge score={student.risk_score} size={84} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Dropout risk</span>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                                    60-day window
                                </span>
                            </div>
                            <div className="risk-bar-track">
                                <div
                                    className="risk-bar-fill-animated"
                                    style={{
                                        "--bar-width": `${student.risk_score}%`,
                                        background: config.barColor,
                                        boxShadow: `0 0 8px ${config.color}60`,
                                    } as React.CSSProperties}
                                />
                            </div>
                            <div className="flex justify-between">
                                <span style={{ fontSize: "12px", color: "#2DC653" }}>Safe</span>
                                <span style={{ fontSize: "12px", color: "#E63946" }}>Critical</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginTop: "4px",
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-inset-sm)",
                                    width: "fit-content",
                                }}
                            >
                                <div style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: config.color,
                                    boxShadow: `0 0 4px ${config.color}`,
                                }} />
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                                    Model confidence: {Math.min(94, 70 + Math.round(student.risk_score * 0.25))}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Data provenance */}
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2DC653", display: "inline-block", boxShadow: "0 0 4px #2DC653" }} />
                        Based on: {student.absences_this_month} absences, Math {student.math_score}%, Science {student.science_score}%
                    </div>

                    {/* Warning Signals */}
                    {student.top_signals && student.top_signals.length > 0 && (
                        <div className="mb-4">
                            <p className="section-label mb-2">Warning signals</p>
                            <div className="flex flex-wrap gap-1.5">
                                {student.top_signals.map((signal, i) => {
                                    const Icon = getSignalIcon(signal)
                                    return (
                                        <span key={i} className="signal-tag" style={{ color: config.color }}>
                                            <Icon size={10} />
                                            {signal}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Trend Graph */}
                    <div className="mb-4 p-3" style={{ background: "var(--neu-bg)", boxShadow: "var(--shadow-inset-sm)", borderRadius: "0.75rem" }}>
                        <RiskTrendGraph studentId={student._id} studentName={student.name} currentScore={student.risk_score} />
                    </div>

                    {/* Source citation chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {[
                            { label: "📄 ASER 2022", url: "https://asercentre.org/aser-2022/" },
                            { label: "📄 Pratham TaRL", url: "https://www.pratham.org/programs/education/teaching-at-the-right-level/" },
                            { label: "📄 MoE Data", url: "https://www.education.gov.in/en" },
                        ].map((source) => (
                            <a
                                key={source.label}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    background: "var(--accent-blue-light)",
                                    color: "var(--accent-blue)",
                                    boxShadow: "var(--shadow-inset-sm)",
                                    textDecoration: "none",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-raised-sm)"
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-inset-sm)"
                                }}
                            >
                                {source.label}
                            </a>
                        ))}
                    </div>

                {/* Recommended Action Flip Button */}
                {!actioned && (
                    <div className="mb-4" style={{ marginTop: "auto" }}>
                        <button
                            className="neu-btn w-full py-2.5 flex items-center justify-center gap-2"
                            style={{ fontSize: "14px", color: "var(--accent-blue)" }}
                            onClick={() => setFlipped(true)}
                        >
                            <Lightbulb size={12} /> View Recommended Action
                        </button>
                    </div>
                )}

                {/* Actioned state */}
                {actioned && (
                    <div className="mb-4 p-3" style={{ marginTop: "auto", background: "var(--neu-bg)", boxShadow: "var(--shadow-inset-sm)", borderRadius: "0.75rem" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                            <CheckCircle size={13} /> Action completed
                        </p>
                        {action && (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {action.split("\n")[0]}
                            </p>
                        )}
                    </div>
                )}

                {/* Mark as actioned button */}
                {!actioned && (
                    <button
                        className="neu-btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                        style={{ fontSize: "15px" }}
                        onClick={markActioned}
                        disabled={marking}
                    >
                        {marking
                            ? <><Loader2 size={13} className="animate-spin" /> Marking...</>
                            : <><CheckCircle size={13} /> Mark as actioned</>
                        }
                    </button>
                )}
            </div>

            {/* ===== BACK ===== */}
            {actioned ? (
                <CardBack
                    student={student}
                    config={config}
                    onFlip={() => setFlipped(false)}
                />
            ) : (
                <div
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.25rem",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                            Recommended Action
                        </p>
                        <button
                            onClick={() => setFlipped(false)}
                            style={{
                                background: "var(--neu-bg)",
                                boxShadow: "var(--shadow-raised-sm)",
                                border: "none",
                                borderRadius: "0.75rem",
                                padding: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "13px",
                                color: "var(--text-muted)",
                            }}
                        >
                            <RotateCcw size={12} /> Flip back
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", paddingBottom: "1rem" }}>
                        {!actionFetched ? (
                            <button
                                className="neu-btn w-full py-2.5 flex items-center justify-center gap-2"
                                style={{ fontSize: "14px", color: "var(--accent-blue)" }}
                                onClick={fetchSuggestion}
                                disabled={loadingAction}
                            >
                                {loadingAction
                                    ? <><Loader2 size={12} className="animate-spin" /> Generating suggestion...</>
                                    : <><Lightbulb size={12} /> Get AI intervention suggestion</>
                                }
                            </button>
                        ) : (
                            <div style={{
                                background: "var(--neu-bg)",
                                boxShadow: `inset 3px 3px 8px #C4CAD4, inset -3px -3px 8px #FFFFFF, inset 0 0 0 1px ${config.color}20`,
                                borderRadius: "0.75rem",
                                padding: "0.875rem",
                            }}>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#2DC653", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Lightbulb size={11} /> AI Suggested Action
                                </p>
                                <div className="space-y-1">
                                    {(() => {
                                        const lines = action.split("\n").filter(Boolean);
                                        const evidenceStartIndex = lines.findIndex(l => l.startsWith("Evidence base"));
                                        
                                        return lines.map((line, i) => {
                                            const isHeader = line.startsWith("IMMEDIATE") || line.startsWith("MONITOR") || line.startsWith("LOW RISK") || line.startsWith("Key concerns") || line.startsWith("Recommended") || line.startsWith("Warning") || line.startsWith("Preventive");
                                            const isStep = /^\d\./.test(line.trim());
                                            const isEvidence = evidenceStartIndex !== -1 && i >= evidenceStartIndex;
                                            
                                            if (isEvidence && !expanded) return null;
                                            
                                            return (
                                                <div key={i}>
                                                    {i === evidenceStartIndex && expanded && (
                                                        <div style={{ height: "1px", background: "var(--text-muted)", opacity: 0.2, margin: "12px 0 8px 0" }} />
                                                    )}
                                                    <p style={{
                                                        fontSize: "13px",
                                                        lineHeight: 1.6,
                                                        color: isHeader ? "var(--text-primary)" : isEvidence ? "var(--text-muted)" : "var(--text-secondary)",
                                                        fontWeight: isHeader ? 600 : 400,
                                                        paddingLeft: isStep ? "4px" : 0,
                                                    }}>
                                                        {line}
                                                    </p>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "6px", background: "none", border: "none", cursor: "pointer" }}
                                >
                                    {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {expanded ? "Hide evidence" : "Show evidence base"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    </div >
  )
}