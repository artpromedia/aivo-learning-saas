"""BKT/DKT mastery engine — computes mastery updates after interactions.

Uses Bayesian Knowledge Tracing (BKT) update rule:
  P(L_n | obs) = P(L_n | correct) or P(L_n | incorrect)
with per-skill parameters P(T), P(G), P(S).

The PyTorch BaseBrainModel provides a learned prior that refines BKT
estimates using attention over the full skill graph.
"""

from __future__ import annotations

import copy
import logging
from dataclasses import dataclass, field

import torch

from brain_svc.ml.base_brain_model import (
    FUNCTIONING_LEVEL_MAP,
    BaseBrainModel,
)

logger = logging.getLogger(__name__)


@dataclass
class BKTParams:
    """Per-skill BKT parameters."""

    p_init: float = 0.1   # Initial probability of knowing
    p_transit: float = 0.1  # Probability of learning per opportunity
    p_guess: float = 0.2   # Probability of correct answer when not known
    p_slip: float = 0.1    # Probability of incorrect answer when known


@dataclass
class SkillMastery:
    """Current mastery state for a single skill."""

    skill_id: str
    p_known: float = 0.1
    attempts: int = 0
    correct_count: int = 0
    last_interaction_ts: float = 0.0
    review_interval_days: float = 1.0
    next_review_ts: float = 0.0


@dataclass
class MasteryUpdate:
    """Result of a mastery update for one skill."""

    skill: str
    previous_level: float
    new_level: float
    delta: float


@dataclass
class SM2State:
    """SuperMemo-2 spaced repetition state."""

    easiness: float = 2.5
    interval: float = 1.0
    repetitions: int = 0


def sm2_update(state: SM2State, quality: int) -> SM2State:
    """Update SM-2 state given a quality score 0–5."""
    quality = max(0, min(5, quality))
    new_state = SM2State(
        easiness=state.easiness,
        interval=state.interval,
        repetitions=state.repetitions,
    )
    if quality >= 3:
        if new_state.repetitions == 0:
            new_state.interval = 1.0
        elif new_state.repetitions == 1:
            new_state.interval = 6.0
        else:
            new_state.interval = state.interval * state.easiness
        new_state.repetitions += 1
    else:
        new_state.repetitions = 0
        new_state.interval = 1.0

    new_state.easiness = max(
        1.3,
        state.easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    )
    return new_state


class MasteryEngine:
    """Orchestrates BKT updates and neural mastery prediction."""

    def __init__(self, model: BaseBrainModel) -> None:
        self.model = model
        self.model.eval()
        self._bkt_params: dict[str, BKTParams] = {}
        self._sm2_states: dict[str, SM2State] = {}

    def clone(self) -> MasteryEngine:
        """Deep-copy this engine (model weights + BKT params)."""
        cloned_model = copy.deepcopy(self.model)
        engine = MasteryEngine(cloned_model)
        engine._bkt_params = copy.deepcopy(self._bkt_params)
        engine._sm2_states = copy.deepcopy(self._sm2_states)
        return engine

    def get_bkt_params(self, skill: str) -> BKTParams:
        if skill not in self._bkt_params:
            self._bkt_params[skill] = BKTParams()
        return self._bkt_params[skill]

    def bkt_update(self, skill: str, p_known: float, is_correct: bool) -> float:
        """Single BKT update step.

        Returns updated P(L).
        """
        params = self.get_bkt_params(skill)

        if is_correct:
            p_correct_given_known = 1.0 - params.p_slip
            p_correct_given_unknown = params.p_guess
            p_known_posterior = (
                p_known * p_correct_given_known
                / (p_known * p_correct_given_known + (1 - p_known) * p_correct_given_unknown)
            )
        else:
            p_incorrect_given_known = params.p_slip
            p_incorrect_given_unknown = 1.0 - params.p_guess
            p_known_posterior = (
                p_known * p_incorrect_given_known
                / (p_known * p_incorrect_given_known + (1 - p_known) * p_incorrect_given_unknown)
            )

        # Learning transition
        p_known_updated = p_known_posterior + (1 - p_known_posterior) * params.p_transit
        return max(0.0, min(1.0, p_known_updated))

    def update_mastery(
        self,
        mastery_levels: dict[str, SkillMastery],
        skill: str,
        is_correct: bool,
        difficulty: float,
        functioning_level: str,
        timestamp: float,
    ) -> MasteryUpdate:
        """Update mastery for a single skill after an interaction.

        Combines BKT update with neural model prediction.
        """
        if skill not in mastery_levels:
            mastery_levels[skill] = SkillMastery(skill_id=skill)

        sm = mastery_levels[skill]
        previous = sm.p_known

        # BKT update
        bkt_result = self.bkt_update(skill, sm.p_known, is_correct)

        # Neural prediction (single interaction)
        skill_idx = hash(skill) % self.model.num_skills
        fl_idx = FUNCTIONING_LEVEL_MAP.get(functioning_level, 0)

        time_since = max(0.0, timestamp - sm.last_interaction_ts) if sm.last_interaction_ts > 0 else 0.0
        correct_ratio = sm.correct_count / max(1, sm.attempts)

        with torch.no_grad():
            skill_tensor = torch.tensor([[skill_idx]], dtype=torch.long)
            fl_tensor = torch.tensor([[fl_idx]], dtype=torch.long)
            numeric = torch.tensor(
                [[[float(sm.attempts), correct_ratio, time_since, difficulty]]],
                dtype=torch.float32,
            )
            neural_pred = self.model(skill_tensor, fl_tensor, numeric).item()

        # Blend BKT and neural: 60% BKT, 40% neural
        blended = 0.6 * bkt_result + 0.4 * neural_pred

        # Update skill mastery state
        sm.p_known = max(0.0, min(1.0, blended))
        sm.attempts += 1
        if is_correct:
            sm.correct_count += 1
        sm.last_interaction_ts = timestamp

        # SM-2 spaced repetition update
        quality = 5 if is_correct and difficulty >= 0.5 else (3 if is_correct else 1)
        sm2 = self._sm2_states.get(skill, SM2State())
        sm2 = sm2_update(sm2, quality)
        self._sm2_states[skill] = sm2
        sm.review_interval_days = sm2.interval
        sm.next_review_ts = timestamp + sm2.interval * 86400

        return MasteryUpdate(
            skill=skill,
            previous_level=previous,
            new_level=sm.p_known,
            delta=sm.p_known - previous,
        )

    def batch_update(
        self,
        mastery_levels: dict[str, SkillMastery],
        interactions: list[dict],
        functioning_level: str,
    ) -> list[MasteryUpdate]:
        """Process multiple interactions and return all mastery updates."""
        updates: list[MasteryUpdate] = []
        for interaction in interactions:
            update = self.update_mastery(
                mastery_levels=mastery_levels,
                skill=interaction["skill"],
                is_correct=interaction["is_correct"],
                difficulty=interaction.get("difficulty", 0.5),
                functioning_level=functioning_level,
                timestamp=interaction.get("timestamp", 0.0),
            )
            updates.append(update)
        return updates
