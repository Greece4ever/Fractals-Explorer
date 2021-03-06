const style = (str) => {
    str = str.replaceAll("ERROR", "<b style=\"color: red\">ERROR</b>");
    str = str.replaceAll("SUCCESS", "<b style=\"color: green\">SUCCESS</b>");
    str = str.replaceAll("INFO", "<b style=\"color: blue\">INFO</b>");
    return str;
}

let consoleError = (header, str_err) => {
    err_div.innerHTML += `<pre> <b style="color: white">${header}</b> <hr>${style(str_err)}</pre>`
}

let console_ = (str) => {
    webgl_console.innerHTML += `<span style="color: white">${style(str)}</span>\n`
}

const getHardWareInfo = () => {

    function getUnmaskedInfo(gl) {
        var unMaskedInfo = {
          renderer: '',
          vendor: ''
        };
  
        var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo != null) {
          unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
          unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
        }
  
        return unMaskedInfo;
      }

    let info = getUnmaskedInfo(gl);
    return {
        "User Agent": navigator.userAgent,
        "CPU Cores" : navigator.hardwareConcurrency,
        "WEBGL Renderer" : gl.getParameter(gl.RENDERER),
        "Browser Vendor": gl.getParameter(gl.VENDOR),
        "GPU Family" : info.renderer,
        "GPU Vendor" : info.vendor
    }
}

function printInfo() {
    let info = getHardWareInfo();

    let s = "";
    for (let item in info) {
        s += `<b style="color:blue">${item}:\t</b>`;
        s += `<b style="color: white">${info[item]}</b>\n`
    } 

    consoleError("Hardware Info", s);
}
