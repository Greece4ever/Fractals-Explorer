let zoomElement = document.getElementById("zoom");

function glCall(line) {
    let error = gl.getError();
    let status = "ERROR";
    if (error == gl.NO_ERROR) {
        status = "SUCCESS";
    }    
    console_(`[${status}] OpenGL ${error} (${errors[error]}) at line <b style="color: blue">${line}</b>`);
}

let useAcceleromenter = false;

function reset() {
    offset.zoom = 100.0;
    offset.zoomVelocity = 100.0;
    offset.velocity = 500.0;
    offset.x = 0.0;
    offset.y = 0.0;
    offset.rot = 0.0;
}

let mouseDown = false;

const onMouseMove = (e) =>
{
    let delta = e.target.getBoundingClientRect();

    let prev_X = mpos.x;
    let prev_Y = mpos.y;

    mpos.x = e.clientX - delta.x;
    mpos.y = e.clientY - delta.y;

    if (!mouseDown)
        return;

    let dx = (mpos.x - prev_X);
    let dy = (mpos.y - prev_Y);

    offset.x -= dx;
    offset.y -= dy;
}

function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
} 

function enableFullScreen(but_full)
{
    resizeCanvas(screen.width, screen.height);
    
    res_div.style.resize = "none";
    resizeCanvas(screen.width, screen.height);
    document.body.requestFullscreen();
    setTimeout(() => {
        resizeCanvas(screen.width, screen.height);
    }, 100)
    
    if (but_full)
    {
        but_full[0].style.visibility = "hidden";
        but_full[1].style.visibility = "visible";
    
    }
}

let isFullScreen = false;

