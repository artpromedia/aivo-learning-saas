"""PyTorch BaseBrainModel — MLP + self-attention for mastery prediction.

Input features per interaction:
  skill_id (embedded), attempt_count, correct_ratio, time_since_last,
  difficulty_level, functioning_level (embedded)

Output: predicted mastery probability per skill ∈ [0, 1]
"""

from __future__ import annotations

import math
from typing import ClassVar

import torch
import torch.nn as nn


# Functioning level → ordinal index
FUNCTIONING_LEVEL_MAP: dict[str, int] = {
    "STANDARD": 0,
    "SUPPORTED": 1,
    "LOW_VERBAL": 2,
    "NON_VERBAL": 3,
    "PRE_SYMBOLIC": 4,
}

# Default number of distinct skills tracked
DEFAULT_NUM_SKILLS = 512


class SelfAttentionBlock(nn.Module):
    """Single-head self-attention over skill features."""

    def __init__(self, embed_dim: int) -> None:
        super().__init__()
        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        self.scale = math.sqrt(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, seq, embed_dim)
        q = self.query(x)
        k = self.key(x)
        v = self.value(x)
        attn_weights = torch.matmul(q, k.transpose(-2, -1)) / self.scale
        attn_weights = torch.softmax(attn_weights, dim=-1)
        return torch.matmul(attn_weights, v)


class BaseBrainModel(nn.Module):
    """MLP + self-attention mastery predictor.

    Architecture:
      skill_embedding  → ┐
      fl_embedding     → ┤ concat → Linear → ReLU → Attention → Linear → Sigmoid
      numeric features → ┘
    """

    NUM_NUMERIC_FEATURES: ClassVar[int] = 4  # attempt_count, correct_ratio, time_since_last, difficulty

    def __init__(
        self,
        num_skills: int = DEFAULT_NUM_SKILLS,
        skill_embed_dim: int = 32,
        fl_embed_dim: int = 8,
        hidden_dim: int = 64,
    ) -> None:
        super().__init__()
        self.num_skills = num_skills
        self.skill_embed_dim = skill_embed_dim
        self.fl_embed_dim = fl_embed_dim
        self.hidden_dim = hidden_dim

        self.skill_embedding = nn.Embedding(num_skills, skill_embed_dim)
        self.fl_embedding = nn.Embedding(len(FUNCTIONING_LEVEL_MAP), fl_embed_dim)

        input_dim = skill_embed_dim + fl_embed_dim + self.NUM_NUMERIC_FEATURES
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.attention = SelfAttentionBlock(hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(
        self,
        skill_ids: torch.Tensor,
        functioning_levels: torch.Tensor,
        numeric_features: torch.Tensor,
    ) -> torch.Tensor:
        """Forward pass.

        Args:
            skill_ids: (batch, seq) long tensor of skill indices
            functioning_levels: (batch, seq) long tensor of FL indices
            numeric_features: (batch, seq, 4) float tensor

        Returns:
            (batch, seq) predicted mastery probabilities
        """
        skill_emb = self.skill_embedding(skill_ids)        # (B, S, skill_embed)
        fl_emb = self.fl_embedding(functioning_levels)       # (B, S, fl_embed)
        combined = torch.cat([skill_emb, fl_emb, numeric_features], dim=-1)

        h = self.relu(self.fc1(combined))   # (B, S, hidden)
        h = self.attention(h)               # (B, S, hidden)
        out = self.sigmoid(self.fc2(h))     # (B, S, 1)
        return out.squeeze(-1)              # (B, S)
