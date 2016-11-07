(function(){
  function mirror(sett) {
    if (sett.length > 2 && sett[0].match('/') && sett[sett.length - 1].match('/')) {
      sett[0] = sett[0].replace('/', '');
      sett[sett.length - 1] = sett[sett.length - 1].replace('/', '');
      for (var i = sett.length - 2; i > 0; i--) {
        sett.push(sett[i]);
      }
    }
    return sett;
  }

  function parse(sett) {
    var palette = {
      A: [0x0D, 0x47, 0xA1], B: [0x21, 0x96, 0xF3], G: [0x43, 0xA0, 0x47],
      I: [0x3F, 0x51, 0xB5], K: [0x00, 0x00, 0x00], N: [0x9E, 0x9E, 0x9E],
      O: [0xFF, 0x98, 0x00], P: [0x9C, 0x27, 0xB0], R: [0xF4, 0x43, 0x36],
      T: [0x79, 0x55, 0x48], W: [0xFF, 0xFF, 0xFF], Y: [0xFF, 0xEB, 0x3B]
    };
    var threads = mirror(sett.replace(/([A-Z]+)(#|=|=#)([0-9A-F]{6})[^;]*;/gi, function(m, n, s, c){
        var color = parseInt('0x' + c);
        palette[n] = [(color & 0xFF0000) >> 16, (color & 0x00FF00) >> 8, color & 0x0000FF];
        return '';
      }).match(/[A-Z]+\/?[0-9]+/gi)).map(function (t) {
      var [c, w] = t.match(/[A-Z]+|[0-9]+/gi);
      return {
        color: palette[c] ? palette[c] : palette.W,
        width: parseInt(w)
      };
    });
    return {
      threads: threads,
      width: threads.reduce(function(w, t){ return w + t.width; }, 0)
    };
  }

  function sarge(x, y) {
    return Math.abs(x - y) % 4 < 2 ? 0 : 1;
  }

  function mix(posx, posy, width, height, colors) {
    var blob = new Uint8ClampedArray(4 * width * height);
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var t = colors[sarge(posx + x, posy + y)].concat(255);
        for (var c = 0; c < 4; c++) {
          blob[(y * width + x) * 4 + c] = t[c];
        }
      }
    }
    return new ImageData(blob, width, height);
  }

  function multiply(canvas, width, height) {
    var ctx = canvas.getContext("2d");
    var patt = ctx.getImageData(0, 0, width, height);
    var y = 0;
    while (y < canvas.height) {
      var x = 0;
      while (x < canvas.width) {
        ctx.putImageData(patt, x, y);
        x += width;
      }
      y += height;
    }
  }

  function render(canvas, sett) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    var ctx = canvas.getContext("2d");
    var py = 0;
    for (var y = 0; y < sett.threads.length; y++) {
      var px = 0;
      for (var x = 0; x < sett.threads.length; x++) {
        if (sett.threads[x].color == sett.threads[y].color) {
          ctx.fillStyle = "rgb(" + sett.threads[y].color.join(",") + ")";
          ctx.fillRect(px, py, sett.threads[x].width, sett.threads[y].width);
        } else {
          ctx.putImageData(mix(px, py, sett.threads[x].width, sett.threads[y].width,
            [sett.threads[x].color, sett.threads[y].color]), px, py);
        }
        px += sett.threads[x].width;
      }
      py += sett.threads[y].width;
    }
    multiply(canvas, sett.width, sett.width);
  }

  document.addEventListener("DOMContentLoaded", function(event) {
    var canvas = document.getElementById("tartan");
    document.getElementById('sett').value = window.location.hash.substr(1) ? decodeURIComponent(window.location.hash.substr(1)) : "B32 Y32";
    var update = function() {
      render(canvas, parse(document.getElementById('sett').value));
    };
    document.getElementById('render').addEventListener('click', update, false);
    window.addEventListener('resize', update);
    update();
  });
})();
