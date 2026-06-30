"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, GraduationCap, Sun, Moon } from "lucide-react"
import LanguageSwitcher from "@/components/shared/LanguageSwitcher"
import PageTransition from "@/components/shared/PageTransition"
import Link from "next/link"
import { motion } from "framer-motion"
import { useDarkMode } from "@/lib/useDarkMode"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { isDark, toggle, mounted } = useDarkMode()
    const [clock, setClock] = useState("")
    const [dateStr, setDateStr] = useState("")

    useEffect(() => {
        const updateClock = () => {
            const now = new Date()
            setClock(now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }))
            setDateStr(now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
            }))
        }
        updateClock()
        const timer = setInterval(updateClock, 1000)
        return () => clearInterval(timer)
    }, [])

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
                    <Link href="/landing" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                        <div
                            className="w-10 h-10 flex items-center justify-center"
                            style={{ background: "var(--neu-bg)", boxShadow: "var(--shadow-raised-sm)", borderRadius: "0.75rem" }}
                        >
                            <GraduationCap size={22} style={{ color: "var(--accent-blue)" }} />
                        </div>
                        <h1 style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                        }}>
                            EduSight
                        </h1>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="nav-link relative px-4 py-2"
                                    style={{ color: isActive ? "#FFFFFF" : "var(--text-muted)", background: "transparent", boxShadow: "none" }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            className="absolute inset-0"
                                            style={{ background: "var(--accent-blue)", boxShadow: "0 4px 10px rgba(67, 97, 238, 0.4)", borderRadius: "999px", zIndex: -1 }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span style={{ position: "relative", zIndex: 1, fontWeight: isActive ? 600 : 500 }}>{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />
                        {mounted && (
                            <button
                                onClick={toggle}
                                className="neu-btn"
                                style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", padding: 0 }}
                                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDark ? <Sun size={15} style={{ color: "var(--accent-amber)" }} /> : <Moon size={15} style={{ color: "var(--accent-blue)" }} />}
                            </button>
                        )}
                        <button
                            className="neu-btn text-xs px-4 py-2"
                            style={{ color: "var(--text-muted)", fontSize: "13px" }}
                            onClick={() => { localStorage.removeItem("token"); window.location.href = "/auth" }}
                        >
                            Sign out
                        </button>
                    </div>

                    <button className="md:hidden neu-btn p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Clock bar */}
                {dateStr && (
                    <div
                        className="max-w-7xl mx-auto mt-2 flex items-center justify-between"
                        style={{ paddingTop: "8px", borderTop: "1px solid rgba(107, 122, 153, 0.1)" }}
                    >
                        <div className="flex items-center gap-2">
                            <div style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#2DC653",
                                boxShadow: "0 0 6px #2DC653",
                                animation: "pulse-dot 2s infinite",
                            }} />
                            <span style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                                fontWeight: 500,
                            }}>
                                {dateStr} · Rampur Block
                            </span>
                        </div>
                        <span style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                        }}>
                            {clock}
                        </span>
                    </div>
                )}

                {menuOpen && (
                    <div className="md:hidden mt-4 p-4 mx-4 rounded-2xl" style={{ boxShadow: "var(--shadow-raised)" }}>
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="nav-link relative px-4 py-3"
                                        onClick={() => setMenuOpen(false)}
                                        style={{ color: isActive ? "#FFFFFF" : "var(--text-muted)", background: "transparent", boxShadow: "none" }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavPillMobile"
                                                className="absolute inset-0"
                                                style={{ background: "var(--accent-blue)", boxShadow: "0 4px 10px rgba(67, 97, 238, 0.4)", borderRadius: "0.5rem", zIndex: -1 }}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span style={{ position: "relative", zIndex: 1, fontWeight: isActive ? 600 : 500 }}>{link.label}</span>
                                    </Link>
                                )
                            })}
                            <div className="pt-2 mt-2 flex items-center justify-between" style={{ borderTop: "1px solid rgba(107, 122, 153, 0.2)" }}>
                                <LanguageSwitcher />
                                <div className="flex items-center gap-2">
                                    {mounted && (
                                        <button
                                            onClick={toggle}
                                            className="neu-btn"
                                            style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.625rem", padding: 0 }}
                                        >
                                            {isDark ? <Sun size={13} style={{ color: "var(--accent-amber)" }} /> : <Moon size={13} style={{ color: "var(--accent-blue)" }} />}
                                        </button>
                                    )}
                                    <button
                                        className="neu-btn px-3 py-2"
                                        style={{ color: "var(--text-muted)", fontSize: "12px" }}
                                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/auth" }}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    )
}
