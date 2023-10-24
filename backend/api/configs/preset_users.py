from api.model.domain.user_model import DomainUser
from api.configs.security import get_hashed_password


def get_preset_users() -> list[DomainUser]:
    return [
        DomainUser(username='AAA', hash_password=get_hashed_password('password'))
    ] 

