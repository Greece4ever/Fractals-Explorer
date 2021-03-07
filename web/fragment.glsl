#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 offset; 
uniform float zoom;
uniform float ROTATION;

uniform int C_ALOGRITHM;

#define width  u_resolution.x
#define height u_resolution.y
#define MATH_PI 3.1415926538

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (width  / 2.0)  - offset.x;
    float centerY = (height / 2.0)  + offset.y;

    return vec2(
         (pixel_pos.x - centerX) / zoom, 
        -(pixel_pos.y - centerY) / zoom  
    );
}

// sin(-x) = -sin(x), where x > 0
// cos(-x) = cos(x),  where x > 0

vec2 setRotation(vec2 pos) {
    float SIN_ = sin(ROTATION);
    float COS_ = cos(ROTATION);

    float x = pos.x * COS_ - pos.y * SIN_;
    float y = pos.x * SIN_ + pos.y * COS_;
    return vec2(x, y);

    // float len = sqrt( (pos.x * pos.x) + (pos.y * pos.y) ); // sqrt(x^2 + y^2)
    // return vec2(sin(angle) * leng)
}

struct Complex {
    float real;
    float imag;
};

out vec4 FragColor;

void main() {
    vec2 pos = setRotation( toCartesian(gl_FragCoord.xy) );
    float x = pos.x, y = pos.y;

    Complex z;
        z.real = 0.0;
        z.imag = 0.0;
    Complex _z;
        _z.real = 0.0;
        _z.imag = 0.0;

    float a_2, b_2; 

    int iter = 0;
    const int max_iter = 50;

    for (int i=0; i < max_iter; i++) {
        a_2 = _z.real * _z.real;
        b_2 = _z.imag * _z.imag;

        z.real = a_2 - b_2;
        z.imag = 2.0 * _z.real * _z.imag;

        z.real += x;
        z.imag += y;

        _z.real = z.real;
        _z.imag = z.imag;


        if ( (a_2 + b_2) > 4.0) {
            iter = i;
            break;
        }
    }

    float value = float(iter) / float(max_iter);

    switch (C_ALOGRITHM) {
        case 1:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4( smooth_ * 0.05, value, smooth_ * value, 1);
            break;
        }
        case 3:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4(value / smooth_, 0.0, value, 1);
            break;
        }
        case 5:
        {
            float delta = log2(z.real) * value * exp(b_2 / a_2);
            FragColor = vec4(delta, value, log(delta / (1.0 - delta * value)), 1.0);
            break;

        }
        case 0:
        {
            float sm = pow(log(value * MATH_PI), log2(MATH_PI));
            FragColor = vec4(value *  log2(2.718 * sm),  1.0/sm, value, 1);
            break;
        }

    }

    // float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
    // FragColor = vec4( smooth_ * 0.05, value, smooth_ * value, 1);
}

