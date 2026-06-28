"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, GraduationCap } from "lucide-react"
import LanguageSwitcher from "@/components/shared/LanguageSwitcher"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) router.push("/auth")
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [router])

    const navLinks = [
        { href: "/dashboard", label: "Home" },
        { href: "/dashboard/students", label: "Students" },
        { href: "/dashboard/schools", label: "Schools" },
        { href: "/dashboard/ocr", label: "Scan Marks" },
        { href: "/dashboard/interventions", label: "Interventions" },
    ]

    return (
        <div className="min-h-screen" style={{ background: "var(--neu-bg)" }}>

            <header
                className="sticky top-0 z-50 px-4 md:px-8 py-4 transition-all duration-200"
                style={{
                    background: "var(--neu-bg)",
                    boxShadow: scrolled
                        ? "0 4px 20px rgba(196, 202, 212, 0.8), 0 -2px 8px rgba(255,255,255,0.9)"
                        : "none",
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 flex items-center justify-center"
                            style={{
                                background: "var(--neu-bg)",
                                boxShadow: "var(--shadow-raised-sm)",
                                borderRadius: "0.75rem",
                            }}
                        >
                            <GraduationCap size={20} style={{ color: "var(--accent-blue)" }} />
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                            }}>
                                EduSight
                            </h1>
                            <p style={{
                                fontSize: "10px",
                                color: "var(--text-muted)",
                                fontWeight: 500,
                                letterSpacing: "0.04em",
                            }}>
                                DROPOUT PREVENTION
                            </p>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="nav-link"
                            style={
                                pathname === link.href
                                    ? {
                                        color: "var(--accent-blue)",
                                        background: "var(--neu-bg)",
                                        boxShadow: "var(--shadow-inset-sm)",
                                    }
                                    : {}
                            }
                        >
                            {link.label}
                        </a>
            ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <button
                        className="neu-btn text-xs px-4 py-2"
                        style={{ color: "var(--text-muted)", fontSize: "13px" }}
                        onClick={() => {
                            localStorage.removeItem("token")
                            window.location.href = "/auth"
                        }}
                    >
                        Sign out
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden neu-btn p-2"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
        </div>

        {/* Mobile menu */ }
    {
        menuOpen && (
            <div
                className="md:hidden mt-4 p-4 mx-4 rounded-2xl"
                style={{ boxShadow: "var(--shadow-raised)" }}
            >
                <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="nav-link"
                            onClick={() => setMenuOpen(false)}
                            style={
                                pathname === link.href
                                    ? {
                                        color: "var(--accent-blue)",
                                        background: "var(--neu-bg)",
                                        boxShadow: "var(--shadow-inset-sm)",
                                    }
                                    : {}
                            }
                        >
                            {link.label}
                        </a>
              ))}
                <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                    <LanguageSwitcher />
                    <button
                        className="text-xs neu-btn px-3 py-2"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => {
                            localStorage.removeItem("token")
                            window.location.href = "/auth"
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </nav>
          </div >
        )
    }
      </header >

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
        </main>
    </div >
  )
}