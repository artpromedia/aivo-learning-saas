"""Routes package."""

from brain_svc.routes.accommodations import router as accommodations_router
from brain_svc.routes.brain import router as brain_router
from brain_svc.routes.functional import router as functional_router
from brain_svc.routes.health import router as health_router
from brain_svc.routes.iep import router as iep_router
from brain_svc.routes.main_brain import router as main_brain_router
from brain_svc.routes.mastery import router as mastery_router
from brain_svc.routes.recommendations import router as recommendations_router
from brain_svc.routes.tutor_registry import router as tutor_registry_router
from brain_svc.routes.upgrade import router as upgrade_router
from brain_svc.routes.versioning import router as versioning_router

all_routers = [
    health_router,
    brain_router,
    main_brain_router,
    mastery_router,
    recommendations_router,
    accommodations_router,
    iep_router,
    tutor_registry_router,
    functional_router,
    versioning_router,
    upgrade_router,
]
