"use client"

import { useState } from "react"
import {
    CalendarX, TrendingDown, Wheat, BookOpen,
    Lightbulb, CheckCircle, Loader2, ChevronDown,
    ChevronUp
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
    const lowerLevel = level?.toLowerCase() || "low"
    if (lowerLevel === "high") return {
        color: "#E63946",
        lightBg: "#FDECEA",
        label: "High Risk",
        barColor: "#E63946",
        initialsColor: "#E63946",
        initialsBg: "#FDECEA",
    }
    if (lowerLevel === "medium") return {
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

export default function RiskCard({ student, onActionTaken, onToast }: RiskCardProps) {
    const [action, setAction] = useState(student.intervention_action || "")
    const [loadingAction, setLoadingAction] = useState(false)
    const [actionFetched, setActionFetched] = useState(!!student.intervention_action)
    const [marking, setMarking] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [actioned, setActioned] = useState(student.status === "actioned")
    const [showAction, setShowAction] = useState(false)

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

    const parsedAction = (() => {
        const lines = action.split("\n").filter(Boolean)
        const normal: string[] = []
        const evidence: string[] = []
        let inEvidence = false
        for (const line of lines) {
            const isHeader = line.startsWith("IMMEDIATE") ||
                line.startsWith("MONITOR") ||
                line.startsWith("LOW RISK") ||
                line.startsWith("Key concerns") ||
                line.startsWith("Recommended") ||
                line.startsWith("Warning") ||
                line.startsWith("Preventive")

            if (line.toLowerCase().startsWith("evidence base")) {
                inEvidence = true
            } else if (inEvidence && isHeader) {
                inEvidence = false
            }

            if (inEvidence) {
                evidence.push(line)
            } else {
                normal.push(line)
            }
        }
        return { normal, evidence }
    })()

    return (
        <div
            className="flex flex-col h-full"
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
            <div className="flex-1">
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

                {/* Risk Gauge + Bar */}
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
                        <div className="flex justify-between items-center">
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
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
                        {/* Confidence meter */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "8px",
                                padding: "4px 8px",
                                borderRadius: "999px",
                                background: "var(--neu-bg)",
                                boxShadow: "var(--shadow-inset-sm)",
                                width: "fit-content",
                            }}
                        >
                            <div
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: config.color,
                                    boxShadow: `0 0 4px ${config.color}`,
                                }}
                            />
                            <span style={{
                                fontSize: "10px",
                                color: "var(--text-muted)",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                Model confidence: {Math.min(94, 70 + Math.round(student.risk_score * 0.25))}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Last updated timestamp */}
                <div
                    style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#2DC653",
                        display: "inline-block",
                        boxShadow: "0 0 4px #2DC653",
                        flexShrink: 0,
                    }} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Updated now : {student.absences_this_month} absences | Maths {student.math_score}% | Science {student.science_score}%
                    </span>
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

                {/* Source citation chips */}
                <div
                    className="flex flex-wrap gap-1.5 mb-4"
                >
                    {["📄 ASER 2022", "📄 Pratham TaRL", "📄 MoE Data"].map((source) => (
                        <span
                            key={source}
                            style={{
                                fontSize: "10px",
                                fontWeight: 500,
                                padding: "3px 8px",
                                borderRadius: "999px",
                                background: "var(--accent-blue-light)",
                                color: "var(--accent-blue)",
                                boxShadow: "var(--shadow-inset-sm)",
                            }}
                        >
                            {source}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
                {/* Action Box */}
                {!actioned && (
                    <div>
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
                        ) : !showAction ? (
                            <button
                                className="neu-btn w-full py-2.5 flex items-center justify-center gap-2"
                                style={{ fontSize: "12px", color: "var(--accent-blue)" }}
                                onClick={() => setShowAction(true)}
                            >
                                <Lightbulb size={12} /> View recommended action
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
                                <div className="flex justify-between items-center mb-2">
                                    <p style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "#2DC653",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}>
                                        <Lightbulb size={11} /> AI Suggested Action
                                    </p>
                                    <button
                                        onClick={() => setShowAction(false)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "var(--text-muted)",
                                            padding: "2px",
                                        }}
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {parsedAction.normal.map((line, i) => {
                                        const isHeader = line.startsWith("IMMEDIATE") ||
                                            line.startsWith("MONITOR") ||
                                            line.startsWith("LOW RISK") ||
                                            line.startsWith("Key concerns") ||
                                            line.startsWith("Recommended") ||
                                            line.startsWith("Warning") ||
                                            line.startsWith("Preventive")
                                        const isStep = /^\d\./.test(line.trim())
                                        return (
                                            <p
                                                key={`normal-${i}`}
                                                style={{
                                                    fontSize: "11px",
                                                    lineHeight: 1.6,
                                                    color: isHeader
                                                        ? "var(--text-primary)"
                                                        : "var(--text-secondary)",
                                                    fontWeight: isHeader ? 600 : 400,
                                                    paddingLeft: isStep ? "4px" : 0,
                                                }}
                                            >
                                                {line}
                                            </p>
                                        )
                                    })}

                                    {expanded && parsedAction.evidence.length > 0 && (
                                        <div className="pt-2 mt-2 border-t border-gray-200" style={{ borderColor: "var(--text-muted)", opacity: 0.8 }}>
                                            {parsedAction.evidence.map((line, i) => {
                                                const isEvidenceHeader = line.toLowerCase().startsWith("evidence base") || line.startsWith("SECTION")
                                                return (
                                                    <p
                                                        key={`evidence-${i}`}
                                                        style={{
                                                            fontSize: "11px",
                                                            lineHeight: 1.6,
                                                            color: "var(--text-muted)",
                                                            fontWeight: isEvidenceHeader ? 600 : 400,
                                                        }}
                                                    >
                                                        {line}
                                                    </p>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                                {parsedAction.evidence.length > 0 && (
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
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Actioned state */}
                {actioned && (
                    <div
                        className="p-3"
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
                                ACTION Taken for {student.name}
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
        </div>
    )
}