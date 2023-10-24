
from fastapi import APIRouter, Depends, HTTPException
from api.depends.user_depends import get_logged_user
# from api.configs.security import criar_token_jwt, verify_password
from api.model.base import make_session
from api.model.domain.simulation_model import DomainSimulation
from api.model.domain.user_model import DomainUser
from pydantic import BaseModel


from fastapi import HTTPException, status

router = APIRouter()

class SimulationProgress(BaseModel):
    progress: int
    status: int
    input_video_path: str
    output_video_path: str

@router.get("/", status_code=status.HTTP_200_OK)
async def simulation_progress(logged_user:DomainUser = Depends(get_logged_user)):

    with make_session() as session:
        sim_info = session.query(DomainSimulation).filter_by(owner_id=logged_user.id).first()

        if sim_info is not None:
            return SimulationProgress(**sim_info.__dict__)
        else:
            raise HTTPException(status_code=404, detail="Simulation information not found")