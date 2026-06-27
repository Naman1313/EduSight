"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, School, Users, AlertTriangle } from "lucide-react"

interface Stats {
    total_schools: number
    total_students: number
    high_risk: number
    pending_actions: number
}

interface SchoolStat {
    school_id: string
    school_name: string
    total: number
    high: number
    medium: number
    low: number
}

export default function DashboardPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState("")
    const [stats, setStats] = useState<Stats | null>(null)
    const [schools, setSchools] = useState<SchoolStat[]>([])

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/schools/stats", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const data = await res.json()
            if (res.ok) {
                setStats(data.stats)
                setSchools(data.schools)
            }
        } catch (err) {
            console.error("Could not fetch stats")
        }
    }

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) {
            setError("Only CSV files are supported.")
            return
        }
        setError("")
        setFile(f)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("http://localhost:5000/api/students/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setUploaded(true)
            fetchStats()
        } catch (err: any) {
            setError(err.message || "Upload failed")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-8">

            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                <p className="text-muted-foreground mt-1">
                    Monitor student dropout risk across your block.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => window.location.href = "/dashboard/students"}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <School size={14} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Schools monitored</p>
                        </div>
                        <p className="text-3xl font-semibold mt-1">
                            {stats ? stats.total_schools : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats ? `${stats.total_students} total students` : "Upload CSV to see"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-destructive/50 transition-colors"
                    onClick={() => window.location.href = "/dashboard/students?filter=high"}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={14} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Students at high risk</p>
                        </div>
                        <p className="text-3xl font-semibold mt-1 text-destructive">
                            {stats ? stats.high_risk : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats ? "Click to view all" : "Upload CSV to see"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-yellow-400/50 transition-colors"
                    onClick={() => window.location.href = "/dashboard/students"}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Users size={14} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Actions pending</p>
                        </div>
                        <p className="text-3xl font-semibold mt-1 text-yellow-600">
                            {stats ? stats.pending_actions : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats ? "High risk, not actioned" : "Upload CSV to see"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {schools.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">School overview</CardTitle>
                        <CardDescription>Risk breakdown per school in your block</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {schools.map((school) => (
                                <div
                                    key={school.school_id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => window.location.href = `/dashboard/students?school=${school.school_id}`}
                                >
                                    <div>
                                        <p className="text-sm font-medium">{school.school_name}</p>
                                        <p className="text-xs text-muted-foreground">{school.total} students</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {school.high > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                                {school.high} high
                                            </span>
                                        )}
                                        {school.medium > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                                {school.medium} medium
                                            </span>
                                        )}
                                        {school.low > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                                {school.low} low
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Upload attendance data</CardTitle>
                    <CardDescription>
                        Upload a CSV file with student attendance and marks.
                        The system will generate risk scores automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("csv-input")?.click()}
                        className={`
              border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
              ${dragOver
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }
            `}
                    >
                        <input
                            id="csv-input"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleFile(f)
                            }}
                        />
                        <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                        <p className="font-medium text-sm">
                            Drop your CSV here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Supports: student_id, name, class, absences, marks columns
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {file && !uploaded && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <Badge variant="secondary">
                                    {(file.size / 1024).toFixed(1)} KB
                                </Badge>
                            </div>
                            <Button size="sm" onClick={handleUpload} disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    )}

                    {uploaded && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} />
                                File uploaded successfully. Risk scores generated.
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = "/dashboard/students"}
                                className="gap-2"
                            >
                                View student risk scores <ArrowRight size={14} />
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>

        </div>
    )
}