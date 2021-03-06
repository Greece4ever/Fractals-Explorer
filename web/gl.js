function glCall(line) {
    let error = gl.getError();
    let status = "ERROR";
    if (error == gl.NO_ERROR) {
        status = "SUCCESS";
    }    
    console_(`[${status}] OpenGL ${error} (${errors[error]}) at line <b style="color: blue">${line}</b>`);
}

function attachListeners() {
    window.addEventListener("keydown", (e) => {
        held_keys[e.key.toLowerCase()] = true;
    })

    window.addEventListener("keyup", (e) => {
        held_keys[e.key.toLowerCase()] = false;
    })
}

function isKeyPressed(key) {
    let cached = held_keys[key];
    return cached === undefined ? false : cached;
}


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

let offset = {"x" : 850.0, "y" : 250.0, "zoom": 100.0, "velocity" : 500.0, "zoomVelocity" : 100.0, "runVelocity" : 200.0};
// let velocity = 500.0;


var offsetLocation, zoomLocation;

let FPS_COUNTER = document.getElementById("fps_counter");

function OrbitControl(timer) {
    let extraVelocity = 0.0;
    if (isKeyPressed("shift")) {
        extraVelocity = offset.runVelocity;
    }

    let velocity = offset.velocity + extraVelocity;
    let zoomVelocity = offset.zoomVelocity + extraVelocity;

    if (isKeyPressed("a")) {
        offset.x -= velocity * timer.getElapsedTime();
    }  

    if (isKeyPressed("d")) {
        offset.x += velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("w")) {
        offset.y += velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("s")) {
        offset.y -= velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("z")) {
        offset.zoom += zoomVelocity * timer.getElapsedTime();
    }

    if (isKeyPressed("x")) {
        offset.zoom -= zoomVelocity * timer.getElapsedTime();
    }

    gl.uniform2f(offsetLocation, offset.x, offset.y);
    gl.uniform1f(zoomLocation, offset.zoom);
}


var program, VAO, VBO;
var held_keys = [];

var frames = 0;
let fpsTimer = new Timer();


function init() {
    printInfo();
        consoleError("WEBGL", "");
        err_div.innerHTML += "<pre id=\"console\"></pre>"
        webgl_console = document.getElementById("console");
    
    const html = Prism.highlight(fShader, Prism.languages.glsl, 'glsl');

    document.getElementById("code").innerHTML = "<pre>" + html + "</pre>";

    program = createProgram(vShader, fShader);
    gl.useProgram(program);

    VAO = gl.createVertexArray();
        gl.bindVertexArray(VAO);
        glCall(new Error().lineNumber);


    VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);
        glCall(new Error().lineNumber);

    let position = gl.getAttribLocation(program, "pos");
        gl.enableVertexAttribArray(position);
        glCall(new Error().lineNumber);

    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 2 * sizeof_float, 0);
        glCall(new Error().lineNumber);

    // Uniforms
    resolution_loc   = gl.getUniformLocation(program, "u_resolution");
    offsetLocation = gl.getUniformLocation(program, "offset");
    zoomLocation   = gl.getUniformLocation(program, "zoom");

    

    gl.uniform2f(resolution_loc, canvas.width, canvas.height);
    gl.uniform2f(offsetLocation, 0, 0);
    gl.uniform1f(zoomLocation, 100.0);

    timer = new Timer();    

    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        OrbitControl(timer, offsetLocation);
        
        if (fpsTimer.getMiliseconds() >= 1000) {
            FPS_COUNTER.innerText = `FPS: ${frames}`;
            frames = 0;
            fpsTimer.restart();            
        }
        frames += 1;
        timer.restart();
        window.requestAnimationFrame(loop);
    }

    
    attachListeners();
    timer.restart();    
    fpsTimer.restart();

    loop();
}
