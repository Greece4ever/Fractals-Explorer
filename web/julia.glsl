precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define mid vec2(u_resolution.x / 2.0, u_resolution.y / 2.0)

#define WIDHT u_resolution.x
#define HEIGHT u_resolution.x

vec2 offset = vec2(0, 0);
float zoom = 200.0;

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define add(a, b) vec2(a.x + b.x, a.y + b.y)

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

vec2 setRotation(float ROTATION, vec2 pos) {
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


void main() {
    vec4 pixel = gl_FragCoord;
    vec2 pos = toCartesian(vec2(pixel.x, pixel.y));    

    vec2 c0 = pos;//vec2(0.1, 1);
    // vec2 C = vec2(0.0, 0.8);
    vec2 C = vec2(-0.78, 0.13);
    int iter = 0;

    const int MAX_ITER = 500;

    for (int i=0; i < MAX_ITER; i++) {
        c0 = add(comp_powf(c0, 2), C);
        if ( (c0.x * c0.x + c0.y * c0.y) > 10.0 ) {
            iter = i;
            break;
        }

    }

    float value = float(iter) / float(MAX_ITER);
    float smooth_ = float(iter) + 1.0 - log(abs(sqrt(c0.x * c0.x + c0.y * c0.y))) / log(2.0);

    gl_FragColor = vec4(value * atan(smooth_), value, atan(1.0/smooth_), 1.0);
}

