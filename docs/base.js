let err_div_log = document.getElementById("ERROR_COMPILATION");

function disableError() {
    err_div_log.style.visibility = "hidden";
    err_div_log.style.position = "absolute";
}

function setError(str) {
    err_div_log.style.visibility = "visible";
    err_div_log.style.position = "relative";
    err_div_log.children[0].innerHTML = str;
}

disableError();

// BEGIN DEBUG.JS
    const style = (str) => {
        str = str.replaceAll("ERROR", "<b style=\"color: red\">ERROR</b>");
        str = str.replaceAll("SUCCESS", "<b style=\"color: #70e370\">SUCCESS</b>");
        str = str.replaceAll("INFO", "<b style=\"color: #6290e0\">INFO</b>");
        return str;
    }

    let consoleError = (header, str_err) => {
        err_div.innerHTML += `<pre> <code style="color: rgb(233, 74, 147)">${header}</b><hr> <div style="color: white">${style(str_err)}</div></pre>`
    }

    let console_ = (str) => {
        webgl_console.innerHTML += `<span style="color: white">${style(str)}</span>\n`
    }

    const getHardWareInfo = () => {

        function getUnmaskedInfo(gl) {
            var unMaskedInfo = {
            renderer: '',
            vendor: ''
            };
    
            var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (dbgRenderInfo != null) {
            unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
            unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
            }
    
            return unMaskedInfo;
        }

        let info = getUnmaskedInfo(gl);
        return {
            "User Agent": navigator.userAgent,
            "CPU Cores" : navigator.hardwareConcurrency,
            "WebGL Renderer" : gl.getParameter(gl.RENDERER),
            "WebGL Vendor": gl.getParameter(gl.VENDOR),
            "GPU Family" : info.renderer,
            "GPU Vendor" : info.vendor
        }
    }

    function printInfo() {
        let info = getHardWareInfo();

        let s = "";
        for (let item in info) {
            s += `<b style="color:#6290e0">${item}:\t</b>`;
            s += `<b style="color: white">${info[item]}</b>\n`
        } 

        consoleError("Hardware Info", s);
    }
// END DEBUG.JS

// BEGIN LOAD.JS
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 30;

    const err_div = document.getElementById("errors");
    const gl = canvas.getContext("webgl2");
    var webgl_console;

    if (!gl) {
        consoleError("Initialising Context...", `ERROR: Webgl2 Not supported by Browser`);
        setError("WebGL2 not supported by browser, cannot continue.");
    }
    else 
        consoleError("Initialising Context...", `SUCCESS: Initialised Webgl2 Context`)

    consoleError("Loading Shaders...", "");
    err_div.innerHTML += "<pre id=\"console0\"></pre>";
    webgl_console = document.getElementById("console0");
// END LOAD.JS

// BEGIN LOOKUP TABLES
    const sizeof_float = 32 / 8;
    const triangle_vertices = 3;

    let errors = {};
    let types = {};

    errors[gl.NO_ERROR]             = "GL_NO_ERR"
    errors[gl.INVALID_ENUM]         = "GL_INVALID_ENUM";
    errors[ gl.INVALID_VALUE ]      = "GL_INVALID_VALUE";
    errors[ gl.INVALID_OPERATION ]  = "GL_INVALID_OPERATION";
    errors[ gl.STACK_OVERFLOW ]     = "GL_STACK_OVERFLOW";
    errors[ gl.STACK_UNDERFLOW ]    = "GL_STACK_UNDERFLOW";
    errors[ gl.OUT_OF_MEMORY ]      = "GL_OUT_OF_MEMORY";
    errors[ gl.INVALID_FRAMEBUFFER_OPERATION ] = "GL_INVALID_FRAMEBUFFER_OPERATION";
    errors[ gl.CONTEXT_LOST ] = "GL_CONTEXT_LOST";
    errors[ gl.TABLE_TOO_LARGE1 ] = "GL_TABLE_TOO_LARGE1";

    types[gl.VERTEX_SHADER] = "gl.VERTEX_SHADER";
    types[gl.FRAGMENT_SHADER] = "gl.FRAGMENT_SHADER"; 

    let Vertices = [
        // Triangle 0
        -1, -1,
        1, -1,
        1, 1,

        // Triangle 1
        1, 1,
        -1, 1,
        -1, -1
    ];
