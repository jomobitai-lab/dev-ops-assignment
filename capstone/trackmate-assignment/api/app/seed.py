"""Seed the exercise template library on first run.

Each row: (name, muscle_group, equipment, target_part, body_parts)
- target_part: human label of the sub-part it mainly hits (shown in the list).
- body_parts: comma list of body-map muscle keys to highlight for this exercise.
"""
from .models import Exercise

TEMPLATES = [
    # Chest
    ("Barbell Bench Press", "Chest", "Barbell", "Mid chest", "chest,front-deltoids,triceps"),
    ("Incline Dumbbell Press", "Chest", "Dumbbell", "Upper chest", "chest,front-deltoids"),
    ("Dumbbell Fly", "Chest", "Dumbbell", "Outer chest", "chest"),
    ("Push Up", "Chest", "Bodyweight", "Chest & triceps", "chest,triceps"),
    ("Cable Crossover", "Chest", "Cable", "Inner chest", "chest"),
    # Back
    ("Deadlift", "Back", "Barbell", "Lower back & traps", "lower-back,trapezius,hamstring,gluteal"),
    ("Pull Up", "Back", "Bodyweight", "Lats (upper back)", "upper-back,biceps"),
    ("Lat Pulldown", "Back", "Cable", "Lats", "upper-back,biceps"),
    ("Bent Over Row", "Back", "Barbell", "Mid back", "upper-back,lower-back,biceps"),
    ("Seated Cable Row", "Back", "Cable", "Mid back", "upper-back,biceps"),
    # Legs
    ("Barbell Squat", "Legs", "Barbell", "Quads & glutes", "quadriceps,gluteal"),
    ("Leg Press", "Legs", "Machine", "Quads", "quadriceps,gluteal"),
    ("Romanian Deadlift", "Legs", "Barbell", "Hamstrings", "hamstring,gluteal"),
    ("Leg Curl", "Legs", "Machine", "Hamstrings", "hamstring"),
    ("Leg Extension", "Legs", "Machine", "Quads", "quadriceps"),
    ("Calf Raise", "Legs", "Machine", "Calves", "calves"),
    # Shoulders
    ("Overhead Press", "Shoulders", "Barbell", "Front delts", "front-deltoids,triceps"),
    ("Dumbbell Lateral Raise", "Shoulders", "Dumbbell", "Side delts", "front-deltoids,back-deltoids"),
    ("Face Pull", "Shoulders", "Cable", "Rear delts", "back-deltoids,trapezius"),
    ("Arnold Press", "Shoulders", "Dumbbell", "Front & side delts", "front-deltoids,back-deltoids"),
    # Biceps
    ("Barbell Curl", "Biceps", "Barbell", "Biceps peak", "biceps"),
    ("Dumbbell Hammer Curl", "Biceps", "Dumbbell", "Biceps & forearm", "biceps,forearm"),
    ("Preacher Curl", "Biceps", "Machine", "Lower biceps", "biceps"),
    # Triceps
    ("Tricep Pushdown", "Triceps", "Cable", "Lateral head", "triceps"),
    ("Overhead Tricep Extension", "Triceps", "Dumbbell", "Long head", "triceps"),
    ("Close Grip Bench Press", "Triceps", "Barbell", "Triceps & chest", "triceps,chest"),
    ("Dips", "Triceps", "Bodyweight", "Triceps & lower chest", "triceps,chest"),
    # Forearms
    ("Wrist Curl", "Forearms", "Barbell", "Forearm flexors", "forearm"),
    ("Reverse Wrist Curl", "Forearms", "Dumbbell", "Forearm extensors", "forearm"),
    ("Farmer's Carry", "Forearms", "Dumbbell", "Grip & traps", "forearm,trapezius"),
    ("Reverse Barbell Curl", "Forearms", "Barbell", "Forearm & biceps", "forearm,biceps"),
    # Core
    ("Plank", "Core", "Bodyweight", "Whole core", "abs"),
    ("Hanging Leg Raise", "Core", "Bodyweight", "Lower abs", "abs"),
    ("Cable Crunch", "Core", "Cable", "Upper abs", "abs"),
]


def seed_exercises(db):
    """Insert template exercises only if the table is empty."""
    if db.query(Exercise).count() == 0:
        for name, group, equip, target, parts in TEMPLATES:
            db.add(Exercise(
                name=name, muscle_group=group, equipment=equip,
                target_part=target, body_parts=parts, is_custom=0,
            ))
        db.commit()
