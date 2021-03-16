#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform vec2  offset; 
uniform float zoom;
uniform float ROTATION;
uniform int   C_ALOGRITHM;

uniform vec3 RGB;

#define VECTOR(a, b, c, d) vec4(RGB.x * a, RGB.y * b, RGB.z * c, d)


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

vec2 setRotation(vec2 pos) {
    float SIN_ = sin(ROTATION);
    float COS_ = cos(ROTATION);

    float x = pos.x * COS_ - pos.y * SIN_;
    float y = pos.x * SIN_ + pos.y * COS_;
    return vec2(x, y);
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
        case 0:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            
            FragColor = VECTOR( smooth_ * 0.05, value, smooth_ * value, 1);
            break;
        }
        case 1:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = VECTOR(value / smooth_, 0.0, value, 1);
            break;
        }
        case 2:
        {
            float delta = log2(z.real) * value * exp(b_2 / a_2);
            FragColor = VECTOR(delta, value, log(delta / (1.0 - delta * value)), 1.0);
            break;

        }
        case 3:
        {
            float sm = pow(log(value * MATH_PI), log2(MATH_PI));
            FragColor = VECTOR(value *  log2(2.718 * sm),  1.0/sm, value, 1);
            break;
        }
        case 4: {
            FragColor = VECTOR(0.0, value, 0.0, 1.0);
            break;
        }
        case 5: {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_2 = smooth_ + 1.0 - log(smooth_ * abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_3 = sin(z.real *  MATH_PI) * log(smooth_ / smooth_2);
            FragColor = VECTOR(sin(smooth_3), sin(smooth_), cos(smooth_2), 1.0);
            break;
        }
        case 6: {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            vec3 val = 0.5 + 0.5*cos( 3.0 +  smooth_*0.15 + vec3(0.0, 0.6, 1.0));
            vec3 comp = 1.0 * sin(float(iter)) * val;
            FragColor = VECTOR(comp.x, comp.y, comp.z, 1);
            break;
        }
    }
}

