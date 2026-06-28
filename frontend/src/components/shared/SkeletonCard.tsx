"use client"

export function SkeletonCard() {
    return (
        <div
            style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--shadow-raised)",
                borderRadius: "1.25rem",
                padding: "1.25rem",
                overflow: "hidden",
            }}
        >
            {/* Header skeleton */}
            <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                    <div className="skeleton-pulse" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                    <div className="space-y-2">
                        <div className="skeleton-pulse" style={{ width: "120px", height: "12px", borderRadius: "6px" }} />
                        <div className="skeleton-pulse" style={{ width: "80px", height: "10px", borderRadius: "6px" }} />
                    </div>
                </div>
                <div className="skeleton-pulse" style={{ width: "70px", height: "22px", borderRadius: "999px" }} />
            </div>

            {/* Gauge skeleton */}
            <div className="flex items-center gap-4 mb-4">
                <div className="skeleton-pulse" style={{ width: "96px", height: "96px", borderRadius: "50%", flexShrink: 0 }} />
                <div className="flex-1 space-y-2">
                    <div className="skeleton-pulse" style={{ width: "100%", height: "8px", borderRadius: "999px" }} />
                    <div className="skeleton-pulse" style={{ width: "80%", height: "8px", borderRadius: "999px" }} />
                    <div className="skeleton-pulse" style={{ width: "140px", height: "18px", borderRadius: "999px" }} />
                </div>
            </div>

            {/* Timestamp skeleton */}
            <div className="skeleton-pulse mb-3" style={{ width: "200px", height: "10px", borderRadius: "6px" }} />

            {/* Signals skeleton */}
            <div className="mb-4">
                <div className="skeleton-pulse mb-2" style={{ width: "100px", height: "10px", borderRadius: "6px" }} />
                <div className="flex flex-wrap gap-1.5">
                    {[100, 130, 110].map((w, i) => (
                        <div key={i} className="skeleton-pulse" style={{ width: `${w}px`, height: "24px", borderRadius: "999px" }} />
                    ))}
                </div>
            </div>

            {/* Graph skeleton */}
            <div className="skeleton-pulse mb-4" style={{ width: "100%", height: "80px", borderRadius: "0.75rem" }} />

            {/* Citation chips skeleton */}
            <div className="flex gap-1.5 mb-4">
                {[80, 90, 70].map((w, i) => (
                    <div key={i} className="skeleton-pulse" style={{ width: `${w}px`, height: "20px", borderRadius: "999px" }} />
                ))}
            </div>

            {/* Button skeleton */}
            <div className="skeleton-pulse" style={{ width: "100%", height: "38px", borderRadius: "0.75rem" }} />
        </div>
    )
}

export function SkeletonStatCard() {
    return (
        <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
                <div className="skeleton-pulse" style={{ width: "36px", height: "36px", borderRadius: "0.75rem" }} />
                <div className="skeleton-pulse" style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
            </div>
            <div className="skeleton-pulse mb-2" style={{ width: "80px", height: "10px", borderRadius: "6px" }} />
            <div className="skeleton-pulse mb-1" style={{ width: "60px", height: "36px", borderRadius: "8px" }} />
            <div className="skeleton-pulse" style={{ width: "100px", height: "10px", borderRadius: "6px" }} />
        </div>
    )
}

export function SkeletonSchoolRow() {
    return (
        <div
            style={{
                boxShadow: "var(--shadow-inset-sm)",
                borderRadius: "0.75rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <div className="space-y-2">
                <div className="skeleton-pulse" style={{ width: "160px", height: "12px", borderRadius: "6px" }} />
                <div className="skeleton-pulse" style={{ width: "80px", height: "10px", borderRadius: "6px" }} />
            </div>
            <div className="flex gap-2">
                {[60, 60, 50].map((w, i) => (
                    <div key={i} className="skeleton-pulse" style={{ width: `${w}px`, height: "24px", borderRadius: "999px" }} />
                ))}
            </div>
        </div>
    )
}