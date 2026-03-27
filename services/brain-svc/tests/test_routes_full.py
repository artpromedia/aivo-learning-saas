"""Comprehensive route integration tests covering all endpoints."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Brain State Routes
# ---------------------------------------------------------------------------

class TestBrainRoutes:
    @pytest.mark.asyncio
    async def test_get_learner_brain_found(self, client):
        """GET /brain/learner/{id} returns brain state when found."""
        fake_bs = MagicMock()
        fake_bs.id = uuid.uuid4()
        fake_bs.learner_id = uuid.uuid4()
        fake_bs.main_brain_version = "aivo-brain-v3.0"
        fake_bs.seed_version = "aivo-brain-v3.0"
        fake_bs.state = {"mastery_levels": {"MATH": 0.5}}
        fake_bs.functioning_level_profile = {"level": "STANDARD"}
        fake_bs.iep_profile = {}
        fake_bs.active_tutors = []
        fake_bs.delivery_levels = {}
        fake_bs.preferred_modality = "VISUAL"
        fake_bs.attention_span_minutes = 30
        fake_bs.cognitive_load = "MEDIUM"

        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/brain/learner/{fake_bs.learner_id}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["learner_id"] == str(fake_bs.learner_id)

    @pytest.mark.asyncio
    async def test_get_learner_brain_not_found(self, client):
        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/brain/learner/{uuid.uuid4()}")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_brain_by_id_found(self, client):
        fake_bs = MagicMock()
        fake_bs.id = uuid.uuid4()
        fake_bs.learner_id = uuid.uuid4()
        fake_bs.main_brain_version = "aivo-brain-v3.0"
        fake_bs.seed_version = "aivo-brain-v3.0"
        fake_bs.state = {}
        fake_bs.functioning_level_profile = {}
        fake_bs.iep_profile = {}
        fake_bs.active_tutors = []
        fake_bs.delivery_levels = {}
        fake_bs.preferred_modality = None
        fake_bs.attention_span_minutes = 30
        fake_bs.cognitive_load = "MEDIUM"

        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/brain/{fake_bs.id}")
            assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_get_brain_by_id_not_found(self, client):
        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/brain/{uuid.uuid4()}")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_patch_brain_state(self, client):
        fake_bs = MagicMock()
        fake_bs.id = uuid.uuid4()
        fake_bs.learner_id = uuid.uuid4()
        fake_bs.main_brain_version = "aivo-brain-v3.0"
        fake_bs.seed_version = "aivo-brain-v3.0"
        fake_bs.state = {}
        fake_bs.functioning_level_profile = {}
        fake_bs.iep_profile = {}
        fake_bs.active_tutors = []
        fake_bs.delivery_levels = {}
        fake_bs.preferred_modality = "AUDIO"
        fake_bs.attention_span_minutes = 25
        fake_bs.cognitive_load = "LOW"

        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.brain.update_brain_state", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.patch(
                f"/brain/{fake_bs.id}",
                json={"preferred_modality": "AUDIO", "attention_span_minutes": 25},
            )
            assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_patch_brain_state_not_found(self, client):
        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.patch(f"/brain/{uuid.uuid4()}", json={"cognitive_load": "HIGH"})
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_brain_state(self, client):
        fake_bs = MagicMock()
        fake_bs.id = uuid.uuid4()

        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.brain.delete_brain_state", new_callable=AsyncMock):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.delete(f"/brain/{fake_bs.id}")
            assert resp.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_brain_state_not_found(self, client):
        with patch("brain_svc.routes.brain.get_session") as mock_gs, \
             patch("brain_svc.routes.brain.get_brain_state_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.delete(f"/brain/{uuid.uuid4()}")
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Mastery Routes
# ---------------------------------------------------------------------------

class TestMasteryRoutes:
    @pytest.mark.asyncio
    async def test_update_mastery(self, client):
        fake_bs = MagicMock()
        fake_result = MagicMock()
        fake_result.skill = "MATH"
        fake_result.previous_level = 0.5
        fake_result.new_level = 0.55
        fake_result.delta = 0.05

        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.mastery.process_mastery_update", return_value=fake_result), \
             patch("brain_svc.routes.mastery._get_model_store"):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/mastery/update", json={
                "learner_id": str(uuid.uuid4()),
                "skill": "MATH",
                "is_correct": True,
                "difficulty": 0.5,
            })
            assert resp.status_code == 200
            data = resp.json()
            assert data["skill"] == "MATH"
            assert data["delta"] == 0.05

    @pytest.mark.asyncio
    async def test_update_mastery_not_found(self, client):
        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=None), \
             patch("brain_svc.routes.mastery._get_model_store"):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/mastery/update", json={
                "learner_id": str(uuid.uuid4()),
                "skill": "MATH",
                "is_correct": True,
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_batch_update_mastery(self, client):
        fake_bs = MagicMock()
        r1 = MagicMock(skill="MATH", previous_level=0.5, new_level=0.55, delta=0.05)
        r2 = MagicMock(skill="ELA", previous_level=0.3, new_level=0.35, delta=0.05)

        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.mastery.process_batch_mastery_update", return_value=[r1, r2]), \
             patch("brain_svc.routes.mastery._get_model_store"):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/mastery/batch-update", json={
                "learner_id": str(uuid.uuid4()),
                "interactions": [
                    {"skill": "MATH", "is_correct": True},
                    {"skill": "ELA", "is_correct": False},
                ],
            })
            assert resp.status_code == 200
            assert len(resp.json()) == 2

    @pytest.mark.asyncio
    async def test_batch_update_not_found(self, client):
        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=None), \
             patch("brain_svc.routes.mastery._get_model_store"):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/mastery/batch-update", json={
                "learner_id": str(uuid.uuid4()),
                "interactions": [],
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_mastery_levels(self, client):
        fake_bs = MagicMock()
        fake_bs.state = {"mastery_levels": {"MATH": 0.7}, "domain_scores": {"MATH": 0.7}}

        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            lid = str(uuid.uuid4())
            resp = await client.get(f"/mastery/learner/{lid}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["mastery_levels"]["MATH"] == 0.7

    @pytest.mark.asyncio
    async def test_get_mastery_levels_not_found(self, client):
        with patch("brain_svc.routes.mastery.get_session") as mock_gs, \
             patch("brain_svc.routes.mastery.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/mastery/learner/{uuid.uuid4()}")
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Accommodation Routes
# ---------------------------------------------------------------------------

class TestAccommodationRoutes:
    @pytest.mark.asyncio
    async def test_resolve_accommodations(self, client):
        resp = await client.post("/accommodations/resolve", json={
            "sources": {
                "assessment": ["extended_time"],
                "iep": ["text_to_speech"],
            },
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "accommodations" in data
        assert "extended_time" in data["accommodations"]
        assert "text_to_speech" in data["accommodations"]

    @pytest.mark.asyncio
    async def test_apply_accommodations(self, client):
        fake_bs = MagicMock()
        fake_bs.state = {"active_accommodations": []}

        with patch("brain_svc.routes.accommodations.get_session") as mock_gs, \
             patch("brain_svc.routes.accommodations.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.accommodations.update_brain_state", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/accommodations/apply", json={
                "learner_id": str(uuid.uuid4()),
                "sources": {"iep": ["audio_narration"]},
            })
            assert resp.status_code == 200
            data = resp.json()
            assert "accommodations" in data
            assert "diff" in data

    @pytest.mark.asyncio
    async def test_apply_accommodations_not_found(self, client):
        with patch("brain_svc.routes.accommodations.get_session") as mock_gs, \
             patch("brain_svc.routes.accommodations.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/accommodations/apply", json={
                "learner_id": str(uuid.uuid4()),
                "sources": {},
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_learner_accommodations(self, client):
        fake_bs = MagicMock()
        fake_bs.state = {"active_accommodations": ["extended_time"]}

        with patch("brain_svc.routes.accommodations.get_session") as mock_gs, \
             patch("brain_svc.routes.accommodations.get_brain_state", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            lid = str(uuid.uuid4())
            resp = await client.get(f"/accommodations/learner/{lid}")
            assert resp.status_code == 200
            assert "extended_time" in resp.json()["accommodations"]

    @pytest.mark.asyncio
    async def test_get_learner_accommodations_not_found(self, client):
        with patch("brain_svc.routes.accommodations.get_session") as mock_gs, \
             patch("brain_svc.routes.accommodations.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/accommodations/learner/{uuid.uuid4()}")
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Recommendation Routes
# ---------------------------------------------------------------------------

class TestRecommendationRoutes:
    @pytest.mark.asyncio
    async def test_list_recommendations(self, client):
        from datetime import datetime, timezone
        fake_rec = MagicMock()
        fake_rec.id = uuid.uuid4()
        fake_rec.brain_state_id = uuid.uuid4()
        fake_rec.learner_id = uuid.uuid4()
        fake_rec.type = "REGRESSION_ALERT"
        fake_rec.title = "Test"
        fake_rec.description = "Test desc"
        fake_rec.payload = {}
        fake_rec.status = "PENDING"
        fake_rec.parent_response_text = None
        fake_rec.responded_by = None
        fake_rec.responded_at = None
        fake_rec.re_trigger_gap_days = 14

        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.get_recommendations", return_value=[fake_rec]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            lid = str(uuid.uuid4())
            resp = await client.get(f"/recommendations/learner/{lid}")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_get_recommendation_found(self, client):
        from datetime import datetime, timezone
        fake_rec = MagicMock()
        fake_rec.id = uuid.uuid4()
        fake_rec.brain_state_id = uuid.uuid4()
        fake_rec.learner_id = uuid.uuid4()
        fake_rec.type = "MASTERY_CELEBRATION"
        fake_rec.title = "Celebration"
        fake_rec.description = "Great!"
        fake_rec.payload = {"skill": "MATH"}
        fake_rec.status = "PENDING"
        fake_rec.parent_response_text = None
        fake_rec.responded_by = None
        fake_rec.responded_at = None
        fake_rec.re_trigger_gap_days = 14

        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.get_recommendation_by_id", return_value=fake_rec):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/recommendations/{fake_rec.id}")
            assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_get_recommendation_not_found(self, client):
        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.get_recommendation_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/recommendations/{uuid.uuid4()}")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_create_recommendation(self, client):
        fake_rec = MagicMock()
        fake_rec.id = uuid.uuid4()
        fake_rec.brain_state_id = uuid.uuid4()
        fake_rec.learner_id = uuid.uuid4()
        fake_rec.type = "ACCOMMODATION_ADD"
        fake_rec.title = "Add TTS"
        fake_rec.description = "Learner may benefit from text-to-speech."
        fake_rec.payload = {"accommodation": "text_to_speech"}
        fake_rec.status = "PENDING"
        fake_rec.parent_response_text = None
        fake_rec.responded_by = None
        fake_rec.responded_at = None
        fake_rec.re_trigger_gap_days = 14

        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.create_recommendation", return_value=fake_rec):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/recommendations/", json={
                "brain_state_id": str(uuid.uuid4()),
                "learner_id": str(uuid.uuid4()),
                "type": "ACCOMMODATION_ADD",
                "title": "Add TTS",
                "description": "Learner may benefit from text-to-speech.",
                "payload": {"accommodation": "text_to_speech"},
            })
            assert resp.status_code == 201

    @pytest.mark.asyncio
    async def test_respond_recommendation(self, client):
        from datetime import datetime, timezone
        fake_rec = MagicMock()
        fake_rec.id = uuid.uuid4()
        fake_rec.brain_state_id = uuid.uuid4()
        fake_rec.learner_id = uuid.uuid4()
        fake_rec.type = "ACCOMMODATION_ADD"
        fake_rec.title = "Add TTS"
        fake_rec.description = "desc"
        fake_rec.payload = {}
        fake_rec.status = "APPROVED"
        fake_rec.parent_response_text = "Looks good"
        fake_rec.responded_by = uuid.uuid4()
        fake_rec.responded_at = datetime.now(timezone.utc)
        fake_rec.re_trigger_gap_days = 14

        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.get_recommendation_by_id", return_value=fake_rec), \
             patch("brain_svc.routes.recommendations.respond_to_recommendation", return_value=fake_rec):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post(f"/recommendations/{fake_rec.id}/respond", json={
                "status": "APPROVED",
                "responded_by": str(uuid.uuid4()),
                "response_text": "Looks good",
            })
            assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_respond_recommendation_not_found(self, client):
        with patch("brain_svc.routes.recommendations.get_session") as mock_gs, \
             patch("brain_svc.routes.recommendations.get_recommendation_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post(f"/recommendations/{uuid.uuid4()}/respond", json={
                "status": "APPROVED",
                "responded_by": str(uuid.uuid4()),
            })
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Versioning Routes
# ---------------------------------------------------------------------------

class TestVersioningRoutes:
    @pytest.mark.asyncio
    async def test_list_snapshots(self, client):
        from datetime import datetime, timezone
        fake_snap = MagicMock()
        fake_snap.id = uuid.uuid4()
        fake_snap.brain_state_id = uuid.uuid4()
        fake_snap.trigger = "INITIAL_CLONE"
        fake_snap.trigger_metadata = {}
        fake_snap.version_number = 1
        fake_snap.created_at = datetime.now(timezone.utc)

        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.list_snapshots", return_value=[fake_snap]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/versioning/snapshots/{fake_snap.brain_state_id}")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_create_snapshot(self, client):
        from datetime import datetime, timezone
        fake_bs = MagicMock()
        fake_snap = MagicMock()
        fake_snap.id = uuid.uuid4()
        fake_snap.brain_state_id = uuid.uuid4()
        fake_snap.trigger = "MASTERY_THRESHOLD"
        fake_snap.trigger_metadata = {"skill": "MATH"}
        fake_snap.version_number = 2
        fake_snap.created_at = datetime.now(timezone.utc)

        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.versioning.create_snapshot", return_value=fake_snap):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/snapshots", json={
                "brain_state_id": str(uuid.uuid4()),
                "trigger": "MASTERY_THRESHOLD",
                "trigger_metadata": {"skill": "MATH"},
            })
            assert resp.status_code == 201

    @pytest.mark.asyncio
    async def test_create_snapshot_not_found(self, client):
        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/snapshots", json={
                "brain_state_id": str(uuid.uuid4()),
                "trigger": "MASTERY_THRESHOLD",
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_rollback(self, client):
        bs_id = uuid.uuid4()
        snap_id = uuid.uuid4()
        fake_bs = MagicMock()
        fake_bs.id = bs_id
        fake_snap = MagicMock()
        fake_snap.brain_state_id = bs_id

        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.versioning.get_snapshot", return_value=fake_snap), \
             patch("brain_svc.routes.versioning.rollback_to_snapshot", return_value=fake_bs):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/rollback", json={
                "brain_state_id": str(bs_id),
                "snapshot_id": str(snap_id),
            })
            assert resp.status_code == 200
            assert resp.json()["status"] == "rolled_back"

    @pytest.mark.asyncio
    async def test_rollback_brain_not_found(self, client):
        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/rollback", json={
                "brain_state_id": str(uuid.uuid4()),
                "snapshot_id": str(uuid.uuid4()),
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_rollback_snapshot_not_found(self, client):
        fake_bs = MagicMock()
        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.versioning.get_snapshot", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/rollback", json={
                "brain_state_id": str(uuid.uuid4()),
                "snapshot_id": str(uuid.uuid4()),
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_rollback_snapshot_mismatch(self, client):
        bs_id = uuid.uuid4()
        fake_bs = MagicMock()
        fake_bs.id = bs_id
        fake_snap = MagicMock()
        fake_snap.brain_state_id = uuid.uuid4()  # Different brain state

        with patch("brain_svc.routes.versioning.get_session") as mock_gs, \
             patch("brain_svc.routes.versioning.get_brain_state_by_id", return_value=fake_bs), \
             patch("brain_svc.routes.versioning.get_snapshot", return_value=fake_snap):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/versioning/rollback", json={
                "brain_state_id": str(bs_id),
                "snapshot_id": str(uuid.uuid4()),
            })
            assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Tutor Registry Routes
# ---------------------------------------------------------------------------

class TestTutorRegistryRoutes:
    @pytest.mark.asyncio
    async def test_list_active_tutors(self, client):
        fake_bs = MagicMock()
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.tutor_registry.get_active_tutors", return_value=[]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            lid = str(uuid.uuid4())
            resp = await client.get(f"/tutors/learner/{lid}")
            assert resp.status_code == 200
            assert resp.json()["active_tutors"] == []

    @pytest.mark.asyncio
    async def test_list_active_tutors_not_found(self, client):
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/tutors/learner/{uuid.uuid4()}")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_activate_tutor(self, client):
        fake_bs = MagicMock()
        tutors = [{"tutor_id": "t1", "tutor_type": "ADDON", "subject": "MATH"}]
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.tutor_registry.activate_tutor", return_value=tutors):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/tutors/activate", json={
                "learner_id": str(uuid.uuid4()),
                "tutor_id": "t1",
                "tutor_type": "ADDON",
                "subject": "MATH",
            })
            assert resp.status_code == 200
            assert len(resp.json()["active_tutors"]) == 1

    @pytest.mark.asyncio
    async def test_activate_tutor_not_found(self, client):
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/tutors/activate", json={
                "learner_id": str(uuid.uuid4()),
                "tutor_id": "t1",
                "tutor_type": "ADDON",
            })
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_deactivate_tutor(self, client):
        fake_bs = MagicMock()
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=fake_bs), \
             patch("brain_svc.routes.tutor_registry.deactivate_tutor", return_value=[]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/tutors/deactivate", json={
                "learner_id": str(uuid.uuid4()),
                "tutor_id": "t1",
            })
            assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_deactivate_tutor_not_found(self, client):
        with patch("brain_svc.routes.tutor_registry.get_session") as mock_gs, \
             patch("brain_svc.routes.tutor_registry.get_brain_state", return_value=None):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/tutors/deactivate", json={
                "learner_id": str(uuid.uuid4()),
                "tutor_id": "t1",
            })
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# IEP Routes
# ---------------------------------------------------------------------------

class TestIepRoutes:
    def _mock_doc(self):
        doc = MagicMock()
        doc.id = uuid.uuid4()
        doc.learner_id = uuid.uuid4()
        doc.uploaded_by = uuid.uuid4()
        doc.file_url = "https://example.com/iep.pdf"
        doc.file_type = "pdf"
        doc.parsed_data = {"goals": []}
        doc.parse_status = "PARSED"
        doc.confirmed_by = None
        doc.confirmed_at = None
        return doc

    def _mock_goal(self):
        goal = MagicMock()
        goal.id = uuid.uuid4()
        goal.learner_id = uuid.uuid4()
        goal.iep_document_id = uuid.uuid4()
        goal.goal_text = "Improve reading"
        goal.domain = "ELA"
        goal.target_metric = "reading_level"
        goal.target_value = 3.0
        goal.current_value = 1.5
        goal.status = "ACTIVE"
        return goal

    @pytest.mark.asyncio
    async def test_list_iep_documents(self, client):
        doc = self._mock_doc()
        with patch("brain_svc.routes.iep.get_session") as mock_gs, \
             patch("brain_svc.routes.iep.get_iep_documents", return_value=[doc]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/iep/documents/{uuid.uuid4()}")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_upload_iep_document(self, client):
        doc = self._mock_doc()
        with patch("brain_svc.routes.iep.get_session") as mock_gs, \
             patch("brain_svc.routes.iep.create_iep_document", return_value=doc):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/iep/documents", json={
                "learner_id": str(uuid.uuid4()),
                "uploaded_by": str(uuid.uuid4()),
                "file_url": "https://example.com/iep.pdf",
                "file_type": "pdf",
            })
            assert resp.status_code == 201

    @pytest.mark.asyncio
    async def test_confirm_document(self, client):
        from datetime import datetime, timezone
        doc = self._mock_doc()
        doc.confirmed_by = uuid.uuid4()
        doc.confirmed_at = datetime.now(timezone.utc)
        doc.parse_status = "CONFIRMED"

        with patch("brain_svc.routes.iep.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = doc
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.routes.iep.confirm_iep_document", return_value=doc):
                resp = await client.post(f"/iep/documents/{doc.id}/confirm")
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_confirm_document_not_found(self, client):
        with patch("brain_svc.routes.iep.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = None
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post(f"/iep/documents/{uuid.uuid4()}/confirm")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_list_iep_goals(self, client):
        goal = self._mock_goal()
        with patch("brain_svc.routes.iep.get_session") as mock_gs, \
             patch("brain_svc.routes.iep.get_iep_goals", return_value=[goal]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get(f"/iep/goals/{uuid.uuid4()}")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_create_goal(self, client):
        goal = self._mock_goal()
        with patch("brain_svc.routes.iep.get_session") as mock_gs, \
             patch("brain_svc.routes.iep.create_iep_goal", return_value=goal):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/iep/goals", json={
                "learner_id": str(uuid.uuid4()),
                "iep_document_id": str(uuid.uuid4()),
                "goal_text": "Improve reading",
                "domain": "ELA",
            })
            assert resp.status_code == 201

    @pytest.mark.asyncio
    async def test_update_goal_progress(self, client):
        goal = self._mock_goal()
        goal.current_value = 2.5

        with patch("brain_svc.routes.iep.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = goal
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.routes.iep.update_iep_goal_progress", return_value=goal):
                resp = await client.patch(f"/iep/goals/{goal.id}/progress", json={
                    "current_value": 2.5,
                })
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_update_goal_progress_not_found(self, client):
        with patch("brain_svc.routes.iep.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = None
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.patch(f"/iep/goals/{uuid.uuid4()}/progress", json={
                "current_value": 2.5,
            })
            assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Functional Curriculum Routes
# ---------------------------------------------------------------------------

class TestFunctionalRoutes:
    @pytest.mark.asyncio
    async def test_list_milestones(self, client):
        m = MagicMock()
        m.id = uuid.uuid4()
        m.domain = "COMMUNICATION"
        m.name = "First words"
        m.description = "Uses single words"
        m.order_index = 1

        with patch("brain_svc.routes.functional.get_session") as mock_gs, \
             patch("brain_svc.routes.functional.get_milestones", return_value=[m]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.get("/functional/milestones")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_create_milestone(self, client):
        m = MagicMock()
        m.id = uuid.uuid4()
        m.domain = "SELF_CARE"
        m.name = "Hand washing"
        m.description = "Can wash hands with prompts"
        m.order_index = 5

        with patch("brain_svc.routes.functional.get_session") as mock_gs, \
             patch("brain_svc.routes.functional.create_milestone", return_value=m):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/functional/milestones", json={
                "domain": "SELF_CARE",
                "name": "Hand washing",
                "description": "Can wash hands with prompts",
                "order_index": 5,
            })
            assert resp.status_code == 201

    @pytest.mark.asyncio
    async def test_list_learner_milestones(self, client):
        from datetime import datetime, timezone
        lm = MagicMock()
        lm.id = uuid.uuid4()
        lm.learner_id = uuid.uuid4()
        lm.milestone_id = uuid.uuid4()
        lm.status = "EMERGING"
        lm.observations = [{"note": "started"}]
        lm.last_observed_at = datetime.now(timezone.utc)

        with patch("brain_svc.routes.functional.get_session") as mock_gs, \
             patch("brain_svc.routes.functional.get_learner_milestones", return_value=[lm]):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            lid = str(uuid.uuid4())
            resp = await client.get(f"/functional/learner/{lid}")
            assert resp.status_code == 200
            assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_update_progress(self, client):
        from datetime import datetime, timezone
        lm = MagicMock()
        lm.id = uuid.uuid4()
        lm.learner_id = uuid.uuid4()
        lm.milestone_id = uuid.uuid4()
        lm.status = "DEVELOPING"
        lm.observations = []
        lm.last_observed_at = datetime.now(timezone.utc)

        with patch("brain_svc.routes.functional.get_session") as mock_gs, \
             patch("brain_svc.routes.functional.update_milestone_status", return_value=lm):
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=MagicMock())
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            resp = await client.post("/functional/progress", json={
                "learner_id": str(uuid.uuid4()),
                "milestone_id": str(uuid.uuid4()),
                "status": "DEVELOPING",
                "observation": "Showing progress",
            })
            assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Main Brain Routes (additional)
# ---------------------------------------------------------------------------

class TestMainBrainRoutesExtra:
    @pytest.mark.asyncio
    async def test_get_seed_not_found(self, client):
        with patch("brain_svc.routes.main_brain.get_seed", return_value=None):
            resp = await client.get("/main-brain/seeds/nonexistent-v999")
            assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_create_seed(self, client):
        from brain_svc.services.main_brain import create_seed
        with patch("brain_svc.routes.main_brain.create_seed") as mock_create:
            mock_create.return_value = {
                "version": "aivo-brain-v4.0",
                "mastery_template": {"MATH": 0.2},
                "delivery_levels": {},
                "created_at": "2026-01-01T00:00:00",
            }
            resp = await client.post("/main-brain/seeds", json={
                "version": "aivo-brain-v4.0",
                "mastery_template": {"MATH": 0.2},
            })
            assert resp.status_code == 201
            assert resp.json()["version"] == "aivo-brain-v4.0"
