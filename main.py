import pygame

class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f'({x}, {y})'


WIDTH, HEIGHT = 800, 600 

offset = Vector(0, 0)
mid    = Vector(WIDTH / 2, HEIGHT / 2) # middle of window aka (0, 0) 
zoom: float = 0.5

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))

# X and Y are cartesian coordinates
def to_pixels(x, y):
    center = Vector(
        mid.x + offset.x,
        mid.y + offset.y
    )
    return (
        center.x + x * zoom,
        center.y - y * zoom 
    )
 
# pX -> pixelX, (pX, pY) are pixel coordinates
def to_cartesian(pX, pY) -> tuple:
    center = Vector(
        mid.x + offset.x,
        mid.y + offset.y
    )
    return ( 
         (pX - center.x) / zoom, 
        -(pY - center.y) / zoom 
    )
 
# prev_cmpos.y = -(pY - center.y) / zoom
# (prev_cmpos.y * zoom) = -(pY - center.y)
# -(prev_cmpos.y * zoom)= (pY - center.y)
# -(prev_cmpos.y * zoom) - pY = -center.y
# -(-(prev_cmpos.y * zoom) - pY) = center.y
# -(-(prev_cmpos.y * zoom) - pY) = mid.y + offset.y
# offset.y = -(-(prev_cmpos.y * zoom) - pY) - mid.y


# prev_cmpos.x  = (pX - center.x) / zoom
# (prev_cmpos.x * zoom)  =  (pX - center.x)
# (prev_cmpos.x * zoom) - pX = -center.x
# -((prev_cmpos.x * zoom) - pX) = center.x
# -((prev_cmpos.x * zoom) - pX) =  mid.x + offset.x
# -((prev_cmpos.x * zoom) - pX) - mid.x = offset.x


color = (75, 125, 255) 
 
# Some sample shape to understand the transformation
def draw_coordinates():
    pygame.draw.line(screen, color, to_pixels(0, 0), to_pixels(40, 0))
    pygame.draw.line(screen, color, to_pixels(0, 0), to_pixels(-40, 0))
    pygame.draw.line(screen, color, to_pixels(0, 0), to_pixels(0, 40))
    pygame.draw.line(screen, color, to_pixels(0, 0), to_pixels(0, -40))
 

pos = [0, 0]
 
while 1:
    events = pygame.event.get()

    # Zoom when A is pressed
    for event in events:
        if event.type == pygame.KEYDOWN:
            if event.key != pygame.K_a:
                continue

            mpos: tuple = pygame.mouse.get_pos() # Pixel position 

            # Cartesian Position BEFORE ZOOM (of mouse)
            prev_cmpos: tuple = to_cartesian(*mpos)

            zoom += 0.1

            new_cmpos: tuple = to_cartesian(*mpos)

            print(prev_cmpos, new_cmpos)

            # to_cartesian(pX, pY) must be equal to prev_cmpos
            # but with a different offset
            pX = mpos[0]
            pY = mpos[1]
            offset.x = -((prev_cmpos[0] * zoom) - pX) - mid.x
            offset.y = -(-(prev_cmpos[1] * zoom) - pY) - mid.y


            


    screen.fill((0, 0, 0)) # Clear screen

    draw_coordinates()
    pygame.display.flip()