"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastProps {
    toast: ToastMessage
    onRemove: (id: string) => void
}

function Toast({ toast, onRemove }: ToastProps) {
    const [visible, setVisible] = useState(false)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 10)
        const timer = setTimeout(() => {
            setLeaving(true)
            setTimeout(() => onRemove(toast.id), 300)
        }, toast.duration || 3500)
        return () => clearTimeout(timer)
    }, [])

    const configs = {
        success: {
            icon: CheckCircle,
            color: "var(--accent-green)",
            bg: "var(--accent-green-light)",
            border: "#2DC65330",
        },
        error: {
            icon: AlertTriangle,
            color: "var(--accent-red)",
            bg: "var(--accent-red-light)",
            border: "#E6394630",
        },
        info: {
            icon: Info,
            color: "var(--accent-blue)",
            bg: "var(--accent-blue-light)",
            border: "#4361EE30",
        },
    }

    const cfg = configs[toast.type]
    const Icon = cfg.icon

    return (
        <div
            style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--shadow-raised)",
                borderRadius: "1rem",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "280px",
                maxWidth: "360px",
                transform: visible && !leaving
                    ? "translateX(0) scale(1)"
                    : "translateX(100%) scale(0.9)",
                opacity: visible && !leaving ? 1 : 0,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderLeft: `3px solid ${cfg.color}`,
            }}
        >
            <div
                style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "0.5rem",
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <p style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                flex: 1,
                lineHeight: 1.4,
            }}>
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setLeaving(true)
                    setTimeout(() => onRemove(toast.id), 300)
                }}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                }}
            >
                <X size={13} />
            </button>
        </div>
    )
}

export function ToastContainer({ toasts, onRemove }: {
    toasts: ToastMessage[]
    onRemove: (id: string) => void
}) {
    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "flex-end",
            }}
        >
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}