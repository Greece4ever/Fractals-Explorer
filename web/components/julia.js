// julia_exports

let julia_exports = {
  "function" : null,
  "html" : null, 
  "uniforms" : ["c_start", "escape_radius", "iterations", "RGB", "power", "custom_position"],
  "helper" : {"M2D" : createCanvas}
};


julia_exports["title"] = `The Julia Set`;
julia_exports["description"] = `For every complex $$z_0$$ continue the sequence $$z_{n+1} = z_{n}^k + c $$, where $$c$$ and $$k$$ are variable complex numbers and,
up to $$Q$$ iterations until $$|z_n| > r$$ where $$r$$ is the escape radius (also variable) or $$Q$$ iterations have been reached. Generlization of the Mandelbrot set`;


julia_exports["function"] = function(program) {
  circle_pos = [-0.78, 0.13];
  program.pushUniform1i("custom_position", 1);
  program.pushUniform2f("c_start", ...circle_pos);    
  program.pushUniform1f("escape_radius", 20.0);
  program.pushUniform1i("iterations", 500);
  program.pushUniform3f("RGB", 1.0, 1.0, 1.0);

  let canvRow = document.getElementById("canvases");


  function Complex() {
    let line_pos = [-0.78, 0.13];

    let parent = document.createElement("div");
      parent.style.position = "relative";

    let pos = document.createElement("span");
      pos.style.position = "absolute";
      pos.style.left = 0;
      pos.style.marginLeft = "5px";
      pos.style.fontFamily = "'Shippori Mincho', serif";
      pos.innerText = `(${line_pos[0]} + ${line_pos[1]}i)`;
      pos.style.fontSize = "20px";

    program.pushUniform2f("c_start", ...line_pos);

    function draw(ctx, toCart) {
      drawLine(ctx, toCart(0, 0), toCart(...line_pos));
      drawCircle(ctx, toCart, ...line_pos, 5);
      program.pushUniform2f("c_start", ...line_pos);   
      pos.innerHTML = katex.renderToString(`(${line_pos[0].toFixed(2)} + ${line_pos[1].toFixed(2)}i)`, {
        throwOnError: false
    });
    }

    let new_canvas = julia_exports.helper.M2D(
      (ctx, toCart) => draw(ctx, toCart), // start
      (x, y) => { line_pos = [x, y] },   // mouse move 
      (ctx, toCart) => draw(ctx, toCart) // onRender
    );

    parent.appendChild(pos);
    parent.appendChild(new_canvas);
  
    return parent;
  }

  function EscapeRadius() {
    let parent = document.createElement("div");
      parent.style.position = "relative";
    let rText = document.createElement("span");
      rText.style.position = "absolute";
      rText.style.left = 1;
      rText.style.marginLeft = "10px";
      rText.style.fontFamily = '"Shippori Mincho", serif';
      rText.innerText = "r = 5";
    

    parent.appendChild(rText);

    function drawCircle0(ctx, toCart, r) {
      ctx.beginPath();

      ctx.strokeStyle = "rgb(247, 212, 54)";
          ctx.arc(...toCart(0, 0), r, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();  
      rText.innerText = `r = ${radius.toFixed(4)}`;
      program.pushUniform1f("escape_radius", radius);
    }

    function distance(P0, P1) {
      return Math.hypot(P1[0]-P0[0], P1[1]-P0[1]);
  }

    let radius = 20;

    let new_canvas = julia_exports.helper.M2D(
      (ctx, toCart) => drawCircle0(ctx, toCart, radius),
      (x, y) => {radius = distance([0, 0], [x, y])},
      (ctx, toCart) => drawCircle0(ctx, toCart, radius),
      () => 100
    );

    parent.appendChild(new_canvas);

    return parent;
  }

  document.querySelector(`input[type="color"]`).value = "#650688";

  let startCanvas = Complex();
  let escCanvas = EscapeRadius();
  let sliders = Array.from( document.getElementsByClassName("slider") );


  sliders.forEach(slider => {
    let NAME = slider.getAttribute("uniform");
    let VALUE = slider.value;
    if (slider.getAttribute("type") !== "color") {
      program.pushUniform1i(NAME, Number( VALUE ));
    } else {
      VALUE = hexToRGB( VALUE );
      program.pushUniform3f(NAME, VALUE.x, VALUE.y, VALUE.z);
    }

    slider.addEventListener("input", (e) => {
      let el = e.target;
      let name = el.getAttribute("uniform");
      let value = e.target.value;

      switch (el.getAttribute("type_")) {
        case "int": {
          value = Number( value );
          program.pushUniform1i(name, value);
        }
        break;
        case "vec3": {
          value = hexToRGB( value );
          program.pushUniform3f(name, value.x, value.y, value.z);
        }
        break;
      }
    })

  })
  

  program.pushUniform1i("iterations", 1000);
  // startCanvas.style.marginLeft = "20px";


  canvRow.appendChild(startCanvas);
    startCanvas.classList.add("cvs");
    escCanvas.classList.add("cvs");
  canvRow.appendChild(escCanvas);

  let cpos = document.getElementById("cpos");

  cpos.addEventListener("click", () => {
    if (cpos.getAttribute("val") === "1") {
      cpos.setAttribute("val", "0");
      program.pushUniform1i("custom_position", 0);
        cpos.className = "btn btn-primary";
        cpos.innerText = "Enable Custom Position";
    }
    else {
      cpos.setAttribute("val", "1");
      program.pushUniform1i("custom_position", 1);
        cpos.className = "btn btn-danger";
        cpos.innerText = "Disable Custom Position";
    }
  })


}


julia_exports["html"] = `
  <div>

    <div id="canvases" class="row d-flex justify-content-around">
      <div style="margin-left: 40px; margin-right: 20px;width: 90%; color: #e83e8c; max-width: 400px;">
          <div>
              <label for="customRange1" class="form-label">Complex Power</label>
              <input type_="int" min="1" max="8" value="2" uniform="power" value="2" class="slider" style="background-color: transparent;" type="range" class="form-range" >
          </div>

          <div>
              <label for="customRange1" class="form-label">Iterations</label>
              <input type_="int" uniform="iterations" min="0" max="1000" value="500" class="slider" style="background-color: transparent;" type="range" class="form-range" >
          </div>

          <div>
              <label for="customRange1" class="form-label">Color multiplier</label>
              <input type_="vec3" uniform="RGB"  class="slider form-control" style="
              background: linear-gradient(90deg, rgb(2, 0, 36) 31%, rgb(84, 84, 122) 68%, rgba(4,5,5,0.8533614129245448) 74%);
              " type="color" value="#ffffff" class="form-range" >
          </div>
          <div style="margin-top: 50px">
            <button val="0" id="cpos" style="width: 100%" type="button" class="btn btn-danger">Disable Custom Position</button>
          </div>

      </div>
      
    </div>

  </div>

`;

CURRENT_CONFIG = julia_exports;
