"use client"

import { useState } from "react"
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react"

export default function AuthPage() {
    const [email, setEmail] = useState("rajiv@education.gov.in")
    const [password, setPassword] = useState("demo1234")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [isRegistering, setIsRegistering] = useState(false)

    const handleAuth = async () => {
        setLoading(true)
        setError("")
        try {
            let res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            if (res.status === 400) {
                res = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Rajiv Sharma",
                        email,
                        password,
                        role: "beo",
                        block: "Rampur Block",
                    }),
                })
            }
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || "Something went wrong")
                return
            }
            localStorage.setItem("token", data.token)
            window.location.href = "/dashboard"
        } catch {
            setError("Cannot connect to server. Make sure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{ background: "var(--neu-bg)" }}
        >
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div
                        className="w-20 h-20 mx-auto flex items-center justify-center"
                        style={{
                            background: "var(--neu-bg)",
                            boxShadow: "var(--shadow-raised)",
                            borderRadius: "1.5rem",
                        }}
                    >
                        <GraduationCap size={36} style={{ color: "var(--accent-blue)" }} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.04em",
                        }}>
                            EduSight
                        </h1>
                        <p style={{
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            fontWeight: 500,
                            marginTop: "4px",
                        }}>
                            Dropout Prevention Early Warning System
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div
                    className="p-8 space-y-6"
                    style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--shadow-raised)",
                        borderRadius: "1.5rem",
                    }}
                >
                    <div>
                        <h2 style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                        }}>
                            Sign in to your account
                        </h2>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Enter your BEO or NGO credentials
                        </p>
                    </div>

                    <div className="space-y-4">

                        {/* Email */}
                        <div className="space-y-2">
                            <label style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}>
                                Email address
                            </label>
                            <div className="relative">
                                <Mail
                                    size={15}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                    }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="neu-input w-full"
                                    style={{
                                        paddingLeft: "40px",
                                        paddingRight: "14px",
                                        paddingTop: "12px",
                                        paddingBottom: "12px",
                                        fontSize: "14px",
                                    }}
                                    placeholder="officer@education.gov.in"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={15}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                    }}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="neu-input w-full"
                                    style={{
                                        paddingLeft: "40px",
                                        paddingRight: "14px",
                                        paddingTop: "12px",
                                        paddingBottom: "12px",
                                        fontSize: "14px",
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                    </div>

                    {error && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl"
                            style={{
                                background: "var(--accent-red-light)",
                                color: "var(--accent-red)",
                                fontSize: "13px",
                            }}
                        >
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        className="neu-btn-primary w-full py-3"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                        onClick={handleAuth}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        textAlign: "center",
                    }}>
                        Demo credentials are pre-filled
                    </p>
                </div>

                {/* Footer */}
                <p style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                }}>
                    EduSight · Built for India's Block Education Officers
                </p>
            </div>
        </div>
    )
}