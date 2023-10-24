from datetime import datetime, timedelta
import os
from typing import Any, Union
from jose import jwt

from passlib.context import CryptContext

pwd_context = CryptContext(schemes='sha256_crypt')

SECRET_KEY = os.getenv('SECRET_KEY', 'test_key')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS512')
ACCESS_TOKEN_EXPIRE_HOURS = 12


def get_jwt_token(user: Union[str, Any]) -> str:
    expire = datetime.utcnow() + timedelta(hours= ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {'exp': expire, 'sub':str(user)}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

def check_password(password:str, hash_password:str) -> bool:
    return pwd_context.verify(password, hash_password)

def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)