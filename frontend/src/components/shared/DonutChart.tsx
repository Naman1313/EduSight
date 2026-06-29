"use client"

import { useEffect, useState } from "react"

interface DonutChartProps {
    high: number
    medium: number
    low: number
    size?: number
}

export default function DonutChart({ high, medium, low, size = 140 }: DonutChartProps) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        setTimeout(() => setAnimated(true), 100)
    }, [])

    const total = high + medium + low
    if (total === 0) return null

    const highPct = (high / total) * 100
    const medPct = (medium / total) * 100
    const lowPct = (low / total) * 100

    const cx = size / 2
    const cy = size / 2
    const r = size * 0.35
    const strokeWidth = size * 0.12
    const circumference = 2 * Math.PI * r

    const toRad = (deg: number) => (deg * Math.PI) / 180

    // Build arc segments
    const segments = [
        { pct: highPct, color: "#E63946", label: "High", count: high },
        { pct: medPct, color: "#F4A261", label: "Medium", count: medium },
        { pct: lowPct, color: "#2DC653", label: "Low", count: low },
    ]

    let currentAngle = -90 // start from top

    const arcs = segments.map((seg) => {
        const startAngle = currentAngle
        const sweepAngle = (seg.pct / 100) * 360
        currentAngle += sweepAngle

        const start = toRad(startAngle)
        const end = toRad(startAngle + sweepAngle - 1) // -1 for gap

        const x1 = cx + r * Math.cos(start)
        const y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end)
        const y2 = cy + r * Math.sin(end)

        const largeArc = sweepAngle > 180 ? 1 : 0

        return {
            ...seg,
            path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            dashArray: animated
                ? `${(sweepAngle / 360) * circumference} ${circumference}`
                : `0 ${circumference}`,
        }
    })

    return (
        <div className="flex items-center gap-6">
            {/* SVG Donut */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width={size} height={size}>
                    {/* Background track */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="var(--neu-dark, #C4CAD4)"
                        strokeWidth={strokeWidth}
                        style={{ opacity: 0.3 }}
                    />

                    {/* Segments */}
                    {arcs.map((arc, i) => (
                        <path
                            key={i}
                            d={arc.path}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            style={{
                                filter: `drop-shadow(0 0 4px ${arc.color}60)`,
                                transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        />
                    ))}

                    {/* Center text */}
                    <text
                        x={cx}
                        y={cy - 6}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize={size * 0.18}
                        fontWeight="700"
                        fontFamily="'JetBrains Mono', monospace"
                    >
                        {total}
                    </text>
                    <text
                        x={cx}
                        y={cy + size * 0.12}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize={size * 0.09}
                        fontWeight="500"
                    >
                        students
                    </text>
                </svg>

                {/* Inset shadow ring */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: `${r * 2 - strokeWidth}px`,
                    height: `${r * 2 - strokeWidth}px`,
                    borderRadius: "50%",
                    boxShadow: "var(--shadow-inset-sm)",
                    pointerEvents: "none",
                }} />
            </div>

            {/* Legend */}
            <div className="space-y-3 flex-1">
                {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: seg.color,
                                boxShadow: `0 0 6px ${seg.color}80`,
                                flexShrink: 0,
                            }} />
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                                {seg.label} risk
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: seg.color,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                {seg.count}
                            </span>
                            <span style={{
                                fontSize: "10px",
                                color: "var(--text-muted)",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                {Math.round(seg.pct)}%
                            </span>
                        </div>
                    </div>
                ))}

                {/* Mini bars */}
                <div
                    className="flex rounded-full overflow-hidden mt-2"
                    style={{
                        height: "6px",
                        boxShadow: "var(--shadow-inset-sm)",
                        gap: "1px",
                    }}
                >
                    {segments.map((seg) => (
                        <div
                            key={seg.label}
                            style={{
                                width: `${seg.pct}%`,
                                background: seg.color,
                                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: `0 0 4px ${seg.color}60`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}