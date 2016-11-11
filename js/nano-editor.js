(function() {
    var popup = document.createElement("div"),
        thread = document.createElement("div"),
        timer;

    popup.className = "popup";
    thread.className = "thread";

    function makecheckbox(value, onclick) {
        var check = document.createElement("input");
        check.id = "mirrored";
        check.type = "checkbox";
        if (value) {
            check.checked = "true";
        }
        if (onclick) {
            check.addEventListener("click", onclick);
        }
        return check;
    }

    function clear(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.lastChild);
        }
    }

    function fromhex(color) {
        return color.match(/\d+/g);
    }

    function tohex(color) {
        return "#" + color.map(function(c) {
            return ("0" + Number(c).toString(16)).substr(-2).toUpperCase();
        }).join("");
    }

    function asstr(sett) {
        var text = "";
        for (var c in sett.palette) {
            text += c + tohex(sett.palette[c]) + "; ";
        }
        for (var i = 0; i < sett.threads.length; i++) {
            text += " " + sett.threads[i].color + ((sett.mirrored && (i == 0 || i == sett.threads.length - 1)) ? "/" : "") + sett.threads[i].width;
        }
        return text.replace("  ", " ");
    }

    function callupdate(onchange, sett) {
        if (onchange) {
            clearTimeout(timer);
            timer = setTimeout(function() {
                onchange(sett, asstr(sett));
            }, 100);
        }
    }

    function makesett(editor) {
        var threads = [],
            palette = {};
        for (var i = 0; i < editor.childNodes.length; i++) {
            if (editor.childNodes[i].className == "thread" && editor.childNodes[i].clientWidth > 0) {
                palette[editor.childNodes[i].color] = fromhex(editor.childNodes[i].style.backgroundColor);
                threads.push({
                    color: editor.childNodes[i].color,
                    width: editor.childNodes[i].clientWidth
                });
            }
        }
        return {
            threads: threads,
            palette: palette,
            mirrored: !!editor.getElementsByTagName("input")["mirrored"].checked
        };
    }

    window.nanoeditor = function(editor, sett, onchange) {
        document.body.addEventListener("click", function(event) {
            var e = event.target;
            if (e.parentNode == popup) {
                popup.target.style.backgroundColor = e.style.backgroundColor;
                popup.target.color = e.color;
                callupdate(onchange, makesett(editor));
            }
            if (popup.parentNode) {
                document.body.removeChild(popup);
            }
        });

        editor.addEventListener("wheel", function(event) {
            var e = event.target;
            if (e.className == "thread") {
                var d = event.deltaY < 0 ? 1 : -1;
                if (d > 0 && e.clientWidth == 0) {
                    e.style.backgroundColor = "#FFFFFF";
                    e.parentNode.insertBefore(thread.cloneNode(), e);
                    e.parentNode.insertBefore(thread.cloneNode(), e.nextSibling);
                }
                e.style.width = Math.floor(e.offsetWidth + d) + "px";
                if (e.clientWidth == 0) {
                    if (e.nextSibling && e.nextSibling.clientWidth == 0) {
                        e.nextSibling.remove();
                    }
                    if (e.previousSibling && e.previousSibling.clientWidth == 0) {
                        e.previousSibling.remove();
                    }
                    e.style.backgroundColor = "transparent";
                    e.color = "W";
                }
                callupdate(onchange, makesett(editor));
            }
        });

        editor.addEventListener("contextmenu", function(event) {
            var e = event.target;
            if (e.className == "thread" && e.clientWidth > 0) {
                event.preventDefault();
                popup.style.left = event.clientX + "px";
                popup.style.top = event.clientY + "px";
                popup.target = e;
                document.body.appendChild(popup);
                return false;
            }
        }, false);

        clear(editor);
        editor.appendChild(thread);
        for (var i = 0; i < sett.threads.length; i++) {
            var d = thread.cloneNode();
            d.style.backgroundColor = tohex(sett.palette[sett.threads[i].color]);
            d.style.width = sett.threads[i].width + "px";
            d.color = sett.threads[i].color;
            editor.appendChild(d);
            editor.appendChild(thread.cloneNode());
        }
        editor.appendChild(makecheckbox(sett.mirrored, function() {
            callupdate(onchange, makesett(editor));
        }));
        clear(popup);
        for (var c in sett.palette) {
            var item = document.createElement("div");
            item.className = "item";
            item.style.backgroundColor = tohex(sett.palette[c]);
            item.color = c;
            popup.appendChild(item);
        }
    };
})();
