from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import BaseModel, ValidationError
from api.model.base import make_session
from api.model.domain.user_model import DomainUser


from api.configs.security import SECRET_KEY, JWT_ALGORITHM


class TokenPayload(BaseModel):
    sub: Optional[int] = None

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)

async def get_logged_user(
    token: str = Depends(reusable_oauth2)
) -> DomainUser:
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    with make_session() as session:
        user = session.query(DomainUser).filter_by(id=token_data.sub).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user