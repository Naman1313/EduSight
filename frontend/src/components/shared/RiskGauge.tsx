"use client"

import { useEffect, useState } from "react"

interface RiskGaugeProps {
    score: number
    size?: number
}

export default function RiskGauge({ score, size = 80 }: RiskGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0)

    useEffect(() => {
        const duration = 1000
        const steps = 60
        const increment = score / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= score) {
                setAnimatedScore(score)
                clearInterval(timer)
            } else {
                setAnimatedScore(Math.round(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [score])

    const getColor = (s: number) => {
        if (s >= 70) return "#E63946"
        if (s >= 40) return "#F4A261"
        return "#2DC653"
    }

    const color = getColor(score)

    // SVG arc math
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38
    const strokeWidth = size * 0.09

    // Arc goes from 150deg to 390deg (240deg sweep)
    const startAngle = 150
    const totalAngle = 240

    const toRad = (deg: number) => (deg * Math.PI) / 180

    const arcPath = (startDeg: number, endDeg: number) => {
        const start = toRad(startDeg)
        const end = toRad(endDeg)
        const x1 = cx + r * Math.cos(start)
        const y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end)
        const y2 = cy + r * Math.sin(end)
        const largeArc = endDeg - startDeg > 180 ? 1 : 0
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    }

    const fillAngle = startAngle + (animatedScore / 100) * totalAngle

    // Needle
    const needleAngle = toRad(startAngle + (animatedScore / 100) * totalAngle)
    const needleLen = r * 0.75
    const nx = cx + needleLen * Math.cos(needleAngle)
    const ny = cy + needleLen * Math.sin(needleAngle)

    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Track */}
                <path
                    d={arcPath(startAngle, startAngle + totalAngle)}
                    fill="none"
                    stroke="#C4CAD4"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(inset 2px 2px 4px #C4CAD4)" }}
                />
                {/* Fill */}
                <path
                    d={arcPath(startAngle, Math.min(fillAngle, startAngle + totalAngle))}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 4px ${color}80)`,
                        transition: "stroke 0.5s ease",
                    }}
                />
                {/* Center dot */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={strokeWidth * 0.6}
                    fill={color}
                    style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                />
                {/* Needle */}
                <line
                    x1={cx}
                    y1={cy}
                    x2={nx}
                    y2={ny}
                    stroke={color}
                    strokeWidth={strokeWidth * 0.25}
                    strokeLinecap="round"
                    style={{ transition: "all 0.05s linear" }}
                />
                {/* Score text */}
                <text
                    x={cx}
                    y={cy + r * 0.55}
                    textAnchor="middle"
                    fill={color}
                    fontSize={size * 0.18}
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                >
                    {animatedScore}
                </text>
                <text
                    x={cx}
                    y={cy + r * 0.85}
                    textAnchor="middle"
                    fill="#6B7A99"
                    fontSize={size * 0.09}
                    fontWeight="500"
                >
                    /100
                </text>
            </svg>
        </div>
    )
}