// END LOOKUP TABLES

// BEGIN GL_WRAPPER.JS
    // Compile shader from source
    const createShader = (type, source_str) => {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source_str);
        gl.compileShader(shader);
        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            compilationLog = gl.getShaderInfoLog(shader);
            let str1 = `Compilation of shader <b style='color: green'>${types[type]}</b> failed`;
            let str2 =  compilationLog;
            consoleError(str1, str2);
            setError(`Failed to compile shader <b style="color : #fff">${types[type]}</b>. Additional information can be found in the console output below.`);
            return false;
        }
        return shader;
    }

    // Create Program from Vertex and fragment shader
    const createProgram = (vertex_src, fragment_src) => {
        let program = gl.createProgram();
            let v_shader = createShader(gl.VERTEX_SHADER,   vertex_src);
            let f_shader = createShader(gl.FRAGMENT_SHADER, fragment_src);
        gl.attachShader(program, v_shader);
        gl.attachShader(program, f_shader);

        gl.linkProgram(program);
            gl.detachShader(program, v_shader);
            gl.detachShader(program, f_shader);    

            gl.deleteShader(v_shader);
            gl.deleteShader(f_shader);

        if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
            var info = gl.getProgramInfoLog(program);
            consoleError('Could not compile WebGL program. ', info);
            setError("Failed to link/compile WebGL shader program, check the logs below.");
        }
        return program;
    }
// END GL_WRAPPER.JS

const vShader = `
#version 300 es

in vec2 pos;

void main() {
    gl_Position = vec4(pos, 0.0, 1.0);
}
`.trim();

var fShader = `
#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform vec2  offset; 
uniform float zoom;
uniform float ROTATION;
uniform int   C_ALOGRITHM;

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
        case 0:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4( smooth_ * 0.05, value, smooth_ * value, 1);
            break;
        }
        case 1:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4(value / smooth_, 0.0, value, 1);
            break;
        }
        case 2:
        {
            float delta = log2(z.real) * value * exp(b_2 / a_2);
            FragColor = vec4(delta, value, log(delta / (1.0 - delta * value)), 1.0);
            break;

        }
        case 3:
        {
            float sm = pow(log(value * MATH_PI), log2(MATH_PI));
            FragColor = vec4(value *  log2(2.718 * sm),  1.0/sm, value, 1);
            break;
        }
        case 4: {
            FragColor = vec4(0.0, value, 0.0, 1.0);
            break;
        }
        case 5: {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_2 = smooth_ + 1.0 - log(smooth_ * abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_3 = sin(z.real *  MATH_PI) * log(smooth_ / smooth_2);
            FragColor = vec4(sin(smooth_3), sin(smooth_), cos(smooth_2), 1.0);
            break;
        }
    }
}
`.trim();

console_("[INFO] Loading Fragment Shader <b id=\"per0\">0%</b>");


let res_div = document.getElementById("res_div");
res_div.style.width = `${window.innerWidth - 30}px`;

let resolution_loc;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var mid = new Vector(canvas.width / 2.0, canvas.height / 2.0);

function resizef() {
    let width  = Number( res_div.style.width.split("px", 1)[0]  );
    let height = Number( res_div.style.height.split("px", 1)[0] );
    
    mid.x = width  / 2.0;
    mid.y = height / 2.0;

    canvas.width  = width;
    canvas.height = height;

    if (resolution_loc != undefined) {
        gl.uniform2f(resolution_loc, width, height);
        gl.viewport(0, 0, width, height);
    }
}

function resizeCanvas(width, height) {
    mid.x = width  / 2.0;
    mid.y = height / 2.0;

    canvas.width  = width;
    canvas.height = height;

    if (resolution_loc != undefined) {
        gl.uniform2f(resolution_loc, width, height);
        gl.viewport(0, 0, width, height);
    }

}

let observer = new ResizeObserver(() => {
    resizef();
});

observer.observe(res_div)

window.addEventListener("resize", () => {
    res_div.style.width = `${window.innerWidth - 30}px`;
    resizef();
})

init();