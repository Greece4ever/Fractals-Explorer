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

    window.addEventListener("keypress", (e) => {
        switch (e.key.toLowerCase()) {
            case "1":
                gl.uniform1i(C_ALOGRITHM, 0);
                break;
            case "2":
                gl.uniform1i(C_ALOGRITHM, 1);

                break;
            case "3":
                gl.uniform1i(C_ALOGRITHM, 2);

                break;
            case "4":
                gl.uniform1i(C_ALOGRITHM, 3);

                break;
            case "5":
                gl.uniform1i(C_ALOGRITHM, 4);
                break;    
            case "6":
                gl.uniform1i(C_ALOGRITHM, 5);
                break;        
            case "enter":
                offset.zoom = 100.0;
                offset.zoomVelocity = 100.0;
                offset.velocity = 500.0;
                offset.x = 0.0;
                offset.y = 0.0;
                offset.rot = 0.0;
                break;
        }
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
        res_div.style.resize = "none";
        resizeCanvas(screen.width, screen.height);
        document.body.requestFullscreen();
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

        if (offset.zoom < 1) {
            offset.zoom = 2;
            offset.zoomVelocity = 100.0;
        }

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


function initFractals() {
    let fractalList = document.getElementById("fractalList");
    let PROG_PREVIEW = document.getElementById("PROGRAM_PREVIEW");

    let first;
    for (let i=0; i < shaders.length; i++) {
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
    finishLoading();
    timer.restart();    
    fpsTimer.restart();
    loop();
}
