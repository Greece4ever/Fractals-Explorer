// julia_exports

let julia_exports = {
  "name" : "Julia", "function" : null,
  "html" : null, 
  "uniforms" : ["c_start", "escape_radius", "iterations", "RGB", "power", "custom_position"],
  "helper" : {"M2D" : null}
};


julia_exports["title"] = `The Julia Set`;
julia_exports["description"] = `For every complex $$z_0$$ continue the sequence $$z_{n+1} = z_{n}^k + c $$, where $$c$$ and $$k$$ are variable complex numbers and,
up to $$Q$$ iterations until $$|z_n| > r$$ where $$r$$ is the escape radius (also variable) or $$Q$$ iterations have been reached. Generlization of the Mandelbrot set`;

julia_exports.helper.M2D = function(onStart, onMouseMove, onRender, setZoom=null) {
    //let CORD_CANVAS = document.getElementById("cords_canvas");
    let CORD_CANVAS = document.createElement("canvas");
      CORD_CANVAS.width = "400";
      CORD_CANVAS.height = "400";


    let ctx = CORD_CANVAS.getContext("2d");
    let sliders = Array.from( document.getElementsByClassName("slider"));
    let w = CORD_CANVAS.width;
    let h = CORD_CANVAS.height;    

    function createGradient() {
      let grd = ctx.createLinearGradient(0, 0, 200, 0);
        grd.addColorStop(0, "rgba(19, 118, 138, 1)");
        grd.addColorStop(1, "rgba(107, 3, 107, 1)");
        grd.addColorStop(0, "rgba(19, 62, 89, 1)");
      return grd;
    }

    let grd = createGradient();
    let X_END = 2;
    if (setZoom != null) {
      X_END = setZoom();      
    }

    let zoom = (w - (w/2)) / X_END;

    function MapCords(x, y) {
      return [w / 2 + x * zoom, h / 2 - y * zoom]
    }

    function unMapCords(pX, pY) {
      return [
      ( pX - (w / 2) ) / zoom, -( pY - (h / 2) ) / zoom
      ]
    }

    let circle_pos = [0, 0];
    let pix = 30;

    let UNIT = unMapCords( (w/2) + pix, 0)[0];

    let abs = Math.abs;
    function drawLinesX(END, inc=UNIT) {
      for (let i=0; abs(i) < abs(END + inc); i += inc) {
        let X = MapCords(i, 0)[0];
        ctx.moveTo(X, h);
        ctx.lineTo(X, 0);
      }
    }


    function drawLinesY(inc=0.3) {
      INC = (UNIT);

      for (let y=0; y < X_END; y+=INC) {
        let map = MapCords(0, y);
        ctx.moveTo(0, map[1]);
        ctx.lineTo(w, map[1])
      }

      for (let y=0; y > -X_END; y-=INC) {
        let map = MapCords(0, y);
        ctx.moveTo(0, map[1]);
        ctx.lineTo(w, map[1])
      }

    }


    function drawTextX(x) {
      let map = MapCords(x, 0);
      let fWidth = 10;
      ctx.font = `${fWidth}px Arial`;
      ctx.fillStyle = "white";
      ctx.fillText(`${x.toFixed(1)}`, (map[0] - fWidth / 2) , (map[1] + fWidth + 2));
    }


    function drawTextY(y) {
      if (y == 0)
        return;
      let map = MapCords(0, y);
      let fWidth = 10;
      ctx.font = `${fWidth}px Arial`;
      ctx.fillStyle = "white";
      ctx.fillText(`${y.toFixed(1)}i`, map[0] - fWidth / 2 - 2 , (map[1] + fWidth + 2));
    }


    function drawText(inc=0.3) {
      INC = 2*(UNIT);

      for (let x=0; x < X_END + 1; x+=INC) {
        drawTextX(x);
      }

      for (let x=0; x > -X_END - 1; x -= INC) {
        drawTextX(x);
      }

      for (let y=0; y < X_END + 1; y += INC) {
        drawTextY(y);
      }

      for (let y=0; y > -X_END - 1; y -= INC) {
        drawTextY(y);
      }
    }


    function drawCross() {
      ctx.beginPath();
        ctx.strokeStyle = "rgb(61, 54, 61)";
        ctx.lineWidth = 2;
        ctx.moveTo(...MapCords(-X_END, 0));
          ctx.lineTo(...MapCords(X_END, 0));
        
          ctx.moveTo(...MapCords(0,-X_END));        
          ctx.lineTo(...MapCords(0, X_END));

        ctx.stroke();
      ctx.closePath();

    }

    function drawAxis() {
      ctx.beginPath();
        ctx.strokeStyle = grd;
        drawLinesX(X_END,   UNIT);
        drawLinesX(-X_END, -UNIT);
        drawLinesY();
        ctx.stroke();
      ctx.closePath();
    }

  function render() {
      ctx.clearRect(0, 0, w, h);
      drawAxis();
      drawCross();
      drawText();
      onRender(ctx, MapCords, unMapCords);
    }

    let add = 0;

    CORD_CANVAS.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY > 0) 
        X_END += 0.1;
      else {
        X_END -= 0.1;
        if (X_END == 0)
            X_END = 0.1;
      }

      zoom = (w - (w/2)) / X_END;

    if (add > 20) {
      UNIT = unMapCords( (w/2) + pix, 0)[0];
      add = 0;
    }
    else
      add++;
    render();
    })

    let mouseDown = false;
    
    CORD_CANVAS.addEventListener("mousedown", () => mouseDown = true);
    CORD_CANVAS.addEventListener("mouseup", () => mouseDown = false);

    CORD_CANVAS.addEventListener("mousemove", (e) => {
      if (!mouseDown)
        return;

      let delta = e.target.getBoundingClientRect();
      let [x, y] = [e.x - delta.x, e.y - delta.y];

      circle_pos = unMapCords(x, y);

      onMouseMove(circle_pos[0], circle_pos[1]);
      render();
    });

    onStart(ctx, MapCords, unMapCords);

    render();
    return CORD_CANVAS;
}

