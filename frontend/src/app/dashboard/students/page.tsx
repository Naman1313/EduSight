"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, AlertTriangle, ArrowLeft } from "lucide-react"
import { Student } from "@/types"
import RiskCard from "@/components/shared/RiskCard"

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [filtered, setFiltered] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
    const [schoolFilter, setSchoolFilter] = useState<string>("")
    const [error, setError] = useState("")

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const schoolParam = params.get("school")
        const filterParam = params.get("filter")
        if (schoolParam) setSchoolFilter(schoolParam)
        if (filterParam && ["high", "medium", "low"].includes(filterParam)) {
            setFilter(filterParam as "high" | "medium" | "low")
        }
        fetchStudents()
    }, [])

    useEffect(() => {
        let result = students
        if (schoolFilter) {
            result = result.filter((s) => s.school_id === schoolFilter)
        }
        if (filter !== "all") {
            result = result.filter((s) => s.risk_level === filter)
        }
        if (search.trim()) {
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    s.school_name?.toLowerCase().includes(search.toLowerCase()) ||
                    s.class_grade?.toLowerCase().includes(search.toLowerCase())
            )
        }
        setFiltered(result)
    }, [students, filter, search, schoolFilter])

    const fetchStudents = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/students", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setStudents(data)
            setFiltered(data)
        } catch (err: any) {
            setError(err.message || "Failed to fetch students")
        } finally {
            setLoading(false)
        }
    }

    const highRisk = students.filter((s) => s.risk_level === "high").length
    const mediumRisk = students.filter((s) => s.risk_level === "medium").length
    const lowRisk = students.filter((s) => s.risk_level === "low").length

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
                    <h2 className="text-2xl font-semibold tracking-tight">Student Risk Scores</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {schoolFilter
                            ? `${filtered.length} students in ${filtered[0]?.school_name || "selected school"}`
                            : `${students.length} students across all schools`
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => setFilter("high")}
                >
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wide">High Risk</p>
                    <p className="text-3xl font-semibold text-red-700 mt-1">{highRisk}</p>
                    <p className="text-xs text-red-500 mt-0.5">Needs immediate action</p>
                </div>
                <div
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => setFilter("medium")}
                >
                    <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Medium Risk</p>
                    <p className="text-3xl font-semibold text-yellow-700 mt-1">{mediumRisk}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">Monitor closely</p>
                </div>
                <div
                    className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => setFilter("low")}
                >
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Low Risk</p>
                    <p className="text-3xl font-semibold text-green-700 mt-1">{lowRisk}</p>
                    <p className="text-xs text-green-500 mt-0.5">On track</p>
                </div>
            </div>

            <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, school or class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "high", "medium", "low"] as const).map((f) => (
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
                {schoolFilter && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSchoolFilter("")}
                        className="text-xs text-muted-foreground gap-1"
                    >
                        ✕ Clear school filter
                    </Button>
                )}
            </div>

            {loading && (
                <div className="text-center py-20 text-muted-foreground">
                    Loading student data...
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-destructive text-sm py-4">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No students found. Try uploading a CSV from the dashboard.
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((student) => (
                        <RiskCard
                            key={student._id}
                            student={student}
                            onActionTaken={fetchStudents}
                        />
                    ))}
                </div>
            )}

        </div>
    )
}