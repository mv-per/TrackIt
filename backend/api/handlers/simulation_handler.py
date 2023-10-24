import subprocess
import sys
from typing import Optional
from attr import field
from attrs import define
import os
from collections import deque
import numpy as np
import cv2
from cv2 import typing as cv2type





from fastapi import UploadFile

from api.model.base import make_session
from api.model.domain.simulation_model import DomainSimulation, SimulationStatus

class FileUploadException(Exception):
    """"""

@define
class SimulationSettings:
    buffer:int = field(default = 1000)
    tracker:str = field(default = 'CSTR')
    line_color:tuple[int, int, int] = field(default = (255,255,255))
    line_width:int = field(default = 1)



@define
class SimulationHandler:

    _pts: deque = field(init=False)

    user_id:int
    simulation_settings:SimulationSettings = field(init=False)

    def _get_user_temp_dir(self):
        import tempfile
        path = tempfile.gettempdir() + f'/user-{self.user_id}/'
        if path is not None and not os.path.exists(path):
            os.mkdir(path)
        return path

    def __attrs_post_init__(self)-> None:
        self.setup_simulation_entity()
    

    def is_simulation_running(self) -> bool:
        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()

            if sim_info is None:
                return False
            
            return all([sim_info.status > 1, sim_info.status < 5])

    def setup_simulation_entity(self) -> None:

        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()

            if sim_info is None:
                sim_info = DomainSimulation(owner_id=self.user_id)
                session.add(sim_info)
                session.flush()


    def get_tracker(self) -> cv2.Tracker:
        print(self.simulation_settings.tracker)
        if self.simulation_settings.tracker == 'CSTR':
            tracker = cv2.TrackerCSRT_create()
        elif self.simulation_settings.tracker == 'KCF':
            tracker = cv2.TrackerKCF_create()
        elif self.simulation_settings.tracker == 'MOSSE':
            tracker = cv2.legacy.TrackerMOSSE_create()
        elif self.simulation_settings.tracker == 'BOOSTING':
            tracker = cv2.legacy.TrackerBoosting_create()
        elif self.simulation_settings.tracker == 'MIL':
            tracker = cv2.TrackerMIL_create() 
        elif self.simulation_settings.tracker == 'TLD':
            tracker = cv2.legacy.TrackerTLD_create() 
        elif self.simulation_settings.tracker == 'MEDIANFLOW':
            tracker = cv2.legacy.TrackerMedianFlow_create() 
        elif self.simulation_settings.tracker == 'GOTURN':
            tracker = cv2.TrackerGOTURN_create()
        else:
            raise RuntimeError('Unknown tracker')
        return tracker

    

    def set_progress(self, progress:float) -> None:
        """
        
        """
        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            sim_info.progress= int(progress)
            session.commit()
    
    
    def set_status(self, status:int) -> None:
        """
        
        """
        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            sim_info.status = status
            session.add(sim_info)
            session.commit()

    def on_simulation_done(self, error:bool=False):
        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            if not error:
                sim_info.progress=100
                sim_info.status = SimulationStatus.FINISHED.value
            else:
                sim_info.progress=0
                sim_info.status = SimulationStatus.ERROR.value
            session.add(sim_info)
            session.commit()
    
    def upload_video(self, file:UploadFile) -> None:
        """
        
        """
        from api.model.domain.simulation_model import DomainSimulation
        
        try:
            with make_session() as session:

                sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
                if sim_info is None:
                    sim_info = DomainSimulation(owner_id=self.user_id)
                    session.add(sim_info)
                    session.flush()
                sim_info.progress=0

                temp_file = self._get_user_temp_dir() + file.filename
                sim_info.input_video_path = self._get_user_temp_dir() +"input.mp4"

                contents = file.file.read()
                with open(temp_file, 'wb') as f:
                    f.write(contents)


                self._clean_path(sim_info.input_video_path)
                session.commit()
                
                
                
                command = f"ffmpeg -i {temp_file} -c:v libx265 -crf 28 -map 0 -map -0:a -c copy {sim_info.input_video_path}"
                command = command.split(" ")
                try:
                    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
                    process.wait()
                except subprocess.CalledProcessError as e:
                    print("FFmpeg command failed:", e)
                    raise Exception() from e
                finally:
                    self._clean_path(temp_file)

        # except Exception:
        #     raise FileUploadException()
        finally:
            file.file.close()

    def reset_fps(self, fps:int) -> None:

        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            curr_file = str(sim_info.output_video_path)
            temp_file = self._get_user_temp_dir() + "new_tracked_video.mp4"

            self._clean_path(temp_file)

            sim_info.output_video_path = temp_file
            session.commit()

        command = f"ffmpeg -hide_banner -loglevel error -i {curr_file} -r {fps} -filter:v 'setpts=0.5*PTS' {temp_file}"
        # command = command.split(" ")

        has_error = False
        os.system(command)
        if not os.path.exists(temp_file):
            has_error = True

        self._clean_path(curr_file)
        self.on_simulation_done(error=has_error)



    def add_center_point(self, rectangle:cv2type.Rect):
        """
        locates the center of the rectangle and stores in the _pts list
        """
        
        x,y,w,h = [int(p) for p in rectangle]

        center = (x+(x+w))//2, (y + (y+h))//2
        self._pts.appendleft(center)

    def _clean_path(self, path:Optional[str]=None)-> None:
        print(f'cleaning {path}')
        if path is not None and os.path.exists(path):
            os.remove(path)

    def get_input_video(self) -> tuple[cv2.VideoCapture, int, int, int]:
        
        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            path = sim_info.input_video_path

        video = cv2.VideoCapture(path)
        frame_width = int(video.get(3))
        frame_height = int(video.get(4))
        fps = int(video.get(5))

        return video, frame_width, frame_height, fps

    def get_output_video(self, width:int, height:int, fps:int) -> cv2.VideoWriter:
        # Define the codec and create VideoWriter object.The output is stored in 'outpy.avi' file.
        path = self._get_user_temp_dir() + "tracked_video.mp4"

        with make_session() as session:
            sim_info = session.query(DomainSimulation).filter_by(owner_id=self.user_id).first()
            sim_info.output_video_path = path
            session.commit()

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter(
            path,
            fourcc, 
            min(fps//3, 10),
            (width,height))


    def simulate(self, point:tuple[int,int,int,int]) -> None:
        try:
            self._simulate(point)
            
        except Exception as e:
            print(e)
            self.on_simulation_done(error=True)

    def _simulate(self, rectangle:tuple[int,int,int,int]) -> None:
        self._pts = deque(maxlen=self.simulation_settings.buffer)
        input_video, width, height, fps = self.get_input_video()


        output_video = self.get_output_video(width, height, fps)


        tracker = self.get_tracker()

        video_length = int(input_video.get(cv2.CAP_PROP_FRAME_COUNT))
 
        _, frame = input_video.read()

        tracker.init(frame, rectangle)

        index = 0
        success_percentage = 0

        self.set_status(SimulationStatus.SIMULATING.value)
        while True:
            success, frame = input_video.read()

            if frame is None:
                break
            success, rectangle = tracker.update(frame)

            if success:
                success_percentage = success_percentage+1
                self.add_center_point(rectangle)

                for i in range(1, len(self._pts)):
                    # if either of the tracked points are None, ignore
                    # them
                    if self._pts[i - 1] is None or self._pts[i] is None:
                        continue
                    # otherwise, compute the thickness of the line and
                    # draw the connecting lines
                    thickness = int(np.sqrt(self.simulation_settings.buffer / float(i + 1)) * self.simulation_settings.line_width)
                    cv2.line(frame, self._pts[i - 1], self._pts[i], self.simulation_settings.line_color, thickness)

            output_video.write(frame)

            self.set_progress(index*100/video_length)
            index=index+1
        self.set_status(SimulationStatus.POST_PROCESSING.value)
        print(f'success percentage = {success_percentage*100/video_length}')

        input_video.release()
        output_video.release()
        cv2.destroyAllWindows()
        self.reset_fps(fps)
        

