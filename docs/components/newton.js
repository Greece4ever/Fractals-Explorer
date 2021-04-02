function createExports(id=0) {

let newton_exports = {
    "edit_shader" : true,
    "edit_args" : [],
    "function" : null,
    "isNewton" : true,
    "html" : null,
    "root_lengths" : [],
    "uniforms": ["USE_SMOOTH", "SWITCH_ALPHA", "COLOR0", "COLOR1", "COLOR2", "RGB", "MAX_ITER", "tolerance", "ALPHA", "tolerance", "MAX_ITER"],
    "funcs" : {},
    "pos" : 40
}

newton_exports["title"] = `The Newton Fractal`;
newton_exports["description"] = `Given a function $$f:\\mathbb{C} \\rightarrow \\mathbb{C}$$ and it's roots ($$x_0$$, $$x_1$$, ... $$x_i$$), each
root having a unique color ($$C_0$$, $$C_1$$, $$C_i$$),
apply Newton's Method ($$ z_{n+1} = z_n - \\frac{f(z_n)}{f'(z_n)} $$) for each complex number $$z$$ up to $$k$$ iterations.
Then if $$z_k$$ has converged to one of the roots $$x_i$$ (or $$z_k - x_i < t$$ where $$t$$ is a number close to zero you choose (tolerance)), color the point $$(x, y)$$ (taken from <b style="color:red">$$z = x + yi$$</b>) with color $$C_i$$.`;

newton_exports["function"] = function(program) {
    function createColor(text, value="#ffffff") {
        let parent = document.createElement("div");
            parent.style.marginTop = "20px";
        let label = document.createElement("label");
            label.classList.add("form-label");
            label.innerText = text;
        let elm = document.createElement("input");
        elm.setAttribute('type', 'color');
            elm.style = "background: linear-gradient(90deg, rgb(2, 0, 36) 31%, rgb(84, 84, 122) 68%, rgba(4,5,5,0.8533614129245448) 74%);"
            elm.className = "slider form-control";
            elm.value = value;
        
        parent.appendChild(label);
        parent.appendChild(elm);
        return parent;
    }


    let COLORS = [[154 , 93, 93], [109 , 167, 109], [99 , 129, 159], [255, 255, 255] ];
    let btn_names = ["Enable Smoothing", "Swap Opacity"]

    let COL_PARENT = document.getElementById(`peos${id}`);
    let CAN_PARENT = document.getElementById(`newton_canvas${id}`); CAN_PARENT.style.position = "relative";
    let BUT_PARENT = document.getElementById(`button_parent${id}`);

    Array.from(BUT_PARENT.children).forEach(element => {
        if (element === undefined || element.children[1] === undefined)
            return;
        element.children[1].addEventListener("input", (e) => {
            let value = Number(e.currentTarget.value);
            let uniform = e.currentTarget.getAttribute("uniform");
            switch (e.currentTarget.getAttribute("type_")) {
                case "float": {
                    program.pushUniform1f(uniform, value)
                    break;
                }
                case "int": {
                    program.pushUniform1i(uniform, value);
                    break;
                }
            }
        })
    })

    for (let i=2; i <= 5; i++) {
        let name = `Root ${i - 2} RGB value`;
        if (i == 5) {
            name = `Color Multiplier`;
        }
        let color = createColor(name, rgbToHex(...COLORS[i - 2]));
        
        color.childNodes[1].addEventListener("input", (e) => {
            program.pushUniform3f(newton_exports.uniforms[i], ...(hex_to_rgb(e.currentTarget.value)).map(i => i /255) )
        })
        program.pushUniform3f(newton_exports.uniforms[i], ...(COLORS[i-2]).map(i => i / 255) )
        COL_PARENT.appendChild(color);
    }

    for (let i=0; i < 2; i++) {
        let UNIFORM = newton_exports.uniforms[i];
        let but = document.createElement("button");
            but.innerText = btn_names[i];
            but.style.width = "100%";
            but.style.marginTop = "50px";

        but.className = "btn btn-danger";
        but.setAttribute('val', "0");
            but.addEventListener("click", (e) => {
                e.currentTarget.blur();
                let value = e.currentTarget.getAttribute('val');
                if (value === "0") {
                    e.currentTarget.setAttribute('val', "1");
                    e.currentTarget.className = "btn btn-primary"
                    program.pushUniform1i(UNIFORM, 1);
                }
                else {
                    e.currentTarget.setAttribute('val', "0"); 
                    e.currentTarget.className = "btn btn-danger";
                    program.pushUniform1i(UNIFORM, 0);
                }
            })
            BUT_PARENT.appendChild(but);
    }

    let line_pos = [1, 0];
    let pos = document.createElement("span");
        pos.style.position = "absolute";
        pos.style.color = "white"
        pos.style.left = 0;
        pos.style.marginLeft = "5px";
        pos.style.fontFamily = "'Shippori Mincho', serif";
        pos.innerText = `(${line_pos[0]} + ${line_pos[1]}i)`;
        pos.style.fontSize = "20px";
        pos.style.userSelect = "none";
        pos.style.pointerEvents = "none";


    function draw(ctx, toCart) {
        drawLine(ctx, toCart(0, 0), toCart(...line_pos));
        drawCircle(ctx, toCart, ...line_pos, 5);
        program.pushUniform2f("ALPHA", ...line_pos);   
        pos.innerHTML = katex.renderToString(`(${line_pos[0].toFixed(2)} + ${line_pos[1].toFixed(2)}i)`, {
          throwOnError: false
      });
      }
  

    let CAN = createCanvas((ctx, toCart) => draw(ctx, toCart), (x, y) => { line_pos = [x, y] }, (ctx, toCart) => draw(ctx, toCart));

    CAN.style.border = "1px solid #91378c";
    CAN_PARENT.append(pos);
    CAN_PARENT.appendChild(CAN);    

    program.pushUniform1f("tolerance", 0.0000001);
    program.pushUniform2f("ALPHA", ...line_pos);
    program.pushUniform1i("MAX_ITER", 50);
}

newton_exports["html"] = `
<div class="row d-flex justify-content-around">
    <div id="peos${id}" style="width: 25%">


    </div>
    
    <div>
        <div id="newton_canvas${id}">

        </div>
    </div>

    <div id="button_parent${id}" style="margin-left: 40px; margin-right: 20px; color: #e83e8c; max-width: 400px;">
          <div>
              <label for="customRange1" class="form-label">Tolerance</label>
              <input uniform="tolerance" type_="float" min="0" max="0.1" step="0.0000000001" value="0.0000001" class="slider" style="background-color: transparent;" type="range" class="form-range" >
          </div>

          <div>
              <label for="customRange1" class="form-label">Iterations</label>
              <input uniform="MAX_ITER" type_="int" min="0" max="500" value="50" class="slider" style="background-color: transparent;" type="range" class="form-range" >
          </div>


      </div>


    
</div>


`

newton_exports.edit_shader = (func, deriv, roots) => {
    shaders[CURRENT_SHADER] = shaders[CURRENT_SHADER].replace("%%FUNCTION",   func);
    shaders[CURRENT_SHADER] = shaders[CURRENT_SHADER].replace("%%DERIVATIVE", deriv);
    shaders[CURRENT_SHADER] = shaders[CURRENT_SHADER].replace("%%ROOTS",      roots);
}

return newton_exports;
}

