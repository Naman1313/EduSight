"use client"

import { useState } from "react"
import {
    CalendarX, TrendingDown, Wheat, BookOpen,
    Lightbulb, CheckCircle, Loader2, ChevronDown,
    ChevronUp, User
} from "lucide-react"
import { Student } from "@/types"
import RiskTrendGraph from "@/components/shared/RiskTrendGraph"

interface RiskCardProps {
    student: Student
    onActionTaken: () => void
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

export default function RiskCard({ student, onActionTaken }: RiskCardProps) {
    const [action, setAction] = useState(student.intervention_action || "")
    const [loadingAction, setLoadingAction] = useState(false)
    const [actionFetched, setActionFetched] = useState(!!student.intervention_action)
    const [marking, setMarking] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [actioned, setActioned] = useState(student.status === "actioned")

    const config = getRiskConfig(student.risk_level || "low")

    const initials = student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const fetchSuggestion = async () => {
        setLoadingAction(true)
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
        } catch {
            setAction("Could not fetch suggestion. Please try again.")
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
        } catch (err) {
            console.error(err)
        } finally {
            setMarking(false)
        }
    }

    return (
        <div
            style={{
                background: "var(--neu-bg)",
                boxShadow: actioned
                    ? "var(--shadow-inset)"
                    : "var(--shadow-raised)",
                borderRadius: "1.25rem",
                padding: "1.25rem",
                transition: "all 0.3s ease",
                opacity: actioned ? 0.75 : 1,
            }}
        >

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-4">
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
                        <p style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "var(--text-primary)",
                            lineHeight: 1.2,
                        }}>
                            {student.name}
                        </p>
                        <p style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                        }}>
                            Class {student.class_grade} · {student.school_name}
                        </p>
                    </div>
                </div>
                <span
                    style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: config.lightBg,
                        color: config.color,
                        letterSpacing: "0.03em",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    {actioned ? "✓ Actioned" : config.label}
                </span>
            </div>

            {/* Risk Score Well */}
            <div className="flex items-center gap-4 mb-4">
                <div
                    className="score-well flex-shrink-0"
                    style={{
                        width: "72px",
                        height: "72px",
                        boxShadow: `inset 4px 4px 10px #C4CAD4, inset -4px -4px 10px #FFFFFF`,
                    }}
                >
                    <span
                        className="risk-score-display"
                        style={{
                            fontSize: "22px",
                            color: config.color,
                            lineHeight: 1,
                        }}
                    >
                        {student.risk_score}
                    </span>
                    <span style={{
                        fontSize: "9px",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                    }}>
                        /100
                    </span>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Dropout risk
                        </span>
                        <span style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            60-day window
                        </span>
                    </div>
                    <div className="risk-bar-track">
                        <div
                            className="risk-bar-fill"
                            style={{
                                width: `${student.risk_score}%`,
                                background: config.barColor,
                            }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <span style={{ fontSize: "10px", color: "#2DC653" }}>Safe</span>
                        <span style={{ fontSize: "10px", color: "#E63946" }}>Critical</span>
                    </div>
                </div>
            </div>

            {/* Warning Signals */}
            {student.top_signals && student.top_signals.length > 0 && (
                <div className="mb-4">
                    <p className="section-label mb-2">Warning signals</p>
                    <div className="flex flex-wrap gap-1.5">
                        {student.top_signals.map((signal, i) => {
                            const Icon = getSignalIcon(signal)
                            return (
                                <span
                                    key={i}
                                    className="signal-tag"
                                    style={{ color: config.color }}
                                >
                                    <Icon size={10} />
                                    {signal}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Trend Graph */}
            <div
                className="mb-4 p-3"
                style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--shadow-inset-sm)",
                    borderRadius: "0.75rem",
                }}
            >
                <RiskTrendGraph
                    studentId={student._id}
                    studentName={student.name}
                    currentScore={student.risk_score}
                />
            </div>

            {/* Action Box */}
            {!actioned && (
                <div className="mb-4">
                    {!actionFetched ? (
                        <button
                            className="neu-btn w-full py-2.5 flex items-center justify-center gap-2"
                            style={{ fontSize: "12px", color: "var(--accent-blue)" }}
                            onClick={fetchSuggestion}
                            disabled={loadingAction}
                        >
                            {loadingAction ? (
                                <><Loader2 size={12} className="animate-spin" /> Generating suggestion...</>
                            ) : (
                                <><Lightbulb size={12} /> Get AI intervention suggestion</>
                            )}
                        </button>
                    ) : (
                        <div
                            style={{
                                background: "var(--neu-bg)",
                                boxShadow: `inset 3px 3px 8px #C4CAD4, inset -3px -3px 8px #FFFFFF, inset 0 0 0 1px ${config.color}20`,
                                borderRadius: "0.75rem",
                                padding: "0.875rem",
                            }}
                        >
                            <p style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#2DC653",
                                marginBottom: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}>
                                <Lightbulb size={11} /> AI Suggested Action
                            </p>
                            <div className="space-y-1">
                                {action.split("\n").filter(Boolean).map((line, i) => {
                                    const isHeader = line.startsWith("IMMEDIATE") ||
                                        line.startsWith("MONITOR") ||
                                        line.startsWith("LOW RISK") ||
                                        line.startsWith("Key concerns") ||
                                        line.startsWith("Recommended") ||
                                        line.startsWith("Warning") ||
                                        line.startsWith("Preventive")
                                    const isStep = /^\d\./.test(line.trim())
                                    const isEvidence = line.startsWith("Evidence base")
                                    if (isEvidence && !expanded) return null
                                    return (
                                        <p
                                            key={i}
                                            style={{
                                                fontSize: "11px",
                                                lineHeight: 1.6,
                                                color: isHeader
                                                    ? "var(--text-primary)"
                                                    : isEvidence
                                                        ? "var(--text-muted)"
                                                        : "var(--text-secondary)",
                                                fontWeight: isHeader ? 600 : 400,
                                                paddingLeft: isStep ? "4px" : 0,
                                            }}
                                        >
                                            {line}
                                        </p>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                style={{
                                    fontSize: "11px",
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    marginTop: "6px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                {expanded ? "Hide evidence" : "Show evidence base"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Actioned state */}
            {actioned && (
                <div
                    className="mb-4 p-3"
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-inset-sm)",
                        borderRadius: "0.75rem",
                    }}
                >
                    <p style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "4px",
                    }}>
                        <CheckCircle size={11} /> Action completed
                    </p>
                    {action && (
                        <p style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                        }}>
                            {action.split("\n")[0]}
                        </p>
                    )}
                </div>
            )}

            {/* Mark as actioned button */}
            {!actioned && (
                <button
                    className="neu-btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                    style={{ fontSize: "13px" }}
                    onClick={markActioned}
                    disabled={marking}
                >
                    {marking ? (
                        <><Loader2 size={13} className="animate-spin" /> Marking...</>
                    ) : (
                        <><CheckCircle size={13} /> Mark as actioned</>
                    )}
                </button>
            )}

        </div>
    )
}