julia_exports["function"] = function(program) {
  circle_pos = [-0.78, 0.13];
  program.pushUniform1i("custom_position", 1);
  program.pushUniform2f("c_start", ...circle_pos);    
  program.pushUniform1f("escape_radius", 20.0);
  program.pushUniform1i("iterations", 500);
  program.pushUniform3f("RGB", 1.0, 1.0, 1.0);

  let canvRow = document.getElementById("canvases");

  function drawLine(ctx, P0, P1) {
    ctx.beginPath();
      ctx.strokeStyle = "yellow";
      ctx.moveTo(...P0);
      ctx.lineTo(...P1);
    ctx.stroke();
    ctx.closePath();
  }

  function drawCircle(ctx, toCart, x, y, r=5) {
    ctx.beginPath();
    ctx.strokeStyle = "#af098b";
    ctx.fillStyle   = "#1b1b9c";
        ctx.arc(...toCart(x, y), r, 0, 2 * Math.PI);
        ctx.moveTo(...toCart(0, 0))
        ctx.arc(...toCart(0, 0), 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }


  function Complex() {
    let line_pos = [-0.78, 0.13];

    let parent = document.createElement("div");
      parent.style.position = "relative";

    let pos = document.createElement("span");
      pos.style.position = "absolute";
      pos.style.left = 0;
      pos.style.fontFamily = "'Shippori Mincho', serif";
      pos.innerText = `(${line_pos[0]} + ${line_pos[1]}i)`;
      pos.style.fontSize = "20px";

    program.pushUniform2f("c_start", ...line_pos);

    function draw(ctx, toCart) {
      drawLine(ctx, toCart(0, 0), toCart(...line_pos));
      drawCircle(ctx, toCart, ...line_pos, 5);
      program.pushUniform2f("c_start", ...line_pos);   
      pos.innerText = `(${line_pos[0].toFixed(2)} + ${line_pos[1].toFixed(2)}i)`;   
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

  function hexToRGB(hexColor){
    return {
      x: (hexColor >> 16) & 0xFF,
      y: (hexColor >> 8) & 0xFF,  
      z: hexColor & 0xFF,
    }
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
      VALUE = hexToRGB( Number("0x" + VALUE.split("#")[1]) );
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
          value = hexToRGB( Number("0x" + value.split("#")[1]) );
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
