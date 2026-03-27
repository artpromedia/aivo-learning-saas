"""Integration tests for HTTP routes."""

from __future__ import annotations

import pytest


class TestHealthRoutes:
    @pytest.mark.asyncio
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "brain-svc"

    @pytest.mark.asyncio
    async def test_ready(self, client):
        resp = await client.get("/ready")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ready"


class TestMainBrainRoutes:
    @pytest.mark.asyncio
    async def test_list_seeds(self, client):
        resp = await client.get("/main-brain/seeds")
        assert resp.status_code == 200
        seeds = resp.json()
        assert isinstance(seeds, list)
        assert len(seeds) >= 1

    @pytest.mark.asyncio
    async def test_get_seed(self, client):
        resp = await client.get("/main-brain/seeds/aivo-brain-v3.0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["version"] == "aivo-brain-v3.0"

    @pytest.mark.asyncio
    async def test_resolve_seed(self, client):
        resp = await client.post(
            "/main-brain/resolve",
            json={"enrolled_grade": 3, "functioning_level": "STANDARD"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "mastery_template" in data
