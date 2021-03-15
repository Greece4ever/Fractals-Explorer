let parent = document.getElementById("parent");
let canvas = document.createElement("canvas");
canvas.width = "800";
canvas.height = "800"
canvas.style.border = "5px solid green"
    parent.appendChild(canvas);
let gl = canvas.getContext("webgl2");

const sizeof_float = 32 / 8;

function glInit() {
    VAO = gl.createVertexArray();
        gl.bindVertexArray(VAO);
            glCall(new Error().lineNumber);

    VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);
            glCall(new Error().lineNumber);
}

class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static size() {
        let sizeof_float = 4; 
        return 3 * sizeof_float;
    }
}

class Square {
    constructor(x, y, z, size) { // square sitting like bottom of coffe
        this.vertices = [];
        this.vertices[0] = new Vertex(x, y, z);
        this.vertices[1] = new Vertex(x + size, y, z);
        this.vertices[2] = new Vertex(x + size, y, z + size);
        this.vertices[3] = new Vertex(x, y, z + size);
    }

    static size() {
        return 4 * Vertex.size();
    }

    static IBO() {
        return [0, 1, 2, 2, 3, 0];
    }
}

class SquareArray {
    constructor() {
        this.squares = [];
    };

    append(square) {
        console.log(square)
        this.squares.push(square);
    }

    toArr() {
        let Vertices = new Float32Array(this.squares.length * 4 * 3);
        let k = 0;
        for (let i=0; i < this.squares.length; i++) {
            for (let j=0; j < 4; j++) {
                Vertices[k]   = this.squares[i].vertices[j].x;                
                Vertices[++k] = this.squares[i].vertices[j].y;                
                Vertices[++k] = this.squares[i].vertices[j].z;                
            }
        }
        return Vertices;
    }

    getTriangles() {
        return this.squares.length / 2;
    }

    toIBO() {
        let square_IBO = Square.IBO();
        let IBO = new Int32Array(this.squares.length * square_IBO.length);
        let k = 0;
        let col_size = 4; // number of square vertices
        for (let i=0; i < this.squares.length; i++) {
            for (let j=0; j < col_size; j++) {
                IBO[k] = square_IBO[j] + i * col_size;
                k++;
            }
        }
        return IBO;
    }
}


var VBO, IBO, VAO;
let program = createProgram(vertexShader, fragmentShader);
    gl.useProgram(program);

VAO = gl.createVertexArray();
VBO = gl.createBuffer();
IBO = gl.createBuffer()


const triangle_vertices = 3;
const vector_size = 2;
let Vertices = new Float32Array( 2 * 3 * 50000 );

// triangle_vertices * vector_size * 1 
var index = 0;
let trianges = 0;

function addTriangle(x, y) {
    let points = [
        [x, y],
        [x - 0.5, y - 0.5],
        [x + 0.5, y - 0.5],
    ]

    for (let i=0; i < 3; i++) {
        for (let k=0; k < 2; k++) {
            Vertices[index] = points[i][k];
            index++;
        }
    }
    trianges++;
    return [points[1], points[2]]
}


function sprinski(x, y) {
    if (trianges >= 5000)
        return

    let cords = addTriangle(x, y);

    let t1 = addTriangle(...cords[0]);
    let t2 = addTriangle(...cords[1]);    
    return [t1[0], t2[1]]
}


function sierpinski(x, y, order) {
    if (isNaN(order))
        return console.log(NaN)

    if (order == 0) {
        let cords = addTriangle(x, y);

        let t1 = addTriangle(...cords[0])[0];
        let t2 = addTriangle(...cords[1])[1];    
        return [t1, t2]
    }
    
    let ret = sierpinski(x, y, order - 1);

    let r1 = sierpinski(...ret[0], order - 1);

    let r2 = sierpinski(...ret[1], order - 1);
    return [r1[0], r2[1]];
}

gl

let a = sierpinski(0, 0, 7);




gl.bindVertexArray(VAO);
gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, Vertices, gl.STATIC_DRAW)

let DELTA = [0, 0]

let pos = gl.getAttribLocation(program, "pos");
let delta = gl.getUniformLocation(program,"delta");
let zLocation = gl.getUniformLocation(program, "zoom");
let ZOOM = 0.5;


gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 2 * sizeof_float, 0);
// glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);

let offset = {
    "rot" : 0.0, "x" : 0, "y" : 0,
    "zoom": 100.0, "velocity" : 500.0, 
    "zoomVelocity" : 100.0, "runVelocity" : 200.0
};


class Camera {
    static cols = 4;
    
    constructor(width, height) {
        this.aspectRatio = width / height;
        this.matrix = new Float32Array(4 * 4);

    }

    update() {
        let zX = this.aspectRatio * offset.zoom;
        let zY = offset.zoom;
        this.ortho(
            -1.0 * zX + offset.x,
             1.0 * zX + offset.x,
            -1.0 * zY + offset.y,
             1.0 * zY + offset.y
        );
    }


    set(x, y, value) {
        this.matrix[y * Camera.cols + x] = value;
    }

    ortho(left, right, bottom, top) {
        this.set(0, 0,   2 / (right - left))
        this.set(1, 1,   2 / (top - bottom))
        this.set(2, 2,   -1)
        this.set(3, 0, - (right + left) / (right - left))
        this.set(3, 1, - (top + bottom) / (top - bottom) )
    }
}

function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0,  3 * trianges);
    if (isKeyPresed("s")) {
        DELTA[1] += 0.01 * clock.getElapsedTime();
    }

    if (isKeyPresed("x")) {
        ZOOM -= 0.001 * clock.getElapsedTime();
    }

    if (isKeyPresed("x")) {
        ZOOM -= 0.001 * clock.getElapsedTime();
    }


    gl.uniform2f(delta, ...DELTA);
    gl.uniform1f(zLocation, ZOOM);

    window.requestAnimationFrame(loop);
}

clock.restart();
loop();
