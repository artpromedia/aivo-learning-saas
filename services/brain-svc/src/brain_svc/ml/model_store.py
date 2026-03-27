"""Model store — save/load/clone PyTorch mastery models per learner.

Models are stored on disk with an LRU memory cache for hot access.
"""

from __future__ import annotations

import copy
import io
import logging
import os
from collections import OrderedDict

import torch

from brain_svc.ml.base_brain_model import BaseBrainModel
from brain_svc.ml.mastery_engine import MasteryEngine

logger = logging.getLogger(__name__)

_MAX_CACHE_SIZE = 256


class ModelStore:
    """Manages per-learner model persistence and in-memory caching."""

    def __init__(self, store_dir: str) -> None:
        self._store_dir = store_dir
        self._cache: OrderedDict[str, MasteryEngine] = OrderedDict()
        os.makedirs(store_dir, exist_ok=True)

    def _model_path(self, learner_id: str) -> str:
        return os.path.join(self._store_dir, f"{learner_id}.pt")

    def _evict_if_needed(self) -> None:
        while len(self._cache) > _MAX_CACHE_SIZE:
            evicted_key, _ = self._cache.popitem(last=False)
            logger.debug("Evicted model for learner %s from cache", evicted_key)

    def save(self, learner_id: str, engine: MasteryEngine) -> None:
        """Persist engine state to disk and update cache."""
        path = self._model_path(learner_id)
        state = {
            "model_state_dict": engine.model.state_dict(),
            "bkt_params": {
                k: {"p_init": v.p_init, "p_transit": v.p_transit, "p_guess": v.p_guess, "p_slip": v.p_slip}
                for k, v in engine._bkt_params.items()
            },
            "sm2_states": {
                k: {"easiness": v.easiness, "interval": v.interval, "repetitions": v.repetitions}
                for k, v in engine._sm2_states.items()
            },
            "model_config": {
                "num_skills": engine.model.num_skills,
                "skill_embed_dim": engine.model.skill_embed_dim,
                "fl_embed_dim": engine.model.fl_embed_dim,
                "hidden_dim": engine.model.hidden_dim,
            },
        }
        torch.save(state, path)

        # Update cache
        self._cache[learner_id] = engine
        self._cache.move_to_end(learner_id)
        self._evict_if_needed()

    def load(self, learner_id: str) -> MasteryEngine | None:
        """Load engine from cache or disk. Returns None if not found."""
        # Check cache first
        if learner_id in self._cache:
            self._cache.move_to_end(learner_id)
            return self._cache[learner_id]

        path = self._model_path(learner_id)
        if not os.path.exists(path):
            return None

        state = torch.load(path, map_location="cpu", weights_only=True)
        cfg = state["model_config"]
        model = BaseBrainModel(
            num_skills=cfg["num_skills"],
            skill_embed_dim=cfg["skill_embed_dim"],
            fl_embed_dim=cfg["fl_embed_dim"],
            hidden_dim=cfg["hidden_dim"],
        )
        model.load_state_dict(state["model_state_dict"])

        engine = MasteryEngine(model)

        from brain_svc.ml.mastery_engine import BKTParams, SM2State

        for k, v in state.get("bkt_params", {}).items():
            engine._bkt_params[k] = BKTParams(**v)
        for k, v in state.get("sm2_states", {}).items():
            engine._sm2_states[k] = SM2State(**v)

        self._cache[learner_id] = engine
        self._cache.move_to_end(learner_id)
        self._evict_if_needed()
        return engine

    def clone_seed(self, learner_id: str, seed_engine: MasteryEngine) -> MasteryEngine:
        """Clone a seed engine for a new learner and persist it."""
        cloned = seed_engine.clone()
        self.save(learner_id, cloned)
        return cloned

    def delete(self, learner_id: str) -> None:
        """Remove a learner's model from cache and disk."""
        self._cache.pop(learner_id, None)
        path = self._model_path(learner_id)
        if os.path.exists(path):
            os.remove(path)

    def invalidate_cache(self, learner_id: str) -> None:
        """Remove a learner's model from cache only."""
        self._cache.pop(learner_id, None)

    def export_to_bytes(self, learner_id: str) -> bytes | None:
        """Export model state to bytes for snapshot storage."""
        engine = self.load(learner_id)
        if engine is None:
            return None

        buf = io.BytesIO()
        state = {
            "model_state_dict": engine.model.state_dict(),
            "bkt_params": {
                k: {"p_init": v.p_init, "p_transit": v.p_transit, "p_guess": v.p_guess, "p_slip": v.p_slip}
                for k, v in engine._bkt_params.items()
            },
            "sm2_states": {
                k: {"easiness": v.easiness, "interval": v.interval, "repetitions": v.repetitions}
                for k, v in engine._sm2_states.items()
            },
            "model_config": {
                "num_skills": engine.model.num_skills,
                "skill_embed_dim": engine.model.skill_embed_dim,
                "fl_embed_dim": engine.model.fl_embed_dim,
                "hidden_dim": engine.model.hidden_dim,
            },
        }
        torch.save(state, buf)
        return buf.getvalue()
