"""Add pgvector extension and embeddings table.

Revision ID: 001_add_pgvector
Revises:
Create Date: 2026-03-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers, used by Alembic.
revision = "001_add_pgvector"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable the pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create the embeddings table using raw SQL so we can use the vector type
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS embeddings (
            id UUID PRIMARY KEY,
            collection VARCHAR(128) NOT NULL,
            content TEXT NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            embedding vector(1536) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )

    # Create index on collection for filtered queries
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_embeddings_collection "
        "ON embeddings (collection)"
    )

    # Create an IVFFlat index for fast cosine similarity search
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_embeddings_embedding "
        "ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS embeddings")
    op.execute("DROP EXTENSION IF EXISTS vector")
