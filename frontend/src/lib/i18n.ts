export const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { code: "te", label: "తెలుగు", flag: "🇮🇳" },
    { code: "mr", label: "मराठी", flag: "🇮🇳" },
    { code: "bn", label: "বাংলা", flag: "🇮🇳" },
    { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
]

export type LangCode = "en" | "hi" | "ta" | "te" | "mr" | "bn" | "kn"

export function getCurrentLang(): LangCode {
    if (typeof window === "undefined") return "en"
    return (localStorage.getItem("lang") as LangCode) || "en"
}

export function getTranslations(lang: LangCode) {
    const translations: Record<LangCode, any> = {
        en: require("@/messages/en.json"),
        hi: require("@/messages/hi.json"),
        ta: require("@/messages/ta.json"),
        te: require("@/messages/te.json"),
        mr: require("@/messages/mr.json"),
        bn: require("@/messages/bn.json"),
        kn: require("@/messages/kn.json"),
    }
    return translations[lang] || translations["en"]
}

export function setCurrentLang(lang: LangCode) {
    localStorage.setItem("lang", lang)
    window.location.reload()
}