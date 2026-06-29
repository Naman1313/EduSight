"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

interface ConfettiProps {
    trigger: boolean
    count?: number
}

export default function Confetti({ trigger, count = 5 }: ConfettiProps) {
    useEffect(() => {
        if (!trigger) return

        const duration = 2000
        const end = Date.now() + duration

        const colors = ["#4361EE", "#2DC653", "#E63946", "#F4A261", "#E8EDF2"]

        const frame = () => {
            confetti({
                particleCount: count,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
                shapes: ["circle", "square"],
                scalar: 0.9,
            })
            confetti({
                particleCount: count,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
                shapes: ["circle", "square"],
                scalar: 0.9,
            })
            if (Date.now() < end) requestAnimationFrame(frame)
        }

        frame()
    }, [trigger])

    return null
}