const createShader = (type, source_str) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source_str);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        compilationLog = gl.getShaderInfoLog(shader);
        console.log(source_str)
        console.log("Failed to Compile\n", compilationLog)
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
        console.log('[ERROR] Could not compile WebGL program. ');
        console.log(`[ERROR] ${info}`);
        setError("Failed to link/compile WebGL shader program, check the logs below.");
    }
    return program;
}

function glCall(line) {
    let error = gl.getError();
    let status = "ERROR";
    if (error == gl.NO_ERROR) {
        status = "SUCCESS";
    }    
    console.log(`[${status}] OpenGL ${error}  at line <b style="color: blue">${line}</b>`);
}


let vertexShader = `
#version 300 es
precision mediump float;

in vec2 pos;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * vec4(pos, 0.0, 1.0);
}`.trim();

let fragmentShader = `
#version 300 es
precision mediump float;

out vec4 color;

void main() {
    color = vec4(0, 0, 1.0, 1.0);
}
`.trim();

class Timer {
    constructor() {
        this.time = 0;
    }

    toSeconds(miliseconds) {
        return miliseconds * 0.001;
    }    
    
    restart() {
        this.time = performance.now();
    }   

    getMiliseconds() {
        return performance.now() - this.time;
    }

    getElapsedTime() {
        return this.toSeconds(performance.now() - this.time);
    }
}
let keys = [];

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
})

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
})


function isKeyPresed(key) {
    let K = keys[key];
    return K === undefined ? false : K;
}


let clock = new Timer();
