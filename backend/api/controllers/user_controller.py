from fastapi import APIRouter, HTTPException
from api.configs.security import check_password, get_jwt_token
# from api.configs.security import criar_token_jwt, verify_password
from api.model.base import make_session
from api.model.domain.user_model import DomainUser
from pydantic import BaseModel

router = APIRouter()

class UserData(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(user:UserData):
    with make_session() as session:
        db_user = session.query(DomainUser).filter_by(username=user.username).first()

        if db_user is None or not check_password(user.password, db_user.hash_password):
            raise HTTPException(status_code=403, detail="Incorrect username or password")

        return {"access_token": get_jwt_token(db_user.id), "token_type": "bearer"}