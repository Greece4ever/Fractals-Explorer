// mandel_exports
let mandel_exports = {
    "uniforms": ["C_ALOGRITHM", "RGB"],
    "function": null,
    "html" : null,
    "A_NUM" : 7
};

mandel_exports["title"] = `The Mandelbrot Set`;
mandel_exports["description"] = `For each $$(x, y)$$ points continue the sequence $$z_{n+1} = z_n^2 + c$$, (where $$z_0 = 0$$, and <b style="color: red">$$c = x+yi$$</b>), up to $$k$$ iterations until $$ |z_n| > 2 $$ or $$k$$ iterations have been reached. Then generate an RGB color from the total iterations (e.g $$rgb(0, \\frac{i}{k}*255$$, 0) where $$i$$ is the total iterations)`;


mandel_exports["function"] = function(program) {
    let preview = document.createElement("div");
    // preview.style.width = '100%'
        // preview.className = "scrollX d-flex justify-content-start";
        preview.style.marginBottom = "20px";
    
    let picker = document.createElement("input");
        picker.type = "color";
        picker.className = "form-control"
        picker.value = "#ffffff";


    picker.addEventListener("input", (e) => {
        let value = e.currentTarget.value;
        let val = hex_to_rgb(value).map(i => i / 255);
        program.pushUniform3f("RGB", ...val);
    })

    program.pushUniform3f("RGB", ...[1, 1, 1]);
        
    picker.style.width = "97%";
    picker.style.margin = "auto";
        
    preview.appendChild(picker)

    program.bind();
    program.updateCommonUniforms();

    let pictruesDiv = document.createElement("div");
        pictruesDiv.className = "scrollX d-flex justify-content-start";
        pictruesDiv.style.marginTop = "20px";


    for (let i=0; i < mandel_exports.A_NUM; i++) {
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

        // preview.appendChild(a_link);
        pictruesDiv.appendChild(a_link);
        

        let ctx = elm.getContext("2d");
        elm.addEventListener("click", () => {
            program.pushUniform1i("C_ALOGRITHM", i);
        })

        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                              0, 0, elm.width, elm.height);    
    }

    preview.append(pictruesDiv);

    mandel_exports["html"] = preview;
    program.pushUniform1i("C_ALOGRITHM", 0);

}

CURRENT_CONFIG = mandel_exports;
