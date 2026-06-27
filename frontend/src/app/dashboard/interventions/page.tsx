"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Users } from "lucide-react"

interface Intervention {
    _id: string
    student_name: string
    school_name: string
    risk_score: number
    risk_level: string
    action_taken: string
    notes: string
    status: string
    createdAt: string
}

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState<Intervention[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

    useEffect(() => {
        fetchInterventions()
    }, [])

    const fetchInterventions = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/interventions", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const data = await res.json()
            if (res.ok) setInterventions(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
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
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

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
                        History of all actions taken on at-risk students
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Users size={14} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Total interventions</p>
                        </div>
                        <p className="text-3xl font-semibold">{interventions.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={14} className="text-green-600" />
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <p className="text-3xl font-semibold text-green-600">{completed}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-yellow-600" />
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                        <p className="text-3xl font-semibold text-yellow-600">{pending}</p>
                    </CardContent>
                </Card>
            </div>

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
                    <p className="text-xs mt-1">Mark students as actioned from the Students page.</p>
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
                                            <span className="text-xs text-muted-foreground">
                                                Score: {intervention.risk_score}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {intervention.school_name}
                                        </p>
                                        {intervention.action_taken && (
                                            <div className="bg-muted/50 rounded-lg p-3 mt-2">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Action taken:
                                                </p>
                                                <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                                                    {intervention.action_taken.split("\n")[0]}
                                                </p>
                                            </div>
                                        )}
                                        {intervention.notes && (
                                            <p className="text-xs text-muted-foreground italic">
                                                Note: {intervention.notes}
                                            </p>
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