function attachListeners() {
    // NOTE -> BUG: window.ondevicemotion works only when the page is served via HTTPS
    window.addEventListener("devicemotion", (e) => {
        if (!useAcceleromenter)
            return;

        let x = e.accelerationIncludingGravity.x;
        let y = e.accelerationIncludingGravity.y;

        let deltaY = 25.0;
        let DX = x * 25.0 *  timer.getElapsedTime();
        let DY;

            
        if (y > 0) 
            DY = y * (deltaY / 2) * timer.getElapsedTime();
        else
            DY = y * deltaY * timer.getElapsedTime();            

        offset.x -= DX;
        offset.y += DY;

    })

    resetButton.addEventListener("click", () => {
        reset();
    })

    accelerometer.addEventListener("click", (e) => {

        if (e.currentTarget.getAttribute("state") === "1") {
            e.currentTarget.setAttribute("state", "0");
            let value = "Accelerometer <b style='color: #d76363'>OFF</b>";
            e.currentTarget.setAttribute("title", value);
            e.currentTarget.setAttribute("data-original-title", value);
            useAcceleromenter = false;
        }
        else {
            let value = "Accelerometer <b style='color: rgb(72, 250, 105)'>ON</b>";
            e.currentTarget.setAttribute("state", "1");
            e.currentTarget.setAttribute("title", value);
            e.currentTarget.setAttribute("data-original-title", value);
            useAcceleromenter = true;
        }

        $(e.currentTarget).tooltip("update");
        $(e.currentTarget).tooltip("show");
    })

    window.addEventListener("keydown", (e) => {
        held_keys[e.code.toLowerCase().replace("key", "")] = true;
    })

    window.addEventListener("keypress", (e) => {
        switch (e.key.toLowerCase()) {
            case "enter":
                reset();
                break;
        }
    })

    
    window.addEventListener("keyup", (e) => {
        held_keys[e.code.toLowerCase().replace("key", "")] = false;
    })

    res_div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        mouseDown = true;
    })


    res_div.addEventListener("mouseup", () => {
        mouseDown = false;
    })

    res_div.addEventListener("mouseleave", () => {
        if (!isFullScreen)
            mouseDown = false;
    })


    canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        mouseDown = true;
    })

    canvas.addEventListener("mouseup", (e) => {
        mouseDown = false;
    })


    window.addEventListener("mouseleave", () => {
        mouseDown = false;
    })

    res_div.addEventListener("mousemove", (e) => {
        onMouseMove(e);
    })

    canvas.addEventListener("mousemove", (e) => {
        onMouseMove(e);
    })

    res_div.addEventListener("touchmove", (e) => {
        let delta = e.target.getBoundingClientRect();
        let touches = e.touches[0];
        
        if (e.touches.length > 1) {
            let diff = e.touches[1].clientX - delta.x;
            let dx = offset.prevX - diff;
            if (timer)
                offset.zoomVelocity -= 500 * dx * timer.getElapsedTime();
            offset.prevX = diff;    
        }
        

        mpos.x = touches.clientX - delta.x;
        mpos.y = touches.clientY - delta.y;
        
    })

    res_div.addEventListener("touchstart", (e) => {
        e.preventDefault();
        held_keys["shiftleft"] = true;

        let delta = e.target.getBoundingClientRect();
        let touches = e.touches[0];

        if (e.touches.length > 1) {
            held_keys["q"] = true;
        }
        
        mpos.x = touches.clientX - delta.x;
        mpos.y = touches.clientY - delta.y;

    })

    res_div.addEventListener("touchend", (e) => {
        if (e.changedTouches.length === 1) {
            if (e.changedTouches[0].identifier === 1) {
                held_keys["q"] = false;    
            }
            else {
                held_keys["shiftleft"] = false;
            }
        }
        else {
            held_keys["shiftleft"] = false;
            held_keys["q"] = false;    
        }
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

    let but_full = document.getElementsByClassName("full_scren_btn");

    if (but_full.length == 2)
    {
        but_full[0].style.visibility = "visible";
        but_full[1].style.visibility = "hidden";

        but_full[0].addEventListener("click", () => {
            enableFullScreen(but_full);
        })    

        but_full[1].addEventListener("click", () => {
            closeFullscreen();
            but_full[0].style.visibility = "visible";
            but_full[1].style.visibility = "hidden";
        })        
    }


    res_div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        enableFullScreen(but_full);
    })
    
    document.body.addEventListener("fullscreenchange", (e) => {
        isFullScreen = document.fullscreenElement == e.target;
        if (!isFullScreen)
        {
            // console.log("not fullscren")
            but_full[0].style.visibility = "visible";
            but_full[1].style.visibility = "hidden";
        }
    })

    function zoomInto(delta) {
        let count = 0;
        let interval = setInterval(() => {
            if (count === 20)
                clearInterval(interval);

                let prev_cmpos = toCartesian(mpos.x, mpos.y);

                offset.zoom += zoomVelocity * delta * timer.getElapsedTime();
        
                if (offset.zoom < 1) {
                    offset.zoom = 2;
                    offset.zoomVelocity = 100.0;
                }
        
                let pX =  mpos.x;
                let pY =  mpos.y;
        
                offset.x = -(-((prev_cmpos.x * offset.zoom) - pX) - mid.x);
                offset.y = -(-(-( prev_cmpos.y * offset.zoom) - pY) - mid.y);
            count++;
            zoomElement.innerText = `${offset.zoom.toExponential(2)}`
        }, 10)
    }

    
    res_div.addEventListener("wheel", (e) => {
        e.preventDefault();
        zoomInto(-e.deltaY)
    })

    // For fullscreen
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        zoomInto(-e.deltaY)
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
    "zoomVelocity" : 100.0, "runVelocity" : 200.0,
    "prevX" : 0, "prevAX" : 0
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

var velocity;
var zoomVelocity;

