#version 300 es
// #ifdef GL_ES
    precision highp float;
// #endif

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define add(a, b) vec2(a.x + b.x, a.y + b.y)
#define div(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))

uniform vec2 u_resolution;
uniform vec2 offset;
uniform float zoom;
uniform float ROTATION;

uniform float tolerance;

uniform int USE_SMOOTH;
uniform int SWITCH_ALPHA;
uniform int MAX_ITER;

uniform vec2 ALPHA;

uniform vec3 COLOR0;
uniform vec3 COLOR1;
uniform vec3 COLOR2;
uniform vec3 RGB;


#define WIDTH  u_resolution.x
#define HEIGHT u_resolution.y

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (WIDTH  / 2.0)  - offset.x;
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

#define pow2(a) mul(a, a)
#define pow3(a) mul(mul(a, a), a)
#define pow4(a) mul(pow3(a), a)
#define pow5(a) mul(pow4(a), a)


vec2 p(vec2 z) {
    return %%FUNCTION;
    // return add(pow3(z), -vec2(1.0, 0));
    // return add(add(pow3(z), vec2(2 , 0)), mul(z, -vec2(2, 0))); // z^3 + 2 - 2z
}


vec2 p_pr(vec2 z) {
    return %%DERIVATIVE;
    // return mul(pow2(z), vec2(3, 0));
    // return add(mul(pow2(z), vec2(3, 0)), vec2(-2, 0)); // 3z^2 - 2
}

vec2 newton(vec2 z, vec2 a) {
    // z - a(p(z) / p'(z))
    vec2 div_ = div(p(z), p_pr(z));
    vec2 mul_ = -mul(div_, a);
    return add(z, mul_);
}

%%ROOTS
// vec2 roots[3] = vec2[3](vec2(-0.5 , -0.8660254037844387), vec2(1.0 , 0.0), vec2(-0.5 , 0.8660254037844387));
// vec2  roots[3] = vec2[3](vec2( 0.8846461771193157,   -0.5897428050222054), vec2(-1.7692923542386314,   0.0), vec2( 0.8846461771193157,   0.5897428050222054));


vec4 colors[3];

out vec4 OUT_COLOR;



void main() {
    colors[0] = vec4(COLOR0, 1.0);
    colors[1] = vec4(COLOR1, 1.0);
    colors[2] = vec4(COLOR2, 1.0);

    vec2 Z = setRotation(toCartesian(gl_FragCoord.xy));
    vec2 a = ALPHA; // vec2(1.0, 0);
    
    const int MAX_ITER_FULL = 500;

    for (int _=0; _ < MAX_ITER_FULL; _++) { 
        Z = newton(Z, a);

        for (int i=0; i < 3; i++) {
            vec2 dif = add(Z, -roots[i]);

            if (abs(dif.x) < tolerance && abs(dif.y) < tolerance) {            
                vec4 color =   colors[i];      
                float value;
                float smooth_;
                
                if (SWITCH_ALPHA == 1)
                    value = float(MAX_ITER - _)/float(MAX_ITER);
                else
                    value = float(_)/float(MAX_ITER);

                if (USE_SMOOTH == 0)
                    smooth_ = float(_) + 1.0 - log(abs(sqrt(Z.x * Z.x + Z.y * Z.y))) / log(2.0);
                else
                    smooth_ = 1.0;

                OUT_COLOR =  vec4(color.x * RGB.x, color.y * smooth_ * RGB.y, color.z * RGB.z, value);
                return;
            }

        }

        if (_ > MAX_ITER)
            break;
    }

    OUT_COLOR = vec4(0.0157, 0.3137, 0.3137, 1.0);
}


