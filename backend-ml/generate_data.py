import pandas as pd
import random
import uuid

random.seed(42)

schools = [
    {"id": "SCH001", "name": "Govt. PS Rampur"},
    {"id": "SCH002", "name": "Govt. PS Nandpur"},
    {"id": "SCH003", "name": "Govt. PS Lakhanpur"},
]

classes = ["6", "7", "8", "9", "10"]
names = [
    "Ravi Kumar", "Priya Devi", "Arjun Singh", "Sunita Verma",
    "Mohan Lal", "Geeta Kumari", "Vikram Yadav", "Anjali Sharma",
    "Deepak Gupta", "Kavita Patel", "Rahul Mishra", "Pooja Tiwari",
    "Amit Chauhan", "Nisha Rawat", "Suresh Pandey", "Rekha Rani",
    "Dinesh Kumar", "Savita Devi", "Rajesh Verma", "Anita Singh",
]

records = []
for i in range(200):
    school = random.choice(schools)
    dropout_prone = random.random() < 0.3
    record = {
        "student_id": f"STU{str(i+1).zfill(4)}",
        "name": random.choice(names),
        "class_grade": random.choice(classes),
        "school_id": school["id"],
        "school_name": school["name"],
        "absences_this_month": random.randint(10, 20) if dropout_prone else random.randint(0, 5),
        "absence_streak": random.randint(5, 14) if dropout_prone else random.randint(0, 3),
        "math_score": random.randint(15, 39) if dropout_prone else random.randint(40, 95),
        "science_score": random.randint(15, 45) if dropout_prone else random.randint(40, 95),
        "seasonal_flag": random.random() < 0.4 if dropout_prone else False,
        "dropout_label": 1 if dropout_prone else 0,
    }
    records.append(record)

df = pd.DataFrame(records)
df.to_csv("students.csv", index=False)
print(f"Generated {len(df)} student records → students.csv")
print(f"Dropout prone: {df['dropout_label'].sum()} students")