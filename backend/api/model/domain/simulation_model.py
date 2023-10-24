from sqlalchemy import Column, ForeignKey, Integer, String
from api.model.tablenames import SIMULATION
from sqlalchemy import Column
from api.model.base import Base
import enum

class SimulationStatus(enum.Enum):
    STOPPED = 1
    PRE_PROCESSING = 2
    SIMULATING = 3
    POST_PROCESSING = 4
    FINISHED = 5
    ERROR = 6

class DomainSimulation(Base):
    __tablename__ = SIMULATION

    id = Column(Integer, primary_key=True, index=True)
    progress = Column(Integer, default=0)
    status = Column(Integer, default=SimulationStatus.STOPPED.value)
    input_video_path = Column(String, default=None)
    output_video_path = Column(String, default=None)

    owner_id = Column(Integer, ForeignKey("users.id"))