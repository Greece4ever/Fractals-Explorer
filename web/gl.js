const sizeof_float = 32 / 8;
const triangle_vertices = 3;

let Vertices = [
    -1, -1,
    1, -1,
    1, 1,

    1, 1,
    -1, 1,
    -1, -1

    // 0, 1,
];



var compilationLog, webgl_console;

const style = (str) => {
    str = str.replaceAll("ERROR", "<b style=\"color: red\">ERROR</b>");
    str = str.replaceAll("SUCCESS", "<b style=\"color: green\">SUCCESS</b>");

    return str;
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

let consoleError = (header, str_err) => {
    err_div.innerHTML += `<pre> ${header}<hr>${style(str_err)}</pre>`
}

let console_ = (str) => {
    webgl_console.innerHTML += `${style(str)}\n`
}

function glCall(line) {
    let error = gl.getError();
    let status = "ERROR";
    if (error == gl.NO_ERROR) {
        status = "SUCCESS";
    }    
    console_(`[${status}] OpenGL ${error} (${errors[error]}) at line <b style="color: blue">${line}</b>`);
}


if (!gl) {
    consoleError("Initialising Context...", 
    `ERROR: Webgl2 Not supported by Browser`)
} 
else {
    consoleError("Initialising Context...", `SUCCESS: Initialised Webgl2 Context`)
}

let info = getHardWareInfo();

let s ="";
for (let item in info) {
    s += `<b style="color:blue">${item}:\t</b>`;
    s += `<b>${info[item]}</b>\n`
} 

consoleError("Hardware Info", s);

const createShader = (type, source_str) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source_str);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    console.log(compiled);
    if (!compiled) {
        console.log(type);
        compilationLog = gl.getShaderInfoLog(shader);
        consoleError(`Compilation of shader <b style='color: green'>${types[type]}</b> failed`, compilationLog);
        return false;
    }
    return shader;
}

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

let program = createProgram(vShader, fShader);
gl.useProgram(program);
consoleError("WEBGL", "");
err_div.innerHTML += "<pre id=\"console\"></pre>"
webgl_console = document.getElementById("console");

let VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);

glCall(new Error().lineNumber);

let VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

glCall(new Error().lineNumber);


let position = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(position);

glCall(new Error().lineNumber);

gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 2 * sizeof_float, 0);

glCall(new Error().lineNumber);


let color = gl.getUniformLocation(program, "colorX");

window.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        gl.uniform1f(color, Math.random());
    }
})

function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
    window.requestAnimationFrame(loop);
}


loop();

// gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
// gl.clear(gl.COLOR_BUFFER_BIT)

// glCall(new Error().lineNumber);


