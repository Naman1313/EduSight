"use client"

import { useEffect, useState } from "react"
import { Search, AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Student } from "@/types"
import RiskCard from "@/components/shared/RiskCard"
import { useTranslations } from "@/lib/useTranslations"
import { SkeletonCard, SkeletonStatCard } from "@/components/shared/SkeletonCard"

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
        if (schoolFilter) result = result.filter((s) => s.school_id === schoolFilter)
        if (filter !== "all") result = result.filter((s) => s.risk_level === filter)
        if (search.trim()) {
            result = result.filter((s) =>
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
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        const ids = filtered
            .filter((s) => s.risk_level === "high" && s.status !== "actioned")
            .map((s) => s._id)
        setSelectedIds(new Set(ids))
    }

    const clearSelection = () => {
        setSelectedIds(new Set())
        setBulkDone(false)
    }

    const bulkAction = async () => {
        if (selectedIds.size === 0) return
        setBulkActioning(true)
        try {
            await Promise.all(Array.from(selectedIds).map(async (id) => {
                const student = students.find((s) => s._id === id)
                await fetch(`http://localhost:5000/api/students/${id}/action`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ status: "actioned" }),
                })
                await fetch("http://localhost:5000/api/interventions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ student_id: id, action_taken: student?.intervention_action || "Bulk action taken by BEO", status: "completed" }),
                })
            }))
            setBulkDone(true)
            setSelectedIds(new Set())
            fetchStudents()
        } catch (err) {
            console.error(err)
        } finally {
            setBulkActioning(false)
        }
    }

    const filterOptions = [
        { key: "all", label: "All", color: "var(--text-primary)" },
        { key: "high", label: "High", color: "var(--accent-red)" },
        { key: "medium", label: "Medium", color: "var(--accent-amber)" },
        { key: "low", label: "Low", color: "var(--accent-green)" },
    ]

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    className="neu-btn p-2"
                    onClick={() => window.location.href = "/dashboard"}
                >
                    <ArrowLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <div>
                    <p className="section-label">Student risk scores</p>
                    <h2 className="page-title">{t.students.title}</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {schoolFilter
                            ? `${filtered.length} ${t.students.inSchool} ${filtered[0]?.school_name || ""}`
                            : `${students.length} ${t.students.acrossSchools}`}
                    </p>
                </div>
            </div>

            {/* Risk tier cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "High Risk", count: highRisk, color: "var(--accent-red)", bg: "var(--accent-red-light)", key: "high" },
                    { label: "Medium Risk", count: mediumRisk, color: "var(--accent-amber)", bg: "var(--accent-amber-light)", key: "medium" },
                    { label: "Low Risk", count: lowRisk, color: "var(--accent-green)", bg: "var(--accent-green-light)", key: "low" },
                ].map((tier) => (
                    <div
                        key={tier.key}
                        className="stat-card text-center"
                        onClick={() => setFilter(tier.key as any)}
                        style={{
                            boxShadow: filter === tier.key
                                ? "var(--shadow-inset)"
                                : "var(--shadow-raised)",
                        }}
                    >
                        <p className="section-label mb-1">{tier.label}</p>
                        <p
                            className="risk-score-display"
                            style={{ fontSize: "2.5rem", color: tier.color, lineHeight: 1 }}
                        >
                            {tier.count}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bulk action bar */}
            <div
                style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--shadow-inset-sm)",
                    borderRadius: "1rem",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    alignItems: "center",
                }}
            >
                <button
                    className="neu-btn px-4 py-2 flex items-center gap-1.5"
                    style={{ fontSize: "12px", color: "var(--accent-blue)" }}
                    onClick={selectAllHighRisk}
                >
                    Select all high risk
                </button>

                {selectedIds.size > 0 && (
                    <>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {selectedIds.size} student{selectedIds.size > 1 ? "s" : ""} selected
                        </span>
                        <button
                            className="neu-btn-primary px-4 py-2 flex items-center gap-1.5"
                            style={{ fontSize: "12px" }}
                            onClick={bulkAction}
                            disabled={bulkActioning}
                        >
                            {bulkActioning
                                ? <><Loader2 size={12} className="animate-spin" /> Actioning...</>
                                : <><CheckCircle size={12} /> Mark all as actioned</>
                            }
                        </button>
                        <button
                            className="neu-btn px-3 py-2"
                            style={{ fontSize: "12px", color: "var(--text-muted)" }}
                            onClick={clearSelection}
                        >
                            Clear
                        </button>
                    </>
                )}

                {bulkDone && (
                    <span style={{
                        fontSize: "12px",
                        color: "var(--accent-green)",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}>
                        <CheckCircle size={12} /> Bulk action completed!
                    </span>
                )}
            </div>

            {/* Search + filters */}
            <div className="flex gap-3 items-center flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search
                        size={14}
                        style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)",
                        }}
                    />
                    <input
                        placeholder={t.students.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="neu-input w-full"
                        style={{
                            paddingLeft: "38px",
                            paddingRight: "14px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            fontSize: "13px",
                        }}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {filterOptions.map((f) => (
                        <button
                            key={f.key}
                            className={filter === f.key ? "neu-pressed" : "neu-btn"}
                            style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                padding: "8px 14px",
                                color: filter === f.key ? f.color : "var(--text-muted)",
                            }}
                            onClick={() => setFilter(f.key as any)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {schoolFilter && (
                    <button
                        className="neu-btn px-3 py-2"
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                        onClick={() => setSchoolFilter("")}
                    >
                        ✕ {t.students.clearFilter}
                    </button>
                )}
            </div>

            {/* States */}
            {loading && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                    </div>
                </>
            )}

            {error && (
                <div
                    className="flex items-center gap-2 p-4 rounded-xl"
                    style={{ background: "var(--accent-red-light)", color: "var(--accent-red)", fontSize: "13px" }}
                >
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div
                    className="text-center py-20"
                    style={{
                        boxShadow: "var(--shadow-inset)",
                        borderRadius: "1.25rem",
                        color: "var(--text-muted)",
                        fontSize: "14px",
                    }}
                >
                    {t.students.noStudents}
                </div>
            )}

            {/* Student cards grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((student) => (
                        <div key={student._id} className="relative">
                            {student.status !== "actioned" && (
                                <div
                                    className="absolute top-3 right-3 z-10"
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(student._id) }}
                                >
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "6px",
                                            boxShadow: selectedIds.has(student._id)
                                                ? "var(--shadow-inset-sm)"
                                                : "var(--shadow-raised-sm)",
                                            background: selectedIds.has(student._id)
                                                ? "var(--accent-blue)"
                                                : "var(--neu-bg)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                        }}
                                    >
                                        {selectedIds.has(student._id) && (
                                            <CheckCircle size={12} style={{ color: "white" }} />
                                        )}
                                    </div>
                                </div>
                            )}
                            <RiskCard student={student} onActionTaken={fetchStudents} />
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}