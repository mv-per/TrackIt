

def get_rgb_color(hex_color:str) -> tuple[int, int, int]:
    return tuple(int(hex_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))