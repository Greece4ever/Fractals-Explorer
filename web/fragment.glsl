#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 offset; 
uniform float zoom;

#define width  u_resolution.x
#define height u_resolution.y


vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = width  / 2.0  - offset.x;
    float centerY = height / 2.0 - offset.y;

    return vec2(
         (pixel_pos.x  - centerX) / zoom, // (pixel_pos.x - width)  / zoom,
        -(pixel_pos.y - centerY) / zoom // -(pixel_pos.y - height) / zoom
    );
}


struct Complex {
    float real;
    float imag;
};

out vec4 FragColor;

void main() {
    vec2 pos = toCartesian(gl_FragCoord.xy);
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
    float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
    FragColor = vec4( smooth_ * 0.05, value, smooth_ * value, 1);
}

