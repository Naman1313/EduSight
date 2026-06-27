"use client"

import { useState, useEffect } from "react"
import { LANGUAGES, LangCode, setCurrentLang } from "@/lib/i18n"
import { Globe } from "lucide-react"

export default function LanguageSwitcher() {
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState<LangCode>("en")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = (localStorage.getItem("lang") as LangCode) || "en"
        setCurrent(saved)
        setMounted(true)
    }, [])

    if (!mounted) return (
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe size={13} />
            <span>🇬🇧 English</span>
        </button>
    )

    const currentLang = LANGUAGES.find((l) => l.code === current)

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <Globe size={13} />
                <span>{currentLang?.flag} {currentLang?.label}</span>
            </button>

            {open && (
                <div className="absolute right-0 top-6 bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-36">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setCurrentLang(lang.code as LangCode)
                                setOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 ${current === lang.code ? "text-primary font-medium" : "text-foreground"
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}