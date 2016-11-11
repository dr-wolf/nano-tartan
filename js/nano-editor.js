(function () {
  var popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHtml = "hello";
  popup.onclick = function(event) {
    var e = event.target;
    if (e.className == "item") {
      popup.target.style.backgroundColor = e.style.backgroundColor;
      document.body.removeChild(popup);
    }
  }

  var thread = document.createElement("div");
  thread.className = "thread";
  thread.style.backgroundColor = "rgb(255, 255, 255)";

  function makesett(editor) {
    sett = {
      threads: [],
      width: 0
    }
    for(var i = 0; i < editor.childNodes.length; i++) {
      if (editor.childNodes[i].clientWidth > 0) {
        sett.threads.push({
          color: editor.childNodes[i].style.backgroundColor.match(/\d+/g),
          width: editor.childNodes[i].clientWidth
        });
        sett.width += editor.childNodes[i].clientWidth;
      }
    }
    return sett;
  }

  window.nanoeditor = function (editor, sett, colors, onchange) {
    editor.addEventListener("wheel", function(event) {
      var e = event.target;
      if (e.className == "thread") {
        var d = event.deltaY / 100;
        if (d > 0 && e.clientWidth == 0) {
          e.parentNode.insertBefore(thread.cloneNode(), e);
          e.parentNode.insertBefore(thread.cloneNode(), e.nextSibling);
        }
        e.style.width = (e.clientWidth + d) + "px";
        if (e.clientWidth == 0) {
          if (e.nextSibling && e.nextSibling.clientWidth == 0) {
            e.nextSibling.remove();
          }
          if (e.previousSibling && e.previousSibling.clientWidth == 0) {
            e.previousSibling.remove();
          }
          e.style.backgroundColor = "rgb(255, 255, 255)";
        }
        if (onchange) {
          onchange(makesett(editor));
        }
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
        if (onchange) {
          onchange(makesett(editor));
        }
        return false;
      }
    }, false);

    editor.appendChild(thread);
    for (var i = 0; i < sett.threads.length; i++) {
      var d = thread.cloneNode();
      d.style.backgroundColor = "rgb(" + sett.threads[i].color.join(",") + ")";
      d.style.width = sett.threads[i].width + "px";
      editor.appendChild(d);
      editor.appendChild(thread.cloneNode());
    }
    for (var c in colors) {
      var item = document.createElement("div");
      item.className = "item";
      item.style.backgroundColor = "rgb(" + colors[c].join(",") + ")";
      item.color = c;
      popup.appendChild(item);
    }
  };
})();
