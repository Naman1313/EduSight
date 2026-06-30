import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function Footer() {
    return (
        <footer style={{
            borderTop: "1px solid rgba(107, 122, 153, 0.15)",
            padding: "2rem 1.5rem",
            textAlign: "center",
            marginTop: "auto",
            background: "var(--neu-bg)",
        }}>
            <Link href="/landing" className="flex items-center justify-center gap-3 mb-3" style={{ textDecoration: 'none' }}>
                <div style={{
                    width: "28px", height: "28px", borderRadius: "0.5rem",
                    background: "var(--neu-bg)", boxShadow: "var(--shadow-raised-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <GraduationCap size={14} style={{ color: "var(--accent-blue)" }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>EduSight</p>
            </Link>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Built for India's Block Education Officers · Powered by XGBoost, LangChain, and EasyOCR
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", opacity: 0.6 }}>
                Evidence base: ASER 2022, Pratham Annual Report, Ministry of Education UDISE+ Data
            </p>
        </footer>
    )
}
