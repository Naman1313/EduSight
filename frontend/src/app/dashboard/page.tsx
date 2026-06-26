"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function DashboardPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState("")

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
                    Upload your school attendance data to generate dropout risk scores.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Schools monitored</p>
                        <p className="text-3xl font-semibold mt-1">—</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Students at risk</p>
                        <p className="text-3xl font-semibold mt-1 text-destructive">—</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Actions pending</p>
                        <p className="text-3xl font-semibold mt-1 text-yellow-600">—</p>
                    </CardContent>
                </Card>
            </div>

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
              ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
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