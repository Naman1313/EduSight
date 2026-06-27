"use client"

import { useEffect, useState } from "react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { RiskHistory } from "@/types"

interface RiskTrendGraphProps {
    studentId: string
    studentName: string
    currentScore: number
}

interface ChartDataPoint {
    date: string
    score: number
    level: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const score = payload[0].value
        const color = score >= 70 ? "#E24B4A" : score >= 40 ? "#EF9F27" : "#4CAF50"
        return (
            <div className="bg-background border border-border rounded-lg p-2 shadow-sm">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold" style={{ color }}>
                    Risk score: {score}
                </p>
            </div>
        )
    }
    return null
}

export default function RiskTrendGraph({
    studentId,
    studentName,
    currentScore,
}: RiskTrendGraphProps) {
    const [history, setHistory] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [studentId])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await fetch(
                `http://localhost:5000/api/students/${studentId}/history`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            const data = await res.json()
            if (res.ok && data.risk_history) {
                const chartData = data.risk_history.map((h: RiskHistory) => ({
                    date: new Date(h.recorded_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                    }),
                    score: h.risk_score,
                    level: h.risk_level,
                }))
                if (chartData.length === 0) {
                    chartData.push({
                        date: "Now",
                        score: currentScore,
                        level: currentScore >= 70 ? "high" : currentScore >= 40 ? "medium" : "low",
                    })
                }
                setHistory(chartData)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getTrend = () => {
        if (history.length < 2) return "stable"
        const first = history[0].score
        const last = history[history.length - 1].score
        if (last > first + 5) return "rising"
        if (last < first - 5) return "falling"
        return "stable"
    }

    const trend = getTrend()
    const scoreColor = currentScore >= 70
        ? "#E24B4A"
        : currentScore >= 40
            ? "#EF9F27"
            : "#4CAF50"

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                    Risk score trend
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${trend === "rising"
                        ? "text-red-600"
                        : trend === "falling"
                            ? "text-green-600"
                            : "text-muted-foreground"
                    }`}>
                    {trend === "rising" && <><TrendingUp size={12} /> Worsening</>}
                    {trend === "falling" && <><TrendingDown size={12} /> Improving</>}
                    {trend === "stable" && <><Minus size={12} /> Stable</>}
                </div>
            </div>

            {loading ? (
                <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">
                    Loading trend...
                </div>
            ) : (
                <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={70} stroke="#E24B4A" strokeDasharray="3 3" strokeWidth={1} />
                            <ReferenceLine y={40} stroke="#EF9F27" strokeDasharray="3 3" strokeWidth={1} />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke={scoreColor}
                                strokeWidth={2}
                                dot={{ fill: scoreColor, r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-red-500 inline-block"></span> High (70+)
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-yellow-500 inline-block"></span> Medium (40+)
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-green-500 inline-block"></span> Low
                </span>
            </div>
        </div>
    )
}