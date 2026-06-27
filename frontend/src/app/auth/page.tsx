"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AuthPage() {
    const [email, setEmail] = useState("rajiv@education.gov.in")
    const [password, setPassword] = useState("demo1234")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

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

        } catch (err) {
            setError("Cannot connect to server. Make sure backend is running on port 5000.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">EduSight</h1>
                    <p className="text-muted-foreground text-sm">
                        Early warning system for school dropout prevention
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Sign in</CardTitle>
                        <CardDescription>
                            Enter your BEO or NGO credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="officer@education.gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button className="w-full" onClick={handleAuth} disabled={loading}>
                            {loading ? "Please wait..." : "Sign in"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Demo credentials are pre-filled
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}