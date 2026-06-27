"use client"

import { useState, useEffect } from "react"
import { LangCode, getTranslations } from "@/lib/i18n"

export function useTranslations() {
    const [t, setT] = useState(getTranslations("en"))
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const lang = (localStorage.getItem("lang") as LangCode) || "en"
        setT(getTranslations(lang))
        setMounted(true)
    }, [])

    return { t, mounted }
}