"use client"

import { useState, useCallback } from "react"
import { ToastMessage, ToastType } from "@/components/shared/Toast"

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const addToast = useCallback((message: string, type: ToastType = "success", duration?: number) => {
        const id = Math.random().toString(36).slice(2)
        setToasts((prev) => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = {
        success: (msg: string, duration?: number) => addToast(msg, "success", duration),
        error: (msg: string, duration?: number) => addToast(msg, "error", duration),
        info: (msg: string, duration?: number) => addToast(msg, "info", duration),
    }

    return { toasts, toast, removeToast }
}