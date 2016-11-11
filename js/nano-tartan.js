(function() {
    function fromhex(color) {
        var c = parseInt('0x' + color);
        return [(c & 0xFF0000) >> 16, (c & 0xFF00) >> 8, c & 0xFF];
    }

    function getthreads(sett) {
        var threads = sett.threads;
        if (sett.mirrored) {
            return threads.concat(threads.slice(1, threads.length - 1).reverse());
        }
        return threads;
    }

    function sarge(x, y) {
        return Math.abs(x - y) % 4 < 2 ? 0 : 1;
    }

    function mixcolors(sett, a, b) {
        return [sett.palette[a], sett.palette[b]]
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

    window.nanotartan = {
        render: function(canvas, sett) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            var ctx = canvas.getContext("2d");
            var threads = getthreads(sett);
            var py = 0;
            for (var y = 0; y < threads.length; y++) {
                var px = 0;
                for (var x = 0; x < threads.length; x++) {
                    if (threads[x].color == threads[y].color) {
                        ctx.fillStyle = "rgb(" + sett.palette[threads[y].color].join(",") + ")";
                        ctx.fillRect(px, py, threads[x].width, threads[y].width);
                    } else {
                        ctx.putImageData(mix(px, py, threads[x].width, threads[y].width, mixcolors(sett, threads[x].color, threads[y].color)), px, py);
                    }
                    px += threads[x].width;
                }
                py += threads[y].width;
            }
            multiply(canvas, px, py);
        },
        parse: function(sett) {
            var palette = {W: [0xFF, 0xFF, 0xFF]};
            var tokens = sett.replace(/([A-Z]+)(#|=|=#)([0-9A-F]{6})[^;]*;/gi, function(m, n, s, c) {
                palette[n] = fromhex(c);
                return '';
            }).match(/[A-Z]+\/?[0-9]+/gi);
            var mirrored = tokens.length > 2 && !!tokens[0].match('/') && !!tokens[tokens.length - 1].match('/');
            var threads = [];
            for (var i = 0; i < tokens.length; i++) {
                var [c, w] = tokens[i].match(/[A-Z]+|[0-9]+/gi);
                threads.push({
                    color: palette[c] ? c : "W",
                    width: parseInt(w)
                });
            };
            return {
                threads: threads,
                palette: palette,
                mirrored: mirrored
            };
        }
    };
})();
