"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Student } from "@/types"
import RiskCard from "@/components/shared/RiskCard"
import { useTranslations } from "@/lib/useTranslations"

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [filtered, setFiltered] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
    const [schoolFilter, setSchoolFilter] = useState<string>("")
    const [error, setError] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkActioning, setBulkActioning] = useState(false)
    const [bulkDone, setBulkDone] = useState(false)
    const { t } = useTranslations()

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

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAllHighRisk = () => {
        const highRiskIds = filtered
            .filter((s) => s.risk_level === "high" && s.status !== "actioned")
            .map((s) => s._id)
        setSelectedIds(new Set(highRiskIds))
    }

    const clearSelection = () => {
        setSelectedIds(new Set())
        setBulkDone(false)
    }

    const bulkAction = async () => {
        if (selectedIds.size === 0) return
        setBulkActioning(true)
        try {
            const promises = Array.from(selectedIds).map(async (id) => {
                const student = students.find((s) => s._id === id)
                await fetch(`http://localhost:5000/api/students/${id}/action`, {
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
                        student_id: id,
                        action_taken: student?.intervention_action || "Bulk action taken by BEO",
                        status: "completed",
                    }),
                })
            })
            await Promise.all(promises)
            setBulkDone(true)
            setSelectedIds(new Set())
            fetchStudents()
        } catch (err) {
            console.error(err)
        } finally {
            setBulkActioning(false)
        }
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
                    <h2 className="text-2xl font-semibold tracking-tight">{t.students.title}</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {schoolFilter
                            ? `${filtered.length} ${t.students.inSchool} ${filtered[0]?.school_name || ""}`
                            : `${students.length} ${t.students.acrossSchools}`
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => setFilter("high")}
                >
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wide">{t.students.high} Risk</p>
                    <p className="text-3xl font-semibold text-red-700 mt-1">{highRisk}</p>
                    <p className="text-xs text-red-500 mt-0.5">Needs immediate action</p>
                </div>
                <div
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => setFilter("medium")}
                >
                    <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">{t.students.medium} Risk</p>
                    <p className="text-3xl font-semibold text-yellow-700 mt-1">{mediumRisk}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">Monitor closely</p>
                </div>
                <div
                    className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => setFilter("low")}
                >
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide">{t.students.low} Risk</p>
                    <p className="text-3xl font-semibold text-green-700 mt-1">{lowRisk}</p>
                    <p className="text-xs text-green-500 mt-0.5">On track</p>
                </div>
            </div>

            {/* Bulk action bar */}
            <div className="flex flex-wrap gap-2 items-center p-3 bg-muted/50 rounded-lg border">
                <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={selectAllHighRisk}
                >
                    Select all high risk
                </Button>
                {selectedIds.size > 0 && (
                    <>
                        <span className="text-xs text-muted-foreground">
                            {selectedIds.size} student{selectedIds.size > 1 ? "s" : ""} selected
                        </span>
                        <Button
                            size="sm"
                            className="text-xs gap-1 bg-green-600 hover:bg-green-700"
                            onClick={bulkAction}
                            disabled={bulkActioning}
                        >
                            {bulkActioning ? (
                                <><Loader2 size={12} className="animate-spin" /> Actioning...</>
                            ) : (
                                <><CheckCircle size={12} /> Mark all as actioned</>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={clearSelection}
                        >
                            Clear
                        </Button>
                    </>
                )}
                {bulkDone && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> Bulk action completed!
                    </span>
                )}
            </div>

            <div className="flex gap-3 items-center flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t.students.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
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
                        ✕ {t.students.clearFilter}
                    </Button>
                )}
            </div>

            {loading && (
                <div className="text-center py-20 text-muted-foreground">
                    {t.students.loading}
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
                    {t.students.noStudents}
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((student) => (
                        <div key={student._id} className="relative">
                            {/* Selection checkbox */}
                            {student.status !== "actioned" && (
                                <div
                                    className="absolute top-3 right-3 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleSelect(student._id)
                                    }}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${selectedIds.has(student._id)
                                            ? "bg-primary border-primary"
                                            : "bg-background border-border hover:border-primary"
                                        }`}>
                                        {selectedIds.has(student._id) && (
                                            <CheckCircle size={12} className="text-primary-foreground" />
                                        )}
                                    </div>
                                </div>
                            )}
                            <RiskCard
                                student={student}
                                onActionTaken={fetchStudents}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}