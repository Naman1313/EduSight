"use client"

import { useState, useEffect } from "react"

export function useDarkMode() {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const shouldBeDark = saved === "dark" || (!saved && prefersDark)
        setIsDark(shouldBeDark)
        if (shouldBeDark) document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
        setMounted(true)
    }, [])

    const toggle = () => {
        setIsDark((prev) => {
            const next = !prev
            localStorage.setItem("theme", next ? "dark" : "light")
            if (next) document.documentElement.classList.add("dark")
            else document.documentElement.classList.remove("dark")
            return next
        })
    }

    return { isDark, toggle, mounted }
}