"""Services package — re-exports all service modules."""

from brain_svc.services.accommodation import diff_accommodations, resolve_accommodations
from brain_svc.services.brain_clone import clone_brain
from brain_svc.services.brain_state import (
    delete_brain_state,
    get_brain_state,
    get_brain_state_by_id,
    update_brain_state,
)
from brain_svc.services.episodic_memory import (
    append_episode,
    archive_episodes,
    get_archived_episodes,
    read_recent_episodes,
)
from brain_svc.services.functional_curriculum import (
    create_milestone,
    get_learner_milestones,
    get_milestones,
    update_milestone_status,
)
from brain_svc.services.functioning_level import (
    get_content_rules,
    update_functioning_level,
    validate_functioning_level,
)
from brain_svc.services.iep_profile import (
    confirm_iep_document,
    create_iep_document,
    create_iep_goal,
    get_iep_documents,
    get_iep_goals,
    update_iep_goal_progress,
)
from brain_svc.services.main_brain import (
    build_default_seed,
    create_seed,
    get_latest_seed,
    get_seed,
    list_seeds,
    resolve_seed_for_learner,
)
from brain_svc.services.mastery import (
    detect_regression,
    process_batch_mastery_update,
    process_mastery_update,
)
from brain_svc.services.recommendation import (
    create_recommendation,
    generate_mastery_celebration,
    generate_regression_recommendation,
    get_recommendation_by_id,
    get_recommendations,
    respond_to_recommendation,
)
from brain_svc.services.tutor_registry import (
    activate_tutor,
    deactivate_tutor,
    get_active_tutors,
)
from brain_svc.services.versioning import (
    create_snapshot,
    get_snapshot,
    list_snapshots,
    rollback_to_snapshot,
)

__all__ = [
    "clone_brain",
    "get_brain_state",
    "get_brain_state_by_id",
    "update_brain_state",
    "delete_brain_state",
    "process_mastery_update",
    "process_batch_mastery_update",
    "detect_regression",
    "create_recommendation",
    "get_recommendations",
    "get_recommendation_by_id",
    "respond_to_recommendation",
    "generate_regression_recommendation",
    "generate_mastery_celebration",
    "resolve_accommodations",
    "diff_accommodations",
    "validate_functioning_level",
    "get_content_rules",
    "update_functioning_level",
    "create_iep_document",
    "get_iep_documents",
    "confirm_iep_document",
    "create_iep_goal",
    "get_iep_goals",
    "update_iep_goal_progress",
    "activate_tutor",
    "deactivate_tutor",
    "get_active_tutors",
    "get_milestones",
    "get_learner_milestones",
    "update_milestone_status",
    "create_milestone",
    "create_snapshot",
    "list_snapshots",
    "get_snapshot",
    "rollback_to_snapshot",
    "build_default_seed",
    "create_seed",
    "get_latest_seed",
    "get_seed",
    "list_seeds",
    "resolve_seed_for_learner",
    "append_episode",
    "read_recent_episodes",
    "archive_episodes",
    "get_archived_episodes",
]
