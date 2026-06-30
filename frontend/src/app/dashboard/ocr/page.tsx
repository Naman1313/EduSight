"use client"

import { useState } from "react"
import {
    Upload, FileImage, CheckCircle, AlertCircle,
    Loader2, ArrowLeft, ScanLine
} from "lucide-react"

interface ExtractedSubject {
    subject: string
    marks: number
}

export default function OCRPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [scanning, setScanning] = useState(false)
    const [results, setResults] = useState<ExtractedSubject[]>([])
    const [error, setError] = useState("")
    const [dragOver, setDragOver] = useState(false)

    const handleFile = (f: File) => {
        if (!f.type.startsWith("image/")) { setError("Please upload an image file."); return }
        setError(""); setResults([]); setFile(f)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const handleScan = async () => {
        if (!file) return
        setScanning(true); setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("http://localhost:8000/ocr", { method: "POST", body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error("OCR failed")
            setResults(data.subjects)
        } catch (err: any) {
            console.error("OCR Error:", err);
            setError(err.message || "OCR scan failed. Make sure the image is clear and try again.")
        } finally {
            setScanning(false)
        }
    }

    const getMarkConfig = (marks: number) => {
        if (marks < 40) return { color: "var(--accent-red)", bg: "var(--accent-red-light)", label: "Fail" }
        if (marks < 60) return { color: "var(--accent-amber)", bg: "var(--accent-amber-light)", label: "Average" }
        return { color: "var(--accent-green)", bg: "var(--accent-green-light)", label: "Pass" }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">

            <div className="flex items-center gap-3">
                <button className="neu-btn p-2" onClick={() => window.location.href = "/dashboard"}>
                    <ArrowLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <div>
                    <p className="section-label">AI-powered OCR</p>
                    <h2 className="page-title">Mark Sheet Scanner</h2>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Upload a photo of a physical mark sheet to extract grades automatically
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Upload side */}
                <div
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.5rem",
                    }}
                >
                    <p className="section-label mb-1">Upload photo</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
                        Mark sheet image
                    </p>

                    {!preview ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("ocr-input")?.click()}
                            style={{
                                boxShadow: dragOver
                                    ? `inset 3px 3px 8px #C4CAD4, inset -3px -3px 8px #FFFFFF, inset 0 0 0 2px var(--accent-blue)`
                                    : "var(--shadow-inset)",
                                borderRadius: "1rem",
                                padding: "2rem",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <input
                                id="ocr-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                            />
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "0.75rem",
                                    background: "var(--neu-bg)",
                                    boxShadow: "var(--shadow-raised-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 12px",
                                }}
                            >
                                <FileImage size={20} style={{ color: "var(--accent-blue)" }} />
                            </div>
                            <p style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                                Drop photo here or click to browse
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                JPG, PNG supported
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div
                                style={{
                                    borderRadius: "0.75rem",
                                    overflow: "hidden",
                                    boxShadow: "var(--shadow-inset-sm)",
                                }}
                            >
                                <img src={preview} alt="Mark sheet preview" className="w-full object-contain max-h-52" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {file?.name}
                                </span>
                                <button
                                    className="neu-btn px-3 py-1.5"
                                    style={{ fontSize: "11px", color: "var(--text-muted)" }}
                                    onClick={() => { setFile(null); setPreview(null); setResults([]) }}
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div
                            className="flex items-center gap-2 mt-3 p-3 rounded-xl"
                            style={{ background: "var(--accent-red-light)", color: "var(--accent-red)", fontSize: "12px" }}
                        >
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

                    <button
                        className={file ? "neu-btn-primary" : "neu-btn"}
                        style={{
                            width: "100%",
                            marginTop: "1rem",
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            color: file ? "white" : "var(--text-muted)",
                            cursor: scanning ? "not-allowed" : "pointer"
                        }}
                        onClick={() => {
                            if (!file) {
                                document.getElementById("ocr-input")?.click();
                            } else {
                                handleScan();
                            }
                        }}
                        disabled={scanning}
                    >
                        {scanning
                            ? <><Loader2 size={14} className="animate-spin" /> Scanning...</>
                            : <><ScanLine size={14} /> {file ? "Scan mark sheet" : "Select mark sheet"}</>
                        }
                    </button>
                </div>

                {/* Results side */}
                <div
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.25rem",
                        padding: "1.5rem",
                    }}
                >
                    <p className="section-label mb-1">Results</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
                        Extracted grades
                    </p>

                    {results.length === 0 && !scanning && (
                        <div
                            style={{
                                boxShadow: "var(--shadow-inset)",
                                borderRadius: "1rem",
                                padding: "3rem 1rem",
                                textAlign: "center",
                            }}
                        >
                            <ScanLine size={32} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 12px" }} />
                            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                Upload and scan a mark sheet to see extracted grades here
                            </p>
                        </div>
                    )}

                    {scanning && (
                        <div
                            style={{
                                boxShadow: "var(--shadow-inset)",
                                borderRadius: "1rem",
                                padding: "3rem 1rem",
                                textAlign: "center",
                            }}
                        >
                            <Loader2 size={32} style={{ color: "var(--text-muted)", opacity: 0.5, margin: "0 auto 12px" }} className="animate-spin" />
                            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Scanning mark sheet...</p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>This may take a few seconds</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-3">
                            <div
                                className="flex items-center gap-2"
                                style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: 600, marginBottom: "12px" }}
                            >
                                <CheckCircle size={13} /> {results.length} subjects extracted
                            </div>

                            {results.map((item, i) => {
                                const cfg = getMarkConfig(item.marks)
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ boxShadow: "var(--shadow-inset-sm)" }}
                                    >
                                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                                            {item.subject}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="risk-score-display"
                                                style={{ fontSize: "16px", color: cfg.color }}
                                            >
                                                {item.marks}
                                            </span>
                                            <span style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                                background: cfg.bg,
                                                color: cfg.color,
                                            }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}

                            <div
                                className="flex items-center justify-between pt-3"
                                style={{ borderTop: "1px solid rgba(196,202,212,0.5)" }}
                            >
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    Average: {Math.round(results.reduce((a, b) => a + b.marks, 0) / results.length)}/100
                                </span>
                            </div>

                            <button
                                className="neu-btn w-full py-2.5"
                                style={{ fontSize: "12px", color: "var(--accent-blue)", marginTop: "8px" }}
                                onClick={() => window.location.href = "/dashboard/students"}
                            >
                                View student risk scores →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}