from pydantic import BaseModel, validator
from api.configs.security import get_hashed_password

class UserModel(BaseModel):
    username: str
    hash_password: str

    @validator('hash_password', pre=True)
    def hash_the_password(cls, v):
        return get_hashed_password(v)