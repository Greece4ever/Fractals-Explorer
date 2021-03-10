// julia_exports

let julia_exports = {"name" : "Julia", "function" : null, "html" : null};


julia_exports["function"] = function() {
    let CORD_CANVAS = document.getElementById("cords_canvas");
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
    let zoom = (w - (w/2)) / X_END;
    let x_y_cords = document.getElementById("x_y_cords");

    function MapCords(x, y) {
      return [w / 2 + x * zoom, h / 2 - y * zoom]
    }

    function unMapCords(pX, pY) {
      return [
      ( pX - (w / 2) ) / zoom, -( pY - (h / 2) ) / zoom
      ]
    }

    let circle_pos = [0, 0];

    let abs = Math.abs;
    function drawLinesX(END, inc=0.3) {
      for (let i=0; abs(i) < abs(END + inc); i += inc) {
        let X = MapCords(i, 0)[0];
        ctx.moveTo(X, h);
        ctx.lineTo(X, 0);
      }
    }

    function drawCircle(x, y, r=5) {
        ctx.beginPath();
        ctx.strokeStyle = "#af098b";
        ctx.fillStyle   = "#1b1b9c";
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.moveTo(w/2, h/2)
            ctx.arc(h/2, h/2, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }


    function drawLinesY(inc=0.3) {
      for (let y=0; y < X_END; y+=inc) {
        let map = MapCords(0, y);
        ctx.moveTo(0, map[1]);
        ctx.lineTo(w, map[1])
      }

      for (let y=0; y > -X_END; y-=inc) {
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
      for (let x=0; x < X_END + 1; x+=2*inc) {
        drawTextX(x);
      }

      for (let x=0; x > -X_END - 1; x -= 2 * inc) {
        drawTextX(x);
      }

      for (let y=0; y < X_END + 1; y += 2 * inc) {
        drawTextY(y);
      }

      for (let y=0; y > -X_END - 1; y -= 2 * inc) {
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
        drawLinesX(X_END);
        drawLinesX(-X_END, -.3);
        drawLinesY();
        ctx.stroke();
      ctx.closePath();
    }
    

    function render() {
      ctx.clearRect(0, 0, w, h);
      drawAxis();
      drawCross();
      drawText();

      let [x, y] = MapCords(...circle_pos);
      drawLine(MapCords(0, 0), [x, y]);
      x_y_cords.innerText = `(${circle_pos[0].toFixed(2)} + ${circle_pos[1].toFixed(2)}i)`
      drawCircle(x, y);
      console.log(unMapCords( (w/2) +1, 0)[0]);

    }

    function drawLine(P0, P1) {
      ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.moveTo(...P0);
        ctx.lineTo(...P1);
      ctx.stroke();
      ctx.closePath();
    }


    CORD_CANVAS.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY > 0) 
        X_END += 0.1;
      else 
        X_END -= 0.1;

      zoom = (w - (w/2)) / X_END;
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
      
      render();
    })

    sliders.forEach(slider => {
      slider.addEventListener("input", () => {
        console.log("chnge")
      })
    })

    circle_pos = [-0.78, 0.13];
    render();
}

julia_exports["html"] = `
<div class="d-flex justify-content-center" style="display: inline; width: 100%; display: flex;">
<div style="width: 400px; height: 400px;margin-left: 20px;">

  <div id="x_y_cords" style="margin-left: 5px;color: white;position: absolute; font-size: 20px; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
    (x, y)
  </div>
  <canvas id="cords_canvas" style="border: 1px solid #e83e8c;"width="400px" height="400px">    
</div>
    <div style="margin-left: 40px; margin-right: 20px;width: 90%; color: #e83e8c; max-width: 400px;">
        <div>
            <label for="customRange1" class="form-label">Escape Radius</label>
            <input class="slider" style="background-color: transparent;" type="range" class="form-range" id="customRange1">
        </div>

        <div>
            <label for="customRange1" class="form-label">Iterations</label>
            <input class="slider" style="background-color: transparent;" type="range" class="form-range" id="customRange1">
        </div>

        <div>
            <label for="customRange1" class="form-label">Rotation</label>
            <input class="slider" style="background-color: transparent;" type="range" class="form-range" id="customRange1">
        </div>

    </div>
</div>

`;

CURRENT_CONFIG = julia_exports;
