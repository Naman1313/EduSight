import json
import os

messages_dir = '/home/namanmahaal13/Documents/Coding Baazi/Projects/EduSight/frontend/src/messages'

translations = {
    "schools": {
        "title": {"en": "School Overview", "hi": "स्कूल अवलोकन"},
        "subtitle": {"en": "Block-level dropout risk across all monitored schools", "hi": "सभी निगरानी वाले स्कूलों में ब्लॉक-स्तर के ड्रॉपआउट जोखिम"},
        "totalSchools": {"en": "Total schools", "hi": "कुल स्कूल"},
        "totalStudents": {"en": "Total students", "hi": "कुल छात्र"},
        "highRisk": {"en": "High risk", "hi": "उच्च जोखिम"},
        "actionsPending": {"en": "Actions pending", "hi": "लंबित कार्रवाइयां"},
        "loading": {"en": "Loading school data...", "hi": "स्कूल डेटा लोड हो रहा है..."},
        "noData": {"en": "No school data found.", "hi": "कोई स्कूल डेटा नहीं मिला।"},
        "inYourBlock": {"en": "Schools in your block", "hi": "आपके ब्लॉक में स्कूल"},
        "studentsEnrolled": {"en": "students enrolled", "hi": "छात्र नामांकित"},
        "clickToView": {"en": "View all students →", "hi": "सभी छात्र देखें →"},
        "needAction": {"en": "need immediate action", "hi": "तत्काल कार्रवाई की आवश्यकता है"},
        "critical": {"en": "Critical", "hi": "गंभीर"},
        "needsAttention": {"en": "Needs attention", "hi": "ध्यान देने की आवश्यकता है"},
        "stable": {"en": "Stable", "hi": "स्थिर"}
    },
    "interventions": {
        "title": {"en": "Intervention Tracker", "hi": "हस्तक्षेप ट्रैकर"},
        "subtitle": {"en": "History and success rate of all interventions", "hi": "सभी हस्तक्षेपों का इतिहास और सफलता दर"},
        "total": {"en": "Total", "hi": "कुल"},
        "successRate": {"en": "Success rate", "hi": "सफलता दर"},
        "ofFollowedUpCases": {"en": "of followed-up cases", "hi": "फॉलो-अप मामलों में"},
        "avgScoreBefore": {"en": "Avg score before", "hi": "पहले का औसत स्कोर"},
        "avgScoreAfter": {"en": "Avg score after", "hi": "बाद का औसत स्कोर"},
        "awaitingFollowUp": {"en": "awaiting follow-up", "hi": "फॉलो-अप की प्रतीक्षा में"},
        "riskScoreComparison": {"en": "Risk score: Before vs After intervention", "hi": "जोखिम स्कोर: हस्तक्षेप से पहले बनाम बाद में"},
        "chartSubtitle": {"en": "Comparing dropout risk scores before and after action was taken", "hi": "कार्रवाई से पहले और बाद के ड्रॉपआउट जोखिम स्कोर की तुलना"},
        "all": {"en": "All", "hi": "सभी"},
        "completed": {"en": "Completed", "hi": "पूरा हुआ"},
        "pending": {"en": "Pending", "hi": "लंबित"},
        "loading": {"en": "Loading interventions...", "hi": "हस्तक्षेप लोड हो रहे हैं..."},
        "noInterventions": {"en": "No interventions recorded yet.", "hi": "अभी तक कोई हस्तक्षेप दर्ज नहीं किया गया।"},
        "goToStudents": {"en": "Go to Students →", "hi": "छात्रों पर जाएँ →"},
        "before": {"en": "Before", "hi": "पहले"},
        "after": {"en": "After", "hi": "बाद में"},
        "significantImprovement": {"en": "✓ Significant Improvement", "hi": "✓ महत्वपूर्ण सुधार"},
        "minimalChange": {"en": "~ Minimal Change", "hi": "~ न्यूनतम परिवर्तन"},
        "actionLog": {"en": "Action Log", "hi": "कार्रवाई लॉग"},
        "scorePlaceholder": {"en": "Score (0-100)", "hi": "स्कोर (0-100)"},
        "save": {"en": "Save", "hi": "सहेजें"},
        "cancel": {"en": "Cancel", "hi": "रद्द करें"},
        "saving": {"en": "Saving...", "hi": "सहेजा जा रहा है..."},
        "addFollowUp": {"en": "+ Add Follow-up Score", "hi": "+ फॉलो-अप स्कोर जोड़ें"},
        "followUpComplete": {"en": "Follow-up Complete", "hi": "फॉलो-अप पूरा हुआ"},
        "risk": {"en": "risk", "hi": "जोखिम"}
    },
    "ocr": {
        "title": {"en": "Mark Sheet Scanner", "hi": "मार्क शीट स्कैनर"},
        "subtitle": {"en": "Upload a photo of a physical mark sheet to extract grades automatically", "hi": "स्वचालित रूप से ग्रेड निकालने के लिए एक भौतिक मार्क शीट की तस्वीर अपलोड करें"},
        "uploadPhoto": {"en": "Upload mark sheet photo", "hi": "मार्क शीट फोटो अपलोड करें"},
        "uploadDesc": {"en": "Take a clear photo of the mark sheet and upload it here", "hi": "मार्क शीट की एक स्पष्ट तस्वीर लें और इसे यहां अपलोड करें"},
        "dropPhoto": {"en": "Drop photo here or click to browse", "hi": "फोटो यहां छोड़ें या ब्राउज़ करने के लिए क्लिक करें"},
        "scanning": {"en": "Scanning...", "hi": "स्कैन किया जा रहा है..."},
        "scan": {"en": "Scan mark sheet", "hi": "मार्क शीट स्कैन करें"},
        "extractedGrades": {"en": "Extracted grades", "hi": "निकाले गए ग्रेड"},
        "extractedDesc": {"en": "Grades detected from the mark sheet photo", "hi": "मार्क शीट फोटो से पहचाने गए ग्रेड"},
        "averageScore": {"en": "Average Score", "hi": "औसत स्कोर"},
        "pass": {"en": "Pass", "hi": "उत्तीर्ण"},
        "fail": {"en": "Fail", "hi": "अनुत्तीर्ण"},
        "average": {"en": "Average", "hi": "औसत"},
        "change": {"en": "Change", "hi": "बदलें"}
    },
    "riskCard": {
        "riskOfDroppingOut": {"en": "Risk of dropping out (60 days)", "hi": "ड्रॉपआउट का जोखिम (60 दिन)"},
        "warningSignals": {"en": "Warning Signals", "hi": "चेतावनी संकेत"},
        "riskTrend": {"en": "Risk Trend", "hi": "जोखिम प्रवृत्ति"},
        "actionCompleted": {"en": "Action Completed", "hi": "कार्रवाई पूरी हुई"},
        "recommendedAction": {"en": "Recommended Action", "hi": "अनुशंसित कार्रवाई"},
        "interventionStrategyFor": {"en": "Intervention strategy for", "hi": "के लिए हस्तक्षेप रणनीति"},
        "close": {"en": "Close", "hi": "बंद करें"},
        "markingActioned": {"en": "Marking Actioned...", "hi": "कार्रवाई की जा रही है..."},
        "markActioned": {"en": "Mark Actioned", "hi": "कार्रवाई पूरी हुई"},
        "now": {"en": "Now", "hi": "अभी"},
        "riskScoreTrend": {"en": "Risk score trend", "hi": "जोखिम स्कोर प्रवृत्ति"},
        "worsening": {"en": "Worsening", "hi": "बदतर"},
        "improving": {"en": "Improving", "hi": "सुधार"},
        "stable": {"en": "Stable", "hi": "स्थिर"},
        "loadingTrend": {"en": "Loading trend...", "hi": "प्रवृत्ति लोड हो रही है..."}
    }
}

languages = ["en", "hi", "ta", "te", "mr", "bn", "kn"]

for lang in languages:
    file_path = os.path.join(messages_dir, f"{lang}.json")
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for category, keys in translations.items():
        if category not in data:
            data[category] = {}
        
        for key, trans in keys.items():
            # Fallback to English if translation for this language doesn't exist
            val = trans.get(lang, trans.get("en", ""))
            data[category][key] = val
                
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

print("Translations updated successfully.")
