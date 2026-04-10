"""ML module re-exports."""

import logging

logger = logging.getLogger(__name__)

try:
    from brain_svc.ml.base_brain_model import BaseBrainModel, FUNCTIONING_LEVEL_MAP
except ImportError:
    logger.warning("PyTorch not available — BaseBrainModel disabled")
    BaseBrainModel = None  # type: ignore[assignment, misc]
    FUNCTIONING_LEVEL_MAP = {
        "STANDARD": 0,
        "SUPPORTED": 1,
        "LOW_VERBAL": 2,
        "NON_VERBAL": 3,
        "PRE_SYMBOLIC": 4,
    }

from brain_svc.ml.difficulty_adapter import (
    DifficultyProfile,
    compute_difficulty_profile,
    get_difficulty_for_step,
)
from brain_svc.ml.mastery_engine import (
    BKTParams,
    MasteryEngine,
    MasteryUpdate,
    SkillMastery,
    SM2State,
)

try:
    from brain_svc.ml.model_store import ModelStore
except ImportError:
    logger.warning("ModelStore not available — torch dependency missing")
    ModelStore = None  # type: ignore[assignment, misc]

__all__ = [
    "BaseBrainModel",
    "BKTParams",
    "DifficultyProfile",
    "FUNCTIONING_LEVEL_MAP",
    "MasteryEngine",
    "MasteryUpdate",
    "ModelStore",
    "SkillMastery",
    "SM2State",
    "compute_difficulty_profile",
    "get_difficulty_for_step",
]
