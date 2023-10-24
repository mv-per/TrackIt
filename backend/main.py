from fastapi import FastAPI

import uvicorn
from api.model.domain.user_model import DomainUser

from api.configs.preset_users import get_preset_users
from api.model.base import make_session
from api.router import router
app = FastAPI()
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

def start_app()->None:
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == '__main__':
    users = get_preset_users()

    with make_session() as session:
        for user in users:
            db_user = session.query(DomainUser).filter_by(username=user.username).first()
            if db_user is None:
                session.add(user)
                session.flush()
            
        
        session.commit()
    
    
    start_app()