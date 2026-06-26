import easyocr
import re
import numpy as np

reader = easyocr.Reader(['en'], gpu=False, verbose=False)

SUBJECT_KEYWORDS = [
    "mathematics", "math", "science", "hindi", "english",
    "social", "sanskrit", "computer", "biology", "chemistry",
    "physics", "history", "geography", "civics"
]

def extract_marks_from_image(image_path: str) -> dict:
    result = reader.readtext(image_path)

    lines = [text.strip().lower() for (_, text, _) in result]
    raw_text = " | ".join(lines)
    subjects = []

    for i, line in enumerate(lines):
        matched_subject = None
        for keyword in SUBJECT_KEYWORDS:
            if keyword in line:
                matched_subject = keyword.capitalize()
                break

        if matched_subject:
            marks = None
            search_range = lines[i:i+3]
            for nearby in search_range:
                numbers = re.findall(r"\b(\d{1,3})\b", nearby)
                for num in numbers:
                    if 0 <= int(num) <= 100:
                        marks = int(num)
                        break
                if marks is not None:
                    break

            if marks is not None:
                subjects.append({
                    "subject": matched_subject,
                    "marks": marks
                })

    return {
        "subjects": subjects if subjects else [
            {"subject": "Mathematics", "marks": 0},
            {"subject": "Science", "marks": 0},
        ],
        "raw_text": raw_text
    }