"""Seed the exercise template library on first run."""
from .models import Exercise

TEMPLATES = [
    # Chest
    ("Barbell Bench Press", "Chest", "Barbell"),
    ("Incline Dumbbell Press", "Chest", "Dumbbell"),
    ("Dumbbell Fly", "Chest", "Dumbbell"),
    ("Push Up", "Chest", "Bodyweight"),
    ("Cable Crossover", "Chest", "Cable"),
    # Back
    ("Deadlift", "Back", "Barbell"),
    ("Pull Up", "Back", "Bodyweight"),
    ("Lat Pulldown", "Back", "Cable"),
    ("Bent Over Row", "Back", "Barbell"),
    ("Seated Cable Row", "Back", "Cable"),
    # Legs
    ("Barbell Squat", "Legs", "Barbell"),
    ("Leg Press", "Legs", "Machine"),
    ("Romanian Deadlift", "Legs", "Barbell"),
    ("Leg Curl", "Legs", "Machine"),
    ("Leg Extension", "Legs", "Machine"),
    ("Calf Raise", "Legs", "Machine"),
    # Shoulders
    ("Overhead Press", "Shoulders", "Barbell"),
    ("Dumbbell Lateral Raise", "Shoulders", "Dumbbell"),
    ("Face Pull", "Shoulders", "Cable"),
    ("Arnold Press", "Shoulders", "Dumbbell"),
    # Biceps
    ("Barbell Curl", "Biceps", "Barbell"),
    ("Dumbbell Hammer Curl", "Biceps", "Dumbbell"),
    ("Preacher Curl", "Biceps", "Machine"),
    # Triceps
    ("Tricep Pushdown", "Triceps", "Cable"),
    ("Overhead Tricep Extension", "Triceps", "Dumbbell"),
    ("Close Grip Bench Press", "Triceps", "Barbell"),
    ("Dips", "Triceps", "Bodyweight"),
    # Forearms
    ("Wrist Curl", "Forearms", "Barbell"),
    ("Reverse Wrist Curl", "Forearms", "Dumbbell"),
    ("Farmer's Carry", "Forearms", "Dumbbell"),
    ("Reverse Barbell Curl", "Forearms", "Barbell"),
    # Core
    ("Plank", "Core", "Bodyweight"),
    ("Hanging Leg Raise", "Core", "Bodyweight"),
    ("Cable Crunch", "Core", "Cable"),
]


def seed_exercises(db):
    """Insert template exercises only if the table is empty."""
    if db.query(Exercise).count() == 0:
        for name, group, equip in TEMPLATES:
            db.add(Exercise(name=name, muscle_group=group, equipment=equip, is_custom=0))
        db.commit()
