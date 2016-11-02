(function(){
  var colors = {
    B: [0x21, 0x96, 0xF3],
    G: [0x43, 0xA0, 0x47],
    K: [0x00, 0x00, 0x00],
    N: [0x9E, 0x9E, 0x9E],
    O: [0xFF, 0x98, 0x00],
    R: [0xF4, 0x43, 0x36],
    T: [0x79, 0x55, 0x48],
    W: [0xFF, 0xFF, 0xFF],
    Y: [0xFF, 0xEB, 0x3B],
    P: [0x9C, 0x27, 0xB0],
    I: [0x3F, 0x51, 0xB5]
  }

  function mirror(sett) {
    if (sett.length > 2 && sett[0].indexOf('/') == 1 && sett[sett.length - 1].indexOf('/') == 1) {
      sett[0] = sett[0].replace('/', '');
      sett[sett.length - 1] = sett[sett.length - 1].replace('/', '');
      for (var i = sett.length - 2; i > 0; i--) {
        sett.push(sett[i]);
      }
    }
    return sett;
  }

  function parse(sett) {
    var threads = mirror(sett.split(' ').filter(function(n){
      return n != undefined;
    })).map(function (t) {
      return {
        color: colors[t[0]] ? colors[t[0]] : colors['W'],
        width: parseInt(t.substring(1))
      }
    });
    return {
      threads: threads,
      width: threads.reduce(function(w, t){
        return w + t.width;
      }, 0)
    }
  }

  function thread(sett, number) {
    number %= sett.width;
    var i = 0;
    while (sett.threads[i].width <= number) {
      number -= sett.threads[i].width;
      i++;
    }
    return sett.threads[i];
  }

  function sarge(x, y) {
    return (Math.abs(x - y) % 4 < 2) ? x : y;
  }

  function render(canvas, sett) {
    var ctx = canvas.getContext("2d");
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var y = 0; y < canvas.height; y++) {
      for (var x = 0; x < canvas.width; x++) {
        var t = thread(sett, sarge(x, y));
        img.data[(y * canvas.width + x) * 4 + 3] = 255;
        for (var c = 0; c < 3; c++) {
          img.data[(y * canvas.width + x) * 4 + c] = t.color[c];
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  document.addEventListener("DOMContentLoaded", function(event) {
    var canvas = document.getElementById("tartan");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    render(canvas, parse(window.location.hash.substr(1)));
  });
})();