// Triggered when one key is pressed
let KeyEvents = [
    ["a", (timer) => offset.x -= velocity * timer.getElapsedTime(), "Move Left"],
    ["d", (timer) => offset.x += velocity * timer.getElapsedTime(), "Move Right"],
    ["w", (timer) => offset.y -= velocity * timer.getElapsedTime(), "Move Up"],
    ["s", (timer) => offset.y += velocity * timer.getElapsedTime(), "Move Down"],
    ["q", (     ) => offset.zoomVelocity += 500.0, "Accelerate *"],
    ["e", (     ) => offset.zoomVelocity *= 2, "Accelerate  2x *"],
    ["r", (     ) => offset.zoomVelocity /= 2, "Deccelerate 2x *"],

    ["arrowright", (timer) => {
        offset.rot += 2 * timer.getElapsedTime();
        if (offset.rot > FOR_PI) {
            offset.rot = 0;
        }
    }, "Rotate in +Y" ],
    ["arrowleft", (timer) => {
        offset.rot -= 2 * timer.getElapsedTime();
        if (offset.rot < -FOR_PI) {
            offset.rot = 0;
        }
    }, "Rotate in -Y"]
]

// Triggered when either of 2 keys is pressed
let DoubleKeyEvents = [
    [ ["shiftleft", "x"], (z_pressed, x_pressed, timer) => {
        let prev_cmpos = toCartesian(mpos.x, mpos.y);

        if(z_pressed) 
            offset.zoom += zoomVelocity * timer.getElapsedTime();
        if (x_pressed)
            offset.zoom -= zoomVelocity * timer.getElapsedTime();

        if (offset.zoom < 1) {
            offset.zoom = 2;
            offset.zoomVelocity = 100.0;
        }

            let pX =  mpos.x;
            let pY =  mpos.y;


        offset.x = -(-((prev_cmpos.x * offset.zoom) - pX) - mid.x);
        offset.y = -(-(-( prev_cmpos.y * offset.zoom) - pY) - mid.y);
        zoomElement.innerText = `${offset.zoom.toExponential(2)}`
    }, "Zoom In/Out" ]
]

function keyTemplate(left, right)
{
    return (`
    <div  style="width: 90%; margin: auto;font-family: 'Orbitron', sans-serif;" class="row d-flex justify-content-between">
        <div class="col">
            <label style="color: #fff">${left}</label>
        </div>
        <div style="pointer-events: none; user-select: none; color: #fff" class="col">
            ${right}
        </div>
    </div>

    <hr style="color: #fff; background-color: #424040">
    `)
}


function attachControls() {
    let control = document.getElementById("controls")
    KeyEvents.forEach(event => {
        let expr = event[2].replace("*", "<b style='color: red'>*</b>")
        control.innerHTML += keyTemplate(expr, `<img  style="float: right; width: 32px" src="./key_icons/${event[0].replace("arrow", "")}.svg">`)
    })

    control.innerHTML += keyTemplate("Reset", `<img  style="float: right; width: 32px" src="./key_icons/enter.svg">`)

    DoubleKeyEvents.forEach(event => {
        console.log("--->", event)
        let expr = event[2].replace("*", "<b style='color: red'>*</b>")
        control.innerHTML += `
        <div  style="width: 90%; margin: auto;font-family: 'Orbitron', sans-serif;" class="row d-flex justify-content-between">
            <div class="col">
                <label style="color: #fff">${expr}</label>
            </div>
            <div style="pointer-events: none; user-select: none; float: right" class="col">
            <img  style="width: 64px" src="./key_icons/${event[0][0]}.svg">

                    <svg style='width: 40px; height: 40px;'>
                    <line x1="0" y1="40" x2="40" y2="0"
                        style="stroke:rgb(69, 68, 66);stroke-width:2"/>
                    </svg>

            <img  style="width: 32px" src="./key_icons/${event[0][1]}.svg">

            </div>
        </div>
        <hr style="color: #fff; background-color: #424040">    
    `    
    })


    control.innerHTML += keyTemplate("Move Arround", "Move Mouse with left pressed");
    control.innerHTML += keyTemplate("Zoom In/out", "Scroll Wheel");
}


