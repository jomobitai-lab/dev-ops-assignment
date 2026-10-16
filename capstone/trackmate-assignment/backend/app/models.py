"""Database tables (SQLAlchemy models)."""
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship

from .db import Base


class Exercise(Base):
    """Template library of exercises (plus any custom ones you add)."""
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    muscle_group = Column(String(60), nullable=False)   # e.g. Chest, Back, Legs
    equipment = Column(String(60), default="")          # e.g. Barbell, Dumbbell
    target_part = Column(String(80), default="")        # e.g. "Upper chest", "Hamstrings"
    body_parts = Column(String(120), default="")        # body-map keys, e.g. "chest,front-deltoids"
    is_custom = Column(Integer, default=0)              # 0 = template, 1 = user-added


class Workout(Base):
    """One workout session on a date, e.g. 'Chest + Triceps'."""
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    day_label = Column(String(120), nullable=False)     # e.g. "Chest + Triceps"
    notes = Column(Text, default="")
    sets = relationship(
        "WorkoutSet", back_populates="workout",
        cascade="all, delete-orphan", order_by="WorkoutSet.id",
    )


class WorkoutSet(Base):
    """A single set inside a workout (exercise + weight + reps)."""
    __tablename__ = "workout_sets"
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    set_number = Column(Integer, default=1)
    weight_kg = Column(Float, default=0)
    reps = Column(Integer, default=0)
    comment = Column(String(200), default="")
    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise")


class BodyWeight(Base):
    """Body weight logged on a date."""
    __tablename__ = "body_weight"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    weight_kg = Column(Float, nullable=False)


class NutritionLog(Base):
    """Daily calories and macros."""
    __tablename__ = "nutrition_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    calories = Column(Integer, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)


class Earning(Base):
    """A money-earned entry."""
    __tablename__ = "earnings"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    source = Column(String(120), nullable=False)   # e.g. Freelance, Internship
    amount = Column(Float, nullable=False)
    category = Column(String(60), default="")
    note = Column(String(200), default="")


class Achievement(Base):
    """A milestone / achievement you want to remember."""
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text, default="")


class SleepLog(Base):
    """Sleep: when you slept and when you woke up."""
    __tablename__ = "sleep_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)            # the night's date
    sleep_time = Column(DateTime, nullable=False)  # when you went to sleep
    wake_time = Column(DateTime, nullable=False)   # when you woke up
    hours = Column(Float, default=0)               # computed duration


class Goal(Base):
    """A target you set (weight, calories, protein, savings, weekly_workouts)."""
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(40), unique=True, nullable=False)
    target_value = Column(Float, nullable=False)
    note = Column(String(200), default="")


class Profile(Base):
    """Single-row user profile / preferences."""
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), default="")
    height_cm = Column(Float, default=0)
    default_rest_seconds = Column(Integer, default=90)   # default rest timer
    weekly_goal = Column(Integer, default=3)             # target gym days / week


class WorkoutPlan(Base):
    """A saved workout plan, e.g. 'Tuesday - Chest + Triceps' with its exercises."""
    __tablename__ = "workout_plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)       # e.g. "Tuesday - Chest + Triceps"
    muscle_groups = Column(String(200), default="")  # comma list, e.g. "Chest,Triceps"
    items = relationship(
        "WorkoutPlanExercise", back_populates="plan",
        cascade="all, delete-orphan", order_by="WorkoutPlanExercise.position",
    )


class WorkoutPlanExercise(Base):
    """An exercise inside a workout plan, in order."""
    __tablename__ = "workout_plan_exercises"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    position = Column(Integer, default=0)
    plan = relationship("WorkoutPlan", back_populates="items")
    exercise = relationship("Exercise")
