"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth")
        }
    }, [router])

    const navLinks = [
        { href: "/dashboard", label: "Home" },
        { href: "/dashboard/students", label: "Students" },
        { href: "/dashboard/schools", label: "Schools" },
        { href: "/dashboard/ocr", label: "Scan marks" },
        { href: "/dashboard/interventions", label: "Interventions" },
    ]

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="bg-background border-b px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground text-xs font-bold">ES</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-sm">EduSight</h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                Block Education Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
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

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <nav className="md:hidden mt-3 pt-3 border-t flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-lg hover:bg-muted"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <button
                            onClick={() => {
                                localStorage.removeItem("token")
                                window.location.href = "/auth"
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-lg hover:bg-muted text-left"
                        >
                            Sign out
                        </button>
                    </nav>
                )}
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {children}
            </main>
        </div>
    )
}