"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Upload, FileImage, CheckCircle,
    AlertCircle, Loader2, ArrowLeft, ScanLine
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
    const [rawText, setRawText] = useState("")
    const [error, setError] = useState("")
    const [dragOver, setDragOver] = useState(false)

    const handleFile = (f: File) => {
        if (!f.type.startsWith("image/")) {
            setError("Please upload an image file (JPG, PNG, etc.)")
            return
        }
        setError("")
        setResults([])
        setFile(f)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const handleScan = async () => {
        if (!file) return
        setScanning(true)
        setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("http://localhost:8000/ocr", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (!res.ok) throw new Error("OCR failed")

            setResults(data.subjects)
            setRawText(data.raw_text)
        } catch (err) {
            setError("OCR scan failed. Make sure the image is clear and try again.")
        } finally {
            setScanning(false)
        }
    }

    const getMarkColor = (marks: number) => {
        if (marks < 40) return "text-red-600 bg-red-50 border-red-200"
        if (marks < 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
        return "text-green-600 bg-green-50 border-green-200"
    }

    const getMarkLabel = (marks: number) => {
        if (marks < 40) return "Fail"
        if (marks < 60) return "Average"
        return "Pass"
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">

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
                    <h2 className="text-2xl font-semibold tracking-tight">Mark Sheet Scanner</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Upload a photo of a physical mark sheet to extract grades automatically
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Upload side */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Upload mark sheet photo</CardTitle>
                            <CardDescription>
                                Take a clear photo of the mark sheet and upload it here
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {!preview ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById("ocr-input")?.click()}
                                    className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${dragOver
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }
                  `}
                                >
                                    <input
                                        id="ocr-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0]
                                            if (f) handleFile(f)
                                        }}
                                    />
                                    <FileImage className="mx-auto mb-3 text-muted-foreground" size={32} />
                                    <p className="text-sm font-medium">Drop photo here or click to browse</p>
                                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG supported</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative rounded-lg overflow-hidden border">
                                        <img
                                            src={preview}
                                            alt="Mark sheet preview"
                                            className="w-full object-contain max-h-64"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileImage size={14} className="text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground truncate max-w-32">
                                                {file?.name}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setFile(null)
                                                setPreview(null)
                                                setResults([])
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <Button
                                className="w-full gap-2"
                                onClick={handleScan}
                                disabled={!file || scanning}
                            >
                                {scanning ? (
                                    <><Loader2 size={14} className="animate-spin" /> Scanning...</>
                                ) : (
                                    <><ScanLine size={14} /> Scan mark sheet</>
                                )}
                            </Button>

                        </CardContent>
                    </Card>
                </div>

                {/* Results side */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Extracted grades</CardTitle>
                            <CardDescription>
                                Grades detected from the mark sheet photo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {results.length === 0 && !scanning && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <ScanLine size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Upload and scan a mark sheet to see extracted grades here</p>
                                </div>
                            )}

                            {scanning && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Loader2 size={32} className="mx-auto mb-3 animate-spin opacity-50" />
                                    <p className="text-sm">Scanning mark sheet...</p>
                                    <p className="text-xs mt-1">This may take a few seconds</p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-4">
                                        <CheckCircle size={14} />
                                        {results.length} subjects extracted
                                    </div>

                                    {results.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <span className="text-sm font-medium">{item.subject}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{item.marks}/100</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getMarkColor(item.marks)}`}>
                                                    {getMarkLabel(item.marks)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Average: {Math.round(results.reduce((a, b) => a + b.marks, 0) / results.length)}/100
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => window.location.href = "/dashboard/students"}
                                    >
                                        View student risk scores →
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>

        </div>
    )
}