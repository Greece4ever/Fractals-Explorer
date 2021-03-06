

// BEGIN DEBUG.JS
    const style = (str) => {
        str = str.replaceAll("ERROR", "<b style=\"color: red\">ERROR</b>");
        str = str.replaceAll("SUCCESS", "<b style=\"color: #70e370\">SUCCESS</b>");
        str = str.replaceAll("INFO", "<b style=\"color: #2626bf\">INFO</b>");
        return str;
    }

    let consoleError = (header, str_err) => {
        err_div.innerHTML += `<pre> <b style="color: white">${header}</b><hr> <div style="color: white">${style(str_err)}</div></pre>`
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
            "WEBGL Renderer" : gl.getParameter(gl.RENDERER),
            "Browser Vendor": gl.getParameter(gl.VENDOR),
            "GPU Family" : info.renderer,
            "GPU Vendor" : info.vendor
        }
    }

    function printInfo() {
        let info = getHardWareInfo();

        let s = "";
        for (let item in info) {
            s += `<b style="color:#2626bf">${item}:\t</b>`;
            s += `<b style="color: white">${info[item]}</b>\n`
        } 

        consoleError("Hardware Info", s);
    }
// END DEBUG.JS

// BEGIN LOAD.JS
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    // canvas.height = 600;
    // canvas.width = 1000;
    // canvas


    const err_div = document.getElementById("errors");
    const gl = canvas.getContext("webgl2");
    var webgl_console;

    if (!gl) 
        consoleError("Initialising Context...", `ERROR: Webgl2 Not supported by Browser`)
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
            consoleError(`Compilation of shader <b style='color: green'>${types[type]}</b> failed`, compilationLog);
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

var fShader;

console_("[INFO] Loading Fragment Shader <b id=\"per0\">0%</b>");


let a = new XMLHttpRequest();
a.addEventListener("progress", (e) => {
    let percentage = "?";
    if (e.lengthComputable) {
        percentage = e.loaded / e.total * 100;
    }
    document.getElementById("per0").innerText = `${percentage}%`;
})

a.addEventListener("load", (e) => {
    fShader = a.response;
    init();
    // console.log(a.response);
})

a.open("GET", "/web/fragment.glsl");
a.send();

let res_div = document.getElementById("res_div");
res_div.style.width = `${window.innerWidth}px`;
let resolution_loc;

let observer = new ResizeObserver(() => {
    let width  = Number( res_div.style.width.split("px", 1)[0]  );
    let height = Number( res_div.style.height.split("px", 1)[0] );

    canvas.width  = width;
    canvas.height = height;

    if (resolution_loc != undefined) {
        gl.uniform2f(resolution_loc, width, height);
        gl.viewport(0, 0, width, height);
    }

});

observer.observe(res_div)