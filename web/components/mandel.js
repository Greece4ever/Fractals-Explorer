// mandel_exports
let mandel_exports = {"name" : "Mandelbrot"};

let myVar = 5;

function MandelImgres() {
    let preview = document.getElementById("preview");

    for (let i=0; i < 6; i++) {
        gl.uniform1i(selectedProgram.C_ALOGRITHM, i);

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
            gl.uniform1i(selectedProgram.C_ALOGRITHM, i);
        })

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                              0, 0, elm.width, elm.height);    
    }

    gl.uniform1i(selectedProgram.C_ALOGRITHM, 0);
}

CURRENT_CONFIG = mandel_exports;
console.log("hello", CURRENT_CONFIG)
