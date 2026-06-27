"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft, CheckCircle, Clock, AlertTriangle,
    Users, TrendingDown, TrendingUp, Target
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts"

interface Intervention {
    _id: string
    student_name: string
    school_name: string
    risk_score: number
    risk_score_before: number
    risk_score_after?: number
    risk_level: string
    action_taken: string
    notes: string
    status: string
    createdAt: string
    followup_date?: string
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

    useEffect(() => {
        fetchInterventions()
        fetchStats()
    }, [])

    const fetchInterventions = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/interventions", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) setInterventions(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/interventions/stats", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await res.json()
            if (res.ok) setStats(data)
        } catch (err) {
            console.error(err)
        }
    }

    const saveFollowup = async (id: string) => {
        if (!followupScore) return
        setSavingFollowup(true)
        try {
            await fetch(`http://localhost:5000/api/interventions/${id}/followup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ risk_score_after: parseInt(followupScore) }),
            })
            setFollowupId(null)
            setFollowupScore("")
            fetchInterventions()
            fetchStats()
        } catch (err) {
            console.error(err)
        } finally {
            setSavingFollowup(false)
        }
    }

    const filtered = interventions.filter((i) => {
        if (filter === "all") return true
        return i.status === filter
    })

    const completed = interventions.filter((i) => i.status === "completed").length
    const pending = interventions.filter((i) => i.status === "pending").length

    const getRiskColor = (level: string) => {
        if (level === "high") return "bg-red-100 text-red-700"
        if (level === "medium") return "bg-yellow-100 text-yellow-700"
        return "bg-green-100 text-green-700"
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
    }

    const chartData = interventions
        .filter((i) => i.risk_score_before && i.risk_score_after)
        .map((i) => ({
            name: i.student_name.split(" ")[0],
            before: i.risk_score_before,
            after: i.risk_score_after,
        }))

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/dashboard"}
                    className="gap-2"
                >
                    <ArrowLeft size={14} />
                    Back
                </Button>
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Intervention Tracker</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        History and success rate of all interventions
                    </p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Users size={14} className="text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <p className="text-3xl font-semibold">{stats?.total ?? "—"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={14} className="text-green-600" />
                            <p className="text-xs text-muted-foreground">Success rate</p>
                        </div>
                        <p className="text-3xl font-semibold text-green-600">
                            {stats ? `${stats.success_rate}%` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            of followed-up cases
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={14} className="text-blue-600" />
                            <p className="text-xs text-muted-foreground">Avg score before</p>
                        </div>
                        <p className="text-3xl font-semibold text-blue-600">
                            {stats?.avg_score_before ?? "—"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={14} className="text-green-600" />
                            <p className="text-xs text-muted-foreground">Avg score after</p>
                        </div>
                        <p className="text-3xl font-semibold text-green-600">
                            {stats?.avg_score_after || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.pending_followup
                                ? `${stats.pending_followup} awaiting follow-up`
                                : ""}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Before vs After chart */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Risk score: Before vs After intervention</CardTitle>
                        <CardDescription>
                            Comparing dropout risk scores before and after action was taken
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="before"
                                        stroke="#E24B4A"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="Before"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="after"
                                        stroke="#4CAF50"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="After"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2">
                {(["all", "completed", "pending"] as const).map((f) => (
                    <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? "default" : "outline"}
                        onClick={() => setFilter(f)}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {loading && (
                <div className="text-center py-20 text-muted-foreground">
                    Loading interventions...
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No interventions recorded yet.</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => window.location.href = "/dashboard/students"}
                    >
                        Go to Students →
                    </Button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map((intervention) => (
                        <Card key={intervention._id}>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-sm">{intervention.student_name}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRiskColor(intervention.risk_level)}`}>
                                                {intervention.risk_level} risk
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{intervention.school_name}</p>

                                        {/* Before / After scores */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Before</p>
                                                <p className="text-lg font-semibold text-red-600">
                                                    {intervention.risk_score_before ?? intervention.risk_score}
                                                </p>
                                            </div>
                                            <div className="flex-1 h-0.5 bg-border relative">
                                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                                                    →
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">After</p>
                                                <p className={`text-lg font-semibold ${intervention.risk_score_after
                                                    ? intervention.risk_score_after < (intervention.risk_score_before ?? 100) - 10
                                                        ? "text-green-600"
                                                        : "text-yellow-600"
                                                    : "text-muted-foreground"
                                                    }`}>
                                                    {intervention.risk_score_after ?? "—"}
                                                </p>
                                            </div>
                                            {intervention.risk_score_after && (
                                                <div className={`text-xs px-2 py-1 rounded-full font-medium ${intervention.risk_score_after < (intervention.risk_score_before ?? 100) - 10
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {intervention.risk_score_after < (intervention.risk_score_before ?? 100) - 10
                                                        ? "✓ Improved"
                                                        : "~ No change"}
                                                </div>
                                            )}
                                        </div>

                                        {intervention.action_taken && (
                                            <div className="bg-muted/50 rounded-lg p-3 mt-2">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Action taken:</p>
                                                <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                                                    {intervention.action_taken.split("\n")[0]}
                                                </p>
                                            </div>
                                        )}

                                        {/* Follow-up input */}
                                        {!intervention.risk_score_after && (
                                            followupId === intervention._id ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="New risk score (0-100)"
                                                        value={followupScore}
                                                        onChange={(e) => setFollowupScore(e.target.value)}
                                                        className="flex h-8 w-36 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="text-xs h-8"
                                                        onClick={() => saveFollowup(intervention._id)}
                                                        disabled={savingFollowup}
                                                    >
                                                        {savingFollowup ? "Saving..." : "Save"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs h-8"
                                                        onClick={() => setFollowupId(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs mt-2 h-8"
                                                    onClick={() => setFollowupId(intervention._id)}
                                                >
                                                    + Add 30-day follow-up score
                                                </Button>
                                            )
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${intervention.status === "completed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {intervention.status}
                                        </span>
                                        <p className="text-xs text-muted-foreground text-right">
                                            {formatDate(intervention.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

        </div>
    )
}