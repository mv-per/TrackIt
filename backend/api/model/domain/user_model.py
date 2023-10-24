from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from api.model.tablenames import USERS
from sqlalchemy import Column
from api.model.base import Base

class DomainUser(Base):
    __tablename__ = USERS

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hash_password = Column(String, nullable=False)

    sim_info = relationship("DomainSimulation",  uselist=False, backref="DomainUser")