function OrbitControl(timer) {
    let extraVelocity = 0.0;

    if (isKeyPressed("shiftleft")) {
        extraVelocity = offset.runVelocity;
    }

    velocity = offset.velocity + extraVelocity;
    zoomVelocity = offset.zoomVelocity + extraVelocity;

    KeyEvents.forEach(event => {
        if (isKeyPressed(event[0]))
            event[1](timer);
    })

    DoubleKeyEvents.forEach(event => {

        let pressed_0 = isKeyPressed(event[0][0]);
        let pressed_1 = isKeyPressed(event[0][1]);
        if (pressed_0 || pressed_1)
            event[1](pressed_0, pressed_1, timer);
    })


    selectedProgram.updateCommonUniforms();
}


var program, VAO, VBO;
var held_keys = [];
var mpos = {"x" : 0, "y" : 0};

var frames = 0;
let fpsTimer = new Timer();

var selected;

function initSyntax() {
    let CODE_ORG = document.getElementById("code");
    for (let i=0; i < shaders.length; i++) {
        let HTML = Prism.highlight(shaders[i], Prism.languages.glsl, 'glsl');
        let ID = Math.random();
        CODE_ORG.innerHTML += `<pre id="${ID}" style="color:white !important">${HTML}</pre>`;
            let code = document.getElementById(ID.toString());

        let element = document.createElement("option");
            element.innerText = shader_paths[i];
        
        element.addEventListener("click", () => {
            let sel_elm = document.getElementById(selected);
            
            sel_elm.style.visibility = "hidden";
            sel_elm.style.position = "absolute";
            sel_elm.style.display = "none";

            let this_code = document.getElementById(ID);

            this_code.style.visibility = "visible";
            this_code.style.position = "relative";
            this_code.style.removeProperty("display");

            selected = ID;
        })

        SELECT_DIV.appendChild(element);

        if (i !== 0) {
            code.style.visibility = "hidden";
            code.style.position = "absolute";
            code.style.display = "none";
        } else {
            selected = ID;
        }
    }
    const html2 = Prism.highlight(vShader, Prism.languages.glsl, 'glsl');
    document.getElementById("codeVertex").innerHTML = `<pre style="color:white !important">` + html2 + "</pre>";
}

let CURRENT_SHADER;
var TEST_IMAGE;

function initFractals() {
    let fractalList = document.getElementById("fractalList");
    let PROG_PREVIEW = document.getElementById("PROGRAM_PREVIEW");

    let first;
    for (let i=0; i < shaders.length; i++) {
        if (config[i]["edit_shader"]) {
            CURRENT_SHADER = i;
            config[i]["edit_shader"](...config[i]["edit_args"]);
        }

        let program = new ProgramGL(shaders[i]);
            program.bind();

        for (let k=0; k < config[i]["uniforms"].length; k++) {
            let u_name = config[i]["uniforms"][k];
            program.uniforms[u_name] = gl.getUniformLocation(program.program, u_name);
        }


        let func = config[i]["function"];
        let html = config[i]["html"];
        let wasNull = false;
    

        let ELEMENT = document.createElement("div");


        if (!html) {
            wasNull = true;
            html = "";
        }
        else {
            if (typeof html === "string")
                ELEMENT.innerHTML =  html;
            else
                ELEMENT.appendChild(html);

            PROG_PREVIEW.appendChild(ELEMENT);
        }            


        if (func !== undefined) {
            func(program);
            if (wasNull) {
                html = config[i]["html"];
                if (typeof html === "string")
                    ELEMENT.innerHTML =  html;
                else
                    ELEMENT.appendChild(html);
                PROG_PREVIEW.appendChild(ELEMENT);
            }
        }


        if (i !== 0) {
            ELEMENT.style.display = "none";
        } else {
            active_preview = ELEMENT;
        }



        program.updateCommonUniforms();
        programs.push(program);


            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);

            let a_link = document.createElement("a");
            

            a_link.href= "#";
        
            let elm = document.createElement("canvas");
                elm.width = window.innerWidth / 4;
                elm.height = 600 / 4;
            elm.classList.add("canvas");

            
            // Tooltip
                elm.setAttribute("data-toggle", "tooltip");
                elm.setAttribute("data-html", "true");
                // elm.setAttribute("data-placement", "bottom")
                // $(elm).tooltip({container: 'body'});

            
            let full_text = `<b style="color: #60adff">${config[i]["title"]}</b><br>${replaceMath(config[i]["description"])}`
            elm.setAttribute("title", full_text);
    
            a_link.appendChild(elm);
            a_link.classList.add("col-sm");

            a_link.addEventListener("click", () => {
                programs[i].bind();
                programs[i].updateCommonUniforms();
                
                active_preview.style.display = "none";
                
                active_preview = ELEMENT;
                active_preview.style.removeProperty("display");
            });
    
            fractalList.appendChild(a_link);
            
            let ctx = elm.getContext("2d");
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                                  0, 0, elm.width, elm.height);    
    }
    // programs[0].bind();

}

