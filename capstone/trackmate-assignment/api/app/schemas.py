"""Pydantic request/response models."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel


# ---------- auth ----------
class LoginIn(BaseModel):
    password: str


class TokenOut(BaseModel):
    token: str


# ---------- exercises ----------
class ExerciseIn(BaseModel):
    name: str
    muscle_group: str
    equipment: str = ""
    target_part: str = ""
    body_parts: str = ""


class ExerciseOut(ExerciseIn):
    id: int
    is_custom: int
    model_config = {"from_attributes": True}


# ---------- workout sets ----------
class WorkoutSetIn(BaseModel):
    exercise_id: int
    set_number: int = 1
    weight_kg: float = 0
    reps: int = 0
    comment: str = ""


class WorkoutSetOut(WorkoutSetIn):
    id: int
    exercise_name: Optional[str] = None
    model_config = {"from_attributes": True}


# ---------- workouts ----------
class WorkoutIn(BaseModel):
    date: date
    day_label: str
    notes: str = ""
    sets: List[WorkoutSetIn] = []


class WorkoutOut(BaseModel):
    id: int
    date: date
    day_label: str
    notes: str
    sets: List[WorkoutSetOut] = []
    model_config = {"from_attributes": True}


# ---------- body weight ----------
class BodyWeightIn(BaseModel):
    date: date
    weight_kg: float


class BodyWeightOut(BodyWeightIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- nutrition ----------
class NutritionIn(BaseModel):
    date: date
    calories: int = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0


class NutritionOut(NutritionIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- earnings ----------
class EarningIn(BaseModel):
    date: date
    source: str
    amount: float
    category: str = ""
    note: str = ""


class EarningOut(EarningIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- achievements ----------
class AchievementIn(BaseModel):
    date: date
    title: str
    description: str = ""


class AchievementOut(AchievementIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- sleep ----------
class SleepIn(BaseModel):
    date: date
    sleep_time: datetime
    wake_time: datetime


class SleepOut(BaseModel):
    id: int
    date: date
    sleep_time: datetime
    wake_time: datetime
    hours: float
    model_config = {"from_attributes": True}


# ---------- goals ----------
class GoalIn(BaseModel):
    type: str
    target_value: float
    note: str = ""


class GoalOut(GoalIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- workout plans ----------
class PlanExerciseIn(BaseModel):
    exercise_id: int
    position: int = 0


class PlanExerciseOut(BaseModel):
    exercise_id: int
    position: int
    exercise_name: Optional[str] = None
    muscle_group: Optional[str] = None
    target_part: Optional[str] = None
    body_parts: Optional[str] = None
    model_config = {"from_attributes": True}


class PlanIn(BaseModel):
    name: str
    muscle_groups: str = ""
    items: List[PlanExerciseIn] = []


class PlanOut(BaseModel):
    id: int
    name: str
    muscle_groups: str
    items: List[PlanExerciseOut] = []
    model_config = {"from_attributes": True}


# ---------- profile ----------
class ProfileIn(BaseModel):
    name: str = ""
    height_cm: float = 0
    default_rest_seconds: int = 90
    weekly_goal: int = 3


class ProfileOut(ProfileIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- last performance / PR for an exercise ----------
class LastPerformanceOut(BaseModel):
    exercise_id: int
    exercise_name: str
    last_date: Optional[date] = None
    last_best_weight: Optional[float] = None   # heaviest set last session
    last_best_reps: Optional[int] = None
    last_comment: Optional[str] = None
    pr_weight: Optional[float] = None          # all-time heaviest
