import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, UploadFile
from api.depends.user_depends import get_logged_user
from api.handlers.simulation_handler import FileUploadException, SimulationSettings
from api.model.base import make_session
from api.model.domain.simulation_model import DomainSimulation, SimulationStatus
from api.model.domain.user_model import DomainUser
from api.handlers.simulation_handler import SimulationHandler
from fastapi import HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from typing import Any
from api.utils import get_rgb_color

router = APIRouter()



@router.post("/upload-video/", status_code=status.HTTP_200_OK)
async def upload_video(file:UploadFile, logged_user:DomainUser = Depends(get_logged_user)):
    handler = SimulationHandler(logged_user.id)
    try:
        handler.upload_video(file)
    except FileUploadException:
        raise HTTPException(status_code=400, detail="There was an error uploading the file")


def get_simulation_settings(data:dict[str,Any]) -> SimulationSettings:
    if data['settings'] is not None:
        line_width = data['settings'].pop('lineWidth')
        data['settings']['line_width'] = line_width
        line_color = data['settings'].pop('lineColor')
        data['settings']['line_color'] = get_rgb_color(line_color)
        settings = SimulationSettings(**data['settings'])
    else:
        settings = SimulationSettings()

    return settings

@router.post("/track-video/", status_code=status.HTTP_200_OK)
async def video_track(request:Request,background_tasks:BackgroundTasks, response: Response,  logged_user:DomainUser = Depends(get_logged_user)):

    data = await request.json()
    
    settings = get_simulation_settings(data)

    handler = SimulationHandler(logged_user.id)

    if handler.is_simulation_running():
        response.status_code = status.HTTP_202_ACCEPTED
    else:
        handler.set_status(SimulationStatus.PRE_PROCESSING.value)
        handler.set_progress(0)

        handler.simulation_settings = settings
        
        point = data['rectangle']['x'], data['rectangle']['y'], data['rectangle']['w'], data['rectangle']['h']

        background_tasks.add_task(handler.simulate, point)
    return {'message': 'Simulation running'}


@router.get("/download-tracked-video/", status_code=status.HTTP_200_OK, response_class=FileResponse)
async def video_track(logged_user:DomainUser = Depends(get_logged_user)):

    with make_session() as session:
        sim_info = session.query(DomainSimulation).filter_by(owner_id=logged_user.id).first()
        path = sim_info.output_video_path

    if os.path.exists(path):
        return FileResponse(path)
    else:
        raise HTTPException(status_code=404, detail="File not found")