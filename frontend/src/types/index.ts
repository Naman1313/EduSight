export interface RiskHistory {
    risk_score: number
    risk_level: string
    recorded_at: string
}

export interface Student {
    _id: string
    name: string
    class_grade: string
    school_id: string
    school_name: string
    absences_this_month: number
    absence_streak: number
    math_score: number
    science_score: number
    seasonal_flag: boolean
    risk_score: number
    risk_level: "high" | "medium" | "low"
    top_signals: string[]
    intervention_action?: string
    status: "pending" | "actioned"
    risk_history: RiskHistory[]
}

export interface School {
    _id: string
    name: string
    block: string
    total_students: number
    high_risk: number
    medium_risk: number
    low_risk: number
}

export interface User {
    _id: string
    name: string
    email: string
    role: "beo" | "ngo"
    block: string
}