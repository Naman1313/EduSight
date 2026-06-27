"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth")
        }
    }, [router])

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">ES</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm">EduSight</h1>
                        <p className="text-xs text-muted-foreground">Block Education Dashboard</p>
                    </div>
                </div>
                <nav className="flex items-center gap-4">
                    <a
                        href="/dashboard"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Home
                    </a>
                    <a
                        href="/dashboard/students"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Students
                    </a>

                    <a
                        href="/dashboard/interventions"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Interventions
                    </a>
                    <a
                        href="/dashboard/ocr"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Scan marks
                    </a>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token")
                            window.location.href = "/auth"
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign out
                    </button>
                </nav>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}