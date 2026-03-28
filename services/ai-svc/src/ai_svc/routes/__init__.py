"""API routes."""

from ai_svc.routes.health import router as health_router
from ai_svc.routes.generate import router as generate_router
from ai_svc.routes.tutor import router as tutor_router
from ai_svc.routes.homework import router as homework_router
from ai_svc.routes.writing import router as writing_router
from ai_svc.routes.iep import router as iep_router
from ai_svc.routes.quality import router as quality_router
from ai_svc.routes.vision import router as vision_router

all_routers = [
    health_router,
    generate_router,
    tutor_router,
    homework_router,
    writing_router,
    iep_router,
    quality_router,
    vision_router,
]
