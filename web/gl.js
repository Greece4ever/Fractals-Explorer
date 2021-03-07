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

    res_div.addEventListener("mousemove", (e) => {
        let delta = e.target.getBoundingClientRect();
        mpos.x = e.clientX - delta.x;
        mpos.y = e.clientY - delta.y;
    })

    document.addEventListener('fullscreenchange', (e) => {
        if (document.mozFullScreen !== undefined) {
            if (!document.mozFullScreen) {
                res_div.style.resize = "horizontal";
            }
        }
        else if (document.webkitIsFullScreen !== undefined) {
            if (!document.webkitIsFullScreen) {
                res_div.style.resize = "horizontal";
            }
        }
    })

    res_div.addEventListener("click", () => {
        console.log("click");
        res_div.style.resize = "none";
        resizeCanvas(screen.width, screen.height);
        document.body.requestFullscreen();
        console.log("hello world");
        setTimeout(() => {
            resizeCanvas(screen.width, screen.height);
        }, 100)
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


let offset = {
    "rot" : 0.0, "x" : 0, "y" : 0,
    "zoom": 100.0, "velocity" : 500.0, 
    "zoomVelocity" : 100.0, "runVelocity" : 200.0
};

const toCartesian = (pX, pY) => {
    const center = new Vector(
        mid.x - offset.x,
        mid.y - offset.y
    );

    return new Vector(
         (pX - center.x) / offset.zoom, 
        -(pY - center.y) / offset.zoom 
    );
}


var offsetLocation, zoomLocation, rotationLocation;
var C_ALOGRITHM;
let FPS_COUNTER = document.getElementById("fps_counter");


const TWO_PI = Math.PI;
const FOR_PI = 2 * TWO_PI; 


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
        offset.y -= velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("s")) {
        offset.y += velocity * timer.getElapsedTime();
    }

    let z_pressed = isKeyPressed("z");
    let x_pressed = isKeyPressed("x");

    if (z_pressed || x_pressed) {
        let prev_cmpos = toCartesian(mpos.x, mpos.y);

        if(z_pressed) 
            offset.zoom += zoomVelocity * timer.getElapsedTime();
        if (x_pressed)
            offset.zoom -= zoomVelocity * timer.getElapsedTime();

            let pX =  mpos.x;
            let pY =  mpos.y;


        offset.x = -(-((prev_cmpos.x * offset.zoom) - pX) - mid.x);
        offset.y = -(-(-( prev_cmpos.y * offset.zoom) - pY) - mid.y);
        document.getElementById("zoom").innerText = `${offset.zoom.toExponential(2)}`
    }


    if (isKeyPressed("q")) {
        offset.zoomVelocity += 500.0;
    }

    if (isKeyPressed("k")) {
        offset.zoomVelocity *= 2;
    }


    if (isKeyPressed("e")) {
        offset.zoomVelocity -= 500.0;
    }
    if (isKeyPressed("l")) {
        offset.zoomVelocity /= 2;
    }



    if (isKeyPressed("arrowright")) {
        offset.rot += 2 * timer.getElapsedTime();
        if (offset.rot > FOR_PI) {
            offset.rot = 0;
        }
    }

    if (isKeyPressed("arrowleft")) {
        offset.rot -= 2 * timer.getElapsedTime();
        if (offset.rot < -FOR_PI) {
            offset.rot = 0;
        }
    }


    gl.uniform2f(offsetLocation,   offset.x, offset.y);
    gl.uniform1f(zoomLocation,     offset.zoom);
    gl.uniform1f(rotationLocation, offset.rot );
}


var program, VAO, VBO;
var held_keys = [];
var mpos = {"x" : 0, "y" : 0};

var frames = 0;
let fpsTimer = new Timer();


function init() {
    printInfo();
        consoleError("WEBGL", "");
        err_div.innerHTML += "<pre id=\"console\"></pre>"
        webgl_console = document.getElementById("console");
    
    const html = Prism.highlight(fShader, Prism.languages.glsl, 'glsl');
    const html2 = Prism.highlight(vShader, Prism.languages.glsl, 'glsl');

    document.getElementById("code").innerHTML       = `<pre style="color:white !important">` + html + "</pre>";
    document.getElementById("codeVertex").innerHTML = `<pre style="color:white !important">` + html2 + "</pre>";

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
    rotationLocation = gl.getUniformLocation(program, "ROTATION");
    C_ALOGRITHM = gl.getUniformLocation(program, "C_ALOGRITHM");
    

    gl.uniform2f(resolution_loc, canvas.width, canvas.height);
    gl.uniform2f(offsetLocation, 0, 0);
    gl.uniform1f(zoomLocation, 100.0);
    gl.uniform1f(rotationLocation, 0.0);
    gl.uniform1i(C_ALOGRITHM, 0);

    timer = new Timer();    

    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        OrbitControl(timer, offsetLocation);

        
        let pos = toCartesian(mpos.x, mpos.y);
        document.getElementById("pos_counter").innerText = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
        
        if (fpsTimer.getMiliseconds() >= 1000) {
            FPS_COUNTER.innerText = `FPS: ${frames}`;
            frames = 0;
            fpsTimer.restart();            
        }
        frames += 1;
        timer.restart();
        window.requestAnimationFrame(loop);
    }

    let preview = document.getElementById("preview");

    for (let i=0; i < 6; i++) {
        gl.uniform1i(C_ALOGRITHM, i);

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        
        let a_link = document.createElement("a");
        a_link.href= "#";
    
        let elm = document.createElement("canvas");
            elm.width = window.innerWidth / 4;
            elm.height = 600 / 4;
        elm.classList.add("canvas");

        a_link.appendChild(elm);
        a_link.classList.add("col-sm");

        preview.appendChild(a_link);
        let ctx = elm.getContext("2d");
        elm.addEventListener("click", () => {
            gl.uniform1i(C_ALOGRITHM, i);
        })

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                              0, 0, elm.width, elm.height);    
    }

    gl.uniform1i(C_ALOGRITHM, 0);


    canvas.focus();
    attachListeners();
    timer.restart();    
    fpsTimer.restart();

    loop();
}

