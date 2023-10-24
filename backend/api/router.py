from fastapi import APIRouter
from api.controllers.user_controller import router as user_router
from api.controllers.video_track_controller import router as track_router
from api.controllers.simulation_controller import router as simulation_router


router = APIRouter()

router.include_router(user_router, prefix='/users', tags=['Users'])
router.include_router(track_router, prefix='/video-track', tags=['Video Track'])
router.include_router(simulation_router, prefix='/sim-info', tags=['Simulation Info'])