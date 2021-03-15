/* Main function, uniforms & utils */
#ifdef GL_ES
    precision mediump float;
#endif

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define add(a, b) vec2(a.x + b.x, a.y + b.y)
#define div(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define WIDTH  u_resolution.x
#define HEIGHT u_resolution.y

#define OFFSET vec2(0, 0)
#define ZOOM 200.0

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (WIDTH  / 2.0)  - OFFSET.x;
    float centerY = (HEIGHT / 2.0)  + OFFSET.y;

    return vec2(
         (pixel_pos.x - centerX) / ZOOM, 
        -(pixel_pos.y - centerY) / ZOOM  
    );
}

#define MAX_POW 500

vec2 powf(vec2 comp, int n) {
    vec2 a = comp;
    for (int i=0; i < MAX_POW; i++) {
        if (i >= (n - 1))
            break;

        a = product(a, a);
    }
    return a;
}

#define MATH_PI 3.1415
#define pow2(a) mul(a, a)
#define pow3(a) mul(mul(a, a), a)
#define pow4(a) mul(pow3(a), a)
#define pow5(a) mul(pow4(a), a)
#define col(a, b, c, d) vec4(float(a) / 255.0, float(b) / 255.0, float(c) / 255.0, float(d) / 255.0)


vec2 p(vec2 z) {
    return add(pow3(z), -vec2(1.0, 0));
    // return add(add(pow3(z), vec2(2 , 0)), mul(z, -vec2(2, 0))); // z^3 + 2 - 2z
    // return add(pow5(z), vec2(-1, 0));
}


vec2 p_pr(vec2 z) {
    return mul(pow2(z), vec2(3, 0));
    // return add(mul(pow2(z), vec2(3, 0)), vec2(-2, 0)); // 3z^2 - 2
    // return mul(vec2(5, 0), pow4(z));
}

vec2 newton(vec2 z, vec2 a) {
    // z - a(p(z) / p'(z))
    vec2 div_ = div(p(z), p_pr(z));
    vec2 mul_ = -mul(div_, a);
    return add(z, mul_);
}

vec2  roots[5];
vec4 colors[3];

void main() {
        roots[0] = vec2(-0.5 , -0.8660254037844387);
	    roots[2] = vec2(1.0 , 0.0);
	    roots[1] = vec2(-0.5 , 0.8660254037844387);

        // roots[0] = vec2( 0.8846461771193157,   -0.5897428050222054);
        // roots[1] = vec2(-1.7692923542386314,   0.0);
        // roots[2] = vec2( 0.8846461771193157,   0.5897428050222054);

        
        

        // roots[0] = vec2(0.30901699437494745, 0.9510565162951536);
        // roots[1] = vec2(-0.8090169943749475, 0.5877852522924731);
        // roots[2] = vec2(-0.8090169943749475, -0.5877852522924731);
        // roots[3] = vec2(0.30901699437494745, -0.9510565162951535);
        // roots[4] = vec2(1.0, 0.0);



        // colors[0] = vec4(1.0, 0.5686, 0.0, 0.4);
        // colors[1] = vec4(0.0196, 0.5686, 0.1098, 0.4);
        // colors[2] = vec4(0.5176, 0.5529, 0.0118, 1.0);

        colors[0] = col(154 , 93, 93,   255  );
        colors[1] = col(109 , 167, 109, 255);
        colors[2] = col(99 , 129, 159,  255 );

    vec2 Z = toCartesian(gl_FragCoord.xy);
    vec2 a = vec2(1.0, 0);
    
    const int MAX_ITER_FULL = 500;
    int MAX_ITER = 50;

    for (int _=0; _ < MAX_ITER_FULL; _++) { 
        Z = newton(Z, a);

        for (int i=0; i < 3; i++) {
            vec2 dif = add(Z, -roots[i]);
            float tolerance = 0.0000001;

            if (abs(dif.x) < tolerance && abs(dif.y) < tolerance) {            
                vec4 color =   colors[i];      
                float value = float(_)/float(MAX_ITER);
                // value = float(MAX_ITER - _)/float(MAX_ITER);
                float smooth_ = float(_) + 1.0 - log(abs(sqrt(Z.x * Z.x + Z.y * Z.y))) / log(2.0);

                gl_FragColor = vec4(0.9255, 0.0549, 0.0549, 0.5);
                return;
            }

        }

        if (_ > MAX_ITER)
            break;
    }

    gl_FragColor = vec4(0.0157, 0.3137, 0.3137, 1.0);
}


