// mandel_exports
let mandel_exports = {
    "name" : "Mandelbrot", 
    "uniforms": ["C_ALOGRITHM"],
    "function": null,
    "html" : null
};


mandel_exports["function"] = function(program) {
    let preview = document.createElement("div");
        preview.className = "scrollX d-flex justify-content-start";
        preview.style.marginBottom = "20px";
        // preview.style.overflowX = "auto !important";
        // preview.test = "123"
    
    program.bind();
    program.updateCommonUniforms();
    console.log("hello1")

    for (let i=0; i < 6; i++) {
        // gl.uniform1i(selectedProgram.C_ALOGRITHM, i);
        program.pushUniform1i("C_ALOGRITHM", i);

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 2 * triangle_vertices);
        // debugger;
        
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
            program.pushUniform1i("C_ALOGRITHM", i);
        })

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                              0, 0, elm.width, elm.height);    
    }
    mandel_exports["html"] = preview;
    program.pushUniform1i("C_ALOGRITHM", 0);
}

CURRENT_CONFIG = mandel_exports;
