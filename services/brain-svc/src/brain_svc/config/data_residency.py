"""EU data residency routing configuration.

Reads data_residency_region from tenant_configs JSONB to determine
whether Brain data storage and S3 exports should be routed to EU
infrastructure.

Actual multi-region PostgreSQL and S3 bucket provisioning is handled
by infrastructure (Terraform). This module provides the application-layer
routing logic that services use to select the correct cluster/bucket.
"""

from __future__ import annotations

import logging
from enum import Enum
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class DataResidencyRegion(str, Enum):
    US = "us"
    EU = "eu"


DEFAULT_REGION = DataResidencyRegion.US

# Infrastructure-provided configuration for region-specific resources
REGION_CONFIG = {
    DataResidencyRegion.US: {
        "database_url_env": "DATABASE_URL",
        "s3_bucket_env": "S3_EXPORT_BUCKET",
        "s3_region": "us-east-1",
    },
    DataResidencyRegion.EU: {
        "database_url_env": "DATABASE_URL_EU",
        "s3_bucket_env": "S3_EXPORT_BUCKET_EU",
        "s3_region": "eu-central-1",
    },
}


async def get_tenant_residency_region(
    session: AsyncSession,
    tenant_id: str,
) -> DataResidencyRegion:
    """Look up the data residency region for a tenant from tenant_configs."""
    result = await session.execute(
        text(
            "SELECT features->>'data_residency_region' "
            "FROM tenant_configs WHERE tenant_id = :tid"
        ),
        {"tid": tenant_id},
    )
    row = result.first()
    if row and row[0]:
        try:
            return DataResidencyRegion(row[0].lower())
        except ValueError:
            logger.warning(
                "Unknown data_residency_region '%s' for tenant %s, using default",
                row[0],
                tenant_id,
            )
    return DEFAULT_REGION


def get_region_config(region: DataResidencyRegion) -> dict[str, str]:
    """Return infrastructure config keys for the given region."""
    return REGION_CONFIG[region]


def get_s3_bucket_for_region(region: DataResidencyRegion) -> str:
    """Return the S3 bucket name for exports based on region."""
    import os

    config = REGION_CONFIG[region]
    return os.environ.get(config["s3_bucket_env"], "aivo-exports")


def get_s3_region_for_region(region: DataResidencyRegion) -> str:
    """Return the S3 region string for the given data residency region."""
    return REGION_CONFIG[region]["s3_region"]
