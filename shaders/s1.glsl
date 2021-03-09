precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define mid vec2(u_resolution.x / 2.0, u_resolution.y / 2.0)

#define WIDHT u_resolution.x
#define HEIGHT u_resolution.x

vec2 offset = vec2(0, 0);
float zoom = 200.0;


struct Complex {
    float real;
    float imag;
};

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define add(a, b) vec2(a.x + b.x, a.y + b.y)

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (WIDHT  / 2.0)  - offset.x;
    float centerY = (HEIGHT / 2.0)  + offset.y;

    return vec2(
         (pixel_pos.x - centerX) / zoom, 
        -(pixel_pos.y - centerY) / zoom  
    );
}

#define POW_SIZE 3
#define POW_SIZE2 2


vec2 comp_pow(vec2 comp) {
    vec2 a = comp;

    // pow(a, 2);
    for (int i=0; i < POW_SIZE - 1 ; i++) {
        a = product(a, a);
    }

    return a;
}

vec2 comp_pow2(vec2 comp) {
    vec2 a = comp;

    // pow(a, 2);
    for (int i=0; i < POW_SIZE2 - 1 ; i++) {
        a = product(a, a);
    }

    return a;
}

void main() {
    vec4 pixel = gl_FragCoord;
    vec2 pos = toCartesian(vec2(pixel.x, pixel.y));    
    
    vec2 c0 = vec2(0.0, 0.0);

    int iter = 0;
    int iter0 = 0;

    const int MAX_ITER = 5;

    for (int i=0; i < MAX_ITER; i++) {
        c0 = add(comp_pow(c0), pos);
        if ( (c0.x * c0.x + c0.y * c0.y) > 4.0 ) {
            iter = i;
            break;
        }
    }

    pos = vec2(pos.x, pos.y);
    vec2 c1 = vec2(0, 0);


    for (int i=0; i < MAX_ITER; i++) {
        c1 = add(comp_pow2(c0), pos);
        if ( (c1.x * c1.x + c1.y * c1.y) > 4.0 ) {
            iter0 = i;
            break;
        }
    }

    float value = float(iter) / float(MAX_ITER);
    float value0 = float(iter0) / float(MAX_ITER);
    gl_FragColor = vec4(sin( c0.x * c1.y ), iter, sin(c1.x), sin(c1.x));
}

