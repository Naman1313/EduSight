"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/landing")
  }, [router])

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--neu-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "3px solid var(--accent-blue)",
        borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
