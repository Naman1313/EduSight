"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CalendarX, TrendingDown, Wheat, BookOpen,
  Lightbulb, CheckCircle, Loader2, ChevronDown, ChevronUp
} from "lucide-react"
import { Student } from "@/types"

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

function getRiskColor(level: string) {
  if (level === "high") return {
    badge: "bg-red-100 text-red-700 border-red-200",
    score: "text-red-600",
    bar: "bg-red-500",
    initials: "bg-red-100 text-red-700",
    pill: "bg-red-50 text-red-700 border border-red-200",
  }
  if (level === "medium") return {
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    score: "text-yellow-600",
    bar: "bg-yellow-500",
    initials: "bg-yellow-100 text-yellow-700",
    pill: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  }
  return {
    badge: "bg-green-100 text-green-700 border-green-200",
    score: "text-green-600",
    bar: "bg-green-500",
    initials: "bg-green-100 text-green-700",
    pill: "bg-green-50 text-green-700 border border-green-200",
  }
}

export default function RiskCard({ student, onActionTaken }: RiskCardProps) {
  const [action, setAction] = useState(student.intervention_action || "")
  const [loadingAction, setLoadingAction] = useState(false)
  const [actionFetched, setActionFetched] = useState(!!student.intervention_action)
  const [marking, setMarking] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [actioned, setActioned] = useState(student.status === "actioned")

  const colors = getRiskColor(student.risk_level || "low")

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
    } catch (err) {
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
      setActioned(true)
      onActionTaken()
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${actioned ? "opacity-60" : ""}`}>
      <CardContent className="pt-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${colors.initials}`}>
              {initials}
            </div>
            <div>
              <p className="font-medium text-sm leading-tight">{student.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Class {student.class_grade} · {student.school_name}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${colors.badge}`}>
            {actioned ? "Actioned" : `${student.risk_level} risk`}
          </span>
        </div>

        {/* Risk Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground">Dropout risk score</span>
            <span className={`text-2xl font-semibold ${colors.score}`}>
              {student.risk_score}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
              style={{ width: `${student.risk_score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">60-day prediction window</p>
        </div>

        {/* Signals */}
        {student.top_signals && student.top_signals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Warning signals</p>
            <div className="flex flex-wrap gap-1.5">
              {student.top_signals.map((signal, i) => {
                const Icon = getSignalIcon(signal)
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${colors.pill}`}
                  >
                    <Icon size={11} />
                    {signal}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Box */}
        {!actioned && (
          <div className="space-y-2">
            {!actionFetched ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={fetchSuggestion}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <><Loader2 size={12} className="animate-spin" /> Generating suggestion...</>
                ) : (
                  <><Lightbulb size={12} /> Get intervention suggestion</>
                )}
              </Button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <Lightbulb size={11} /> Suggested action
                </p>
                <p className="text-xs text-green-700 leading-relaxed">{action}</p>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-green-600 flex items-center gap-1 mt-1"
                >
                  {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  {expanded ? "Show less" : "Show source"}
                </button>
                {expanded && (
                  <p className="text-xs text-green-600 italic">
                    Source: Pratham ASER 2023 evidence base
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actioned state */}
        {actioned && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle size={11} /> Action completed
            </p>
            {action && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action}</p>
            )}
          </div>
        )}

        {/* Footer buttons */}
        {!actioned && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={markActioned}
              disabled={marking}
            >
              {marking ? (
                <><Loader2 size={12} className="animate-spin mr-1" /> Marking...</>
              ) : (
                <><CheckCircle size={12} className="mr-1" /> Mark as actioned</>
              )}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}