class ProgramGL {
    constructor(fragmentShader) {
        this.program = createProgram(vShader, fragmentShader);
        this.getLocations();
        this.uniforms = {};
    }

    getLocations() {
        this.resolution_loc   = gl.getUniformLocation(this.program, "u_resolution");
        this.offsetLocation   = gl.getUniformLocation(this.program, "offset");
        this.zoomLocation     = gl.getUniformLocation(this.program, "zoom");
        this.rotationLocation = gl.getUniformLocation(this.program, "ROTATION");
    }

    bind() {
        gl.useProgram(this.program);
        selectedProgram = this;
        gl.enableVertexAttribArray(selectedProgram.getVertexPosition());
        gl.vertexAttribPointer(this.vertex_position, 2, gl.FLOAT, false, 2 * sizeof_float, 0);
    }

    updateCommonUniforms() {
        gl.uniform2f(this.resolution_loc,   canvas.width, canvas.height);
        gl.uniform2f(this.offsetLocation,   offset.x, offset.y);
        gl.uniform1f(this.zoomLocation,     offset.zoom);
        gl.uniform1f(this.rotationLocation, offset.rot);
    }

    getVertexPosition() {
        if (this.vertex_position !== undefined)
            return this.vertex_position;
        this.vertex_position = gl.getAttribLocation(this.program, "pos");
        return this.vertex_position;
    }

    setUniform(name) {
        this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }

    pushUniform2f(name, x, y) {
        gl.uniform2f(this.uniforms[name], x, y);
    }

    pushUniform1f(name, x) {
        gl.uniform1f(this.uniforms[name], x);
    }

    pushUniform1i(name, x) {
        gl.uniform1i(this.uniforms[name], x);
    }

    pushUniform3f(name, x, y, z) {
        gl.uniform3f(this.uniforms[name], x, y, z);
    }


    getUniform(name) {
        return this.uniforms[name];
    }
};


function glInit() {
    VAO = gl.createVertexArray();
        gl.bindVertexArray(VAO);
            glCall(new Error().lineNumber);

    VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);
            glCall(new Error().lineNumber);
}

function init() {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    printInfo();
        consoleError("WEBGL", "");
        err_div.innerHTML += "<pre id=\"console\"></pre>"
        webgl_console = document.getElementById("console");
    

    initSyntax();
    glInit();
    initFractals();

    programs[0].bind();
    programs[0].updateCommonUniforms();
    

    timer = new Timer();    
    let pos_counter = document.getElementById("pos_counter");

    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        OrbitControl(timer);

        let pos = toCartesian(mpos.x, mpos.y);
        pos_counter.innerText = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
        
        if (fpsTimer.getMiliseconds() >= 1000) {
            FPS_COUNTER.innerText = `FPS: ${frames}`;
            frames = 0;
            fpsTimer.restart();            
        }
        frames += 1;
        timer.restart();
        window.requestAnimationFrame(loop);
    }



    canvas.focus();
    attachListeners();
    attachControls();
    finishLoading();
    timer.restart();    
    fpsTimer.restart();
    held_keys["shiftleft"] = false;
    loop();
}
