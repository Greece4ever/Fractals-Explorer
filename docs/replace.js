$("[data-toggle=tooltip]").tooltip();
$("body").tooltip({
    selector: '[data-toggle="tooltip"]',
    // trigger: 'manual'
  // container: 'window'
});

// $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' })

function isMobile() {
  var match = window.matchMedia || window.msMatchMedia;
  if(match) {
      var mq = match("(pointer:coarse)");
      return mq.matches;
  }
  return false;
}


let mobile = document.getElementById("mobile");
let resetButton = document.getElementById("resetButton");
let accelerometer = document.getElementById("Accelerometer");

if (!isMobile()) {
  mobile.remove();
}

function findInside(str, match) {
    let i = str.indexOf(match); str = str.replace(match, ' ');
    let j = str.indexOf(match); str = str.replace(match, ' ');
    return [i, j == -1 ? str.length : j, str];
  }
  
  function removeAtRange(str, x, y) {
    return str.substring(x, y);
  }
  
  function splitAtRange(str, x, y) {
    return str.substring(0, x) + str.substring(y, str.length);
  }
  
  function insert_at(str, insrt, pos) {
    return str.slice(0, pos) + insrt + str.slice(pos, str.length);
  }
  
  
  
  function replaceMath(str, ptrn="$$") {
    let ind = findInside(str, ptrn); // Find where it starts and ends 
    let sub_str;
    while (ind[0] != -1) {
      str= ind[2]; // End
      sub_str = removeAtRange(str, ind[0], ind[1]); // math string
      str = splitAtRange(str, ind[0], ind[1]); // rest of the string
      
      let html = katex.renderToString(sub_str, {throwOnError: false});
      str = insert_at(str, html, ind[0]);
      ind = findInside(str, ptrn);
    }
    return str;
  }
  
function createCanvas(onStart, onMouseMove, onRender, setZoom=null) {
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

    CORD_CANVAS.addEventListener("touchstart", () => mouseDown = true);
    CORD_CANVAS.addEventListener("touchend", () => mouseDown = true);
    

    CORD_CANVAS.addEventListener("mousemove", (e) => {
      if (!mouseDown)
        return;

      let delta = e.target.getBoundingClientRect();
      let [x, y] = [e.x - delta.x, e.y - delta.y];

      circle_pos = unMapCords(x, y);

      onMouseMove(circle_pos[0], circle_pos[1]);
      render();
    });

    CORD_CANVAS.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!mouseDown)
        return;

      let touches = e.touches[0];
      let delta = e.target.getBoundingClientRect();
      let [x, y] = [touches.clientX - delta.x, touches.clientY - delta.y];

      circle_pos = unMapCords(x, y);

      onMouseMove(circle_pos[0], circle_pos[1]);
      render();
    })

    onStart(ctx, MapCords, unMapCords);

    render();
    return CORD_CANVAS;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRGB(hexColor){
  hexColor = Number("0x" + hexColor.split("#")[1])
  return {
    x: (hexColor >> 16) & 0xFF,
    y: (hexColor >> 8) & 0xFF,  
    z: hexColor & 0xFF,
  }
}    

function hex_to_rgb(value) {
  let rgb = hexToRGB(value);
  return [rgb.x, rgb.y, rgb.z];
}

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



// Chrome >= 85
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str, repl) {
    let replaced_str = "";
    let cur = this + "";
    let index = cur.indexOf(str); // this (refering to instance new String() )
    while (index !== -1) {
      	let start = index + str.length;
			let temp = cur.substring(0, start);
      temp = temp.replace(str, repl);
      	replaced_str += temp;
      cur = cur.slice(start, cur.length);
      
      index = cur.indexOf(str);
            
    }
    return replaced_str;
  }
}