function findNewton() {
    for (let i=0; i < config.length; i++) {
        if (config[i].isNewton) {
            return true;
        }
    }    
    return false;
}



if (!findNewton()) {
    let newton_exports = createExports(0);
    newton_exports.description += "This is for the function <b style='color: rgb(0, 98, 204);'>$$f(z) = z^{3} - 1$$</b>"
    newton_exports.edit_args = ["add(pow3(z), -vec2(1.0, 0))", "mul(pow2(z), vec2(3, 0))", "vec2 roots[3] = vec2[3](vec2(-0.5 , -0.8660254037844387), vec2(1.0 , 0.0), vec2(-0.5 , 0.8660254037844387));"];
    CURRENT_CONFIG = newton_exports;    
} else {
    let newton_exports2 = createExports(1);
    newton_exports2.description += "This is for the function  <b style='color: rgb(0, 98, 204);'>$$f(z) = z^{3} - 2z + 2$$</b>"
    newton_exports2.edit_args = ["add(add(pow3(z), vec2(2 , 0)), mul(z, -vec2(2, 0)))", "add(mul(pow2(z), vec2(3, 0)), vec2(-2, 0))", "vec2  roots[3] = vec2[3](vec2( 0.8846461771193157,   -0.5897428050222054), vec2(-1.7692923542386314,   0.0), vec2( 0.8846461771193157,   0.5897428050222054));"];
    CURRENT_CONFIG = newton_exports2;    
}

