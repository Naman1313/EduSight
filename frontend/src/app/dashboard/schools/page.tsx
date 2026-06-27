"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, School, Users, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react"

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

    useEffect(() => {
        fetchSchools()
    }, [])

    const fetchSchools = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/schools/stats", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const data = await res.json()
            if (res.ok) {
                setSchools(data.schools)
                setStats(data.stats)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getRiskLevel = (school: SchoolStat) => {
        const highPercent = (school.high / school.total) * 100
        if (highPercent >= 30) return "critical"
        if (highPercent >= 15) return "warning"
        return "stable"
    }

    const getRiskBadge = (level: string) => {
        if (level === "critical") return "bg-red-100 text-red-700 border-red-200"
        if (level === "warning") return "bg-yellow-100 text-yellow-700 border-yellow-200"
        return "bg-green-100 text-green-700 border-green-200"
    }

    const getRiskLabel = (level: string) => {
        if (level === "critical") return "Critical"
        if (level === "warning") return "Needs attention"
        return "Stable"
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
                    <h2 className="text-2xl font-semibold tracking-tight">School Overview</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Block-level dropout risk across all monitored schools
                    </p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <School size={14} className="text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Total schools</p>
                            </div>
                            <p className="text-3xl font-semibold">{stats.total_schools}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Users size={14} className="text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Total students</p>
                            </div>
                            <p className="text-3xl font-semibold">{stats.total_students}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={14} className="text-red-500" />
                                <p className="text-xs text-muted-foreground">High risk</p>
                            </div>
                            <p className="text-3xl font-semibold text-red-600">{stats.high_risk}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle size={14} className="text-green-500" />
                                <p className="text-xs text-muted-foreground">Actions pending</p>
                            </div>
                            <p className="text-3xl font-semibold text-yellow-600">{stats.pending_actions}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {loading && (
                <div className="text-center py-20 text-muted-foreground">
                    Loading school data...
                </div>
            )}

            {!loading && schools.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <School size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No school data found.</p>
                    <p className="text-xs mt-1">Upload a CSV from the dashboard to get started.</p>
                </div>
            )}

            {!loading && schools.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Schools in your block
                    </h3>
                    {schools.map((school) => {
                        const level = getRiskLevel(school)
                        const highPercent = Math.round((school.high / school.total) * 100)
                        const mediumPercent = Math.round((school.medium / school.total) * 100)
                        const lowPercent = Math.round((school.low / school.total) * 100)

                        return (
                            <Card
                                key={school.school_id}
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => window.location.href = `/dashboard/students?school=${school.school_id}`}
                            >
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <School size={18} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{school.school_name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {school.total} students enrolled
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getRiskBadge(level)}`}>
                                            {getRiskLabel(level)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-16">High risk</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${highPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-red-600 w-12 text-right">
                                                {school.high} ({highPercent}%)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-16">Medium</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${mediumPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-yellow-600 w-12 text-right">
                                                {school.medium} ({mediumPercent}%)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-16">Low risk</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${lowPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-green-600 w-12 text-right">
                                                {school.low} ({lowPercent}%)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Click to view all students →
                                        </span>
                                        {school.high > 0 && (
                                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                <AlertTriangle size={11} />
                                                {school.high} need immediate action
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

        </div>
    )
}