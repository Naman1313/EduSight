"use client"

import { useEffect, useState, useRef } from "react"

interface AnimatedCounterProps {
    value: number
    duration?: number
    suffix?: string
    prefix?: string
    style?: React.CSSProperties
    className?: string
}

export default function AnimatedCounter({
    value,
    duration = 1200,
    suffix = "",
    prefix = "",
    style,
    className,
}: AnimatedCounterProps) {
    const [display, setDisplay] = useState(0)
    const [hasAnimated, setHasAnimated] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasAnimated(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!hasAnimated) return;

        const steps = 60
        const stepDuration = duration / steps
        let current = 0
        let step = 0

        const timer = setInterval(() => {
            step++
            // Ease out cubic
            const progress = 1 - Math.pow(1 - step / steps, 3)
            current = Math.round(value * progress)
            setDisplay(current)
            if (step >= steps) {
                setDisplay(value)
                clearInterval(timer)
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [value, hasAnimated, duration])

    return (
        <span ref={ref} style={style} className={className}>
            {prefix}{display}{suffix}
        </span>
    )
}