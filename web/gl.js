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
        // console.log("Move", e.x);
        mpos.x = e.x;
        mpos.y = e.y;
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

let offset = {"rot" : 0.0, "x" : 0, "y" : 0, "zoom": 100.0, "velocity" : 500.0, "zoomVelocity" : 100.0, "runVelocity" : 200.0};
// let velocity = 500.0;


const toPixels = (x, y) => {
    let centerX = canvas.width  / 2.0 + offset.x;
    let centerY = canvas.height / 2.0 + offset.y;

    return [centerX + x * offset.zoom, centerY - y * offset.zoom]
}

const toCartesian = (pixel_posX, pixel_posY, deltaX=offset.x, zoom=offset.zoom) => {
    let centerX = canvas.width  / 2.0 + deltaX;
    let centerY = canvas.height / 2.0 + offset.y;
    
    return [   
        (pixel_posX  - centerX) / zoom,
       -(pixel_posY - centerY) /  zoom 
    ] 

}

function dict(normalised) {
    return {"x" : normalised[0], "y": normalised[1]}
}


var offsetLocation, zoomLocation, rotationLocation;

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
        offset.y += velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("s")) {
        offset.y -= velocity * timer.getElapsedTime();
    }

    if (isKeyPressed("z")) {
        let pixel_pos = {"x":mpos.x, "y" : mpos.y}
        
        let prev = dict(toCartesian(pixel_pos.x, pixel_pos.y));
        offset.zoom += zoomVelocity * timer.getElapsedTime();

        

        let newDeltaX = pixel_pos.x - (canvas.width / 2) - (prev.x * offset.zoom);
        let newDeltaY = (prev.y * offset.zoom) + pixel_pos.y - (canvas.height / 2);
        //         // let new_deltaX = mouse_pos.x - prev[0] * offset.zoom - (canvas.width / 2);
        //         // let new_deltaY = (prev[1] * offset.zoom) + mouse_pos.y + (canvas.height / 2);

        offset.x = newDeltaX;
        offset.y = newDeltaY;
        // offset.y = new_deltaY;
    }

    if (isKeyPressed("q")) {
        offset.zoomVelocity += 500.0;
    }

    if (isKeyPressed("x")) {
        offset.zoom -= zoomVelocity * timer.getElapsedTime();
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

    document.getElementById("code").innerHTML       = "<pre>" + html + "</pre>";
    document.getElementById("codeVertex").innerHTML = "<pre>" + html2 + "</pre>";

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

    

    gl.uniform2f(resolution_loc, canvas.width, canvas.height);
    gl.uniform2f(offsetLocation, 0, 0);
    gl.uniform1f(zoomLocation, 100.0);
    gl.uniform1f(rotationLocation, 0.0);

    timer = new Timer();    

    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        OrbitControl(timer, offsetLocation);

        
        let pos = toCartesian(mpos.x, mpos.y);
        document.getElementById("pos_counter").innerText = `(${pos[0].toFixed(2)}, ${pos[1].toFixed(2)})`;
        
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


function generateTable() {
	let table = {"sin" : [], "cos" : []};

	for (let i=0; i <= 360; i++) {
        table.sin.push(Math.sin(i));
        table.cos.push(Math.cos(i));
    }
    return table;
}
