#version 300 es
precision highp float;

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define add(a, b) vec2(a.x + b.x, a.y + b.y)

uniform vec2 c_start;
uniform vec2 u_resolution;
uniform vec2 offset;

uniform float zoom;
uniform float ROTATION;
uniform float escape_radius;

uniform int iterations;
uniform int power;

uniform vec3 RGB;
uniform int custom_position;

#define WIDHT  u_resolution.x
#define HEIGHT u_resolution.y


float toRad(float deg) {
    return deg * 0.0174532925;
}

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (WIDHT  / 2.0)  - offset.x;
    float centerY = (HEIGHT / 2.0)  + offset.y;

    return vec2(
         (pixel_pos.x - centerX) / zoom, 
        -(pixel_pos.y - centerY) / zoom  
    );
}

vec2 setRotation(vec2 pos) {
    float SIN_ = sin(ROTATION);
    float COS_ = cos(ROTATION);

    float x = pos.x * COS_ - pos.y * SIN_;
    float y = pos.x * SIN_ + pos.y * COS_;
    return vec2(x, y);
}


#define MAX_POW 1000

vec2 comp_powf(vec2 comp, int n) {
    vec2 a = comp;
    for (int i=0; i < MAX_POW; i++) {
        if (i >= (n - 1))
            break;

        a = product(a, a);
    }
    return a;
}

out vec4 color;

void main() {
    vec4 pixel = gl_FragCoord;
    vec2 pos = setRotation(toCartesian(vec2(pixel.x, pixel.y)));    

    vec2 c0 = pos;//vec2(0.1, 1);
    vec2 C;

    if (custom_position == 0)
        C = pos;
    else
        C = c_start;

    int iter = 0;
    const int MAX_ITER = 1000;

    for (int i=0; i < MAX_ITER; i++) {
        c0 = add(comp_powf( vec2(abs(c0.x), abs(c0.y)) , /*2*/ power), C);
        if ( (c0.x * c0.x + c0.y * c0.y) > escape_radius) {
            iter = i;
            break;
        }
        if (i == iterations) {
            iter = i;
            break;
        }
    }

    float value = float(iter) / float(MAX_ITER);
    float smooth_ = float(iter) + 1.0 - log(abs(sqrt(c0.x * c0.x + c0.y * c0.y))) / log(2.0);

    color = vec4(
        RGB.x * value * atan(smooth_),
        RGB.y * value, atan(1.0/smooth_),
        RGB.z * smooth_
    );
}

