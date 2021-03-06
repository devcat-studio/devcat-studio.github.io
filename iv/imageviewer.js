var img = document.getElementById('IMG');
var pressedKeys = {};
var mouseButtonIsPressed = false;
var imageWidth = 1;
var imageHeight = 1;
var zoom = 1.0;
var panX = 0;
var panY = 0;
var zoomPivotOnImageX = 0;
var zoomPivotOnImageY = 0;
var zoomPivotOnPageX = 0;
var zoomPivotOnPageY = 0;
var lastMouseX = 0;
var lastMouseY = 0;
var MIN_ZOOM = 0.2;
var Mode;
(function (Mode) {
    Mode[Mode["None"] = 0] = "None";
    Mode[Mode["Pan"] = 1] = "Pan";
    Mode[Mode["Zoom"] = 2] = "Zoom";
})(Mode || (Mode = {}));
;
function getModeAndSetCursor() {
    if (pressedKeys['Control'] && (pressedKeys[' '] || pressedKeys['HanjaMode'])) {
        document.documentElement.style.cursor = 'zoom-in';
        if (mouseButtonIsPressed) {
            return Mode.Zoom;
        }
        else {
            document.documentElement.style.cursor = 'zoom-in';
            return Mode.None;
        }
    }
    if (pressedKeys[' ']) {
        document.documentElement.style.cursor = 'grab';
        if (mouseButtonIsPressed) {
            return Mode.Pan;
        }
        else {
            return Mode.None;
        }
    }
    if (mouseButtonIsPressed) {
        document.documentElement.style.cursor = 'grab';
        return Mode.Pan;
    }
    document.documentElement.style.cursor = '';
    return Mode.None;
}
function getBasicZoom() {
    var zoomByWidth = window.innerWidth / imageWidth;
    var zoomByHeight = window.innerHeight / imageHeight;
    return Math.min(zoomByWidth, zoomByHeight) * 0.99;
}
function getBasicLeft() {
    return (window.innerWidth - imageWidth * zoom * getBasicZoom()) * 0.5;
}
function getBasicTop() {
    return (window.innerHeight - imageHeight * zoom * getBasicZoom()) * 0.5;
}
function updateImagePlacement() {
    var panRangeX = window.innerWidth * 0.4 + (imageWidth * zoom * getBasicZoom()) * 0.5;
    var panRangeY = window.innerHeight * 0.4 + (imageHeight * zoom * getBasicZoom()) * 0.5;
    panX = Math.max(panX, -panRangeX);
    panX = Math.min(panX, panRangeX);
    panY = Math.max(panY, -panRangeY);
    panY = Math.min(panY, panRangeY);
    img.style.width = (imageWidth * zoom * getBasicZoom()) + 'px';
    img.style.height = (imageHeight * zoom * getBasicZoom()) + 'px';
    img.style.left = (getBasicLeft() + panX) + 'px';
    img.style.top = (getBasicTop() + panY) + 'px';
}
function fitToScreen() {
    zoom = 1;
    panX = 0;
    panY = 0;
    updateImagePlacement();
}
function adjustZoom(delta) {
    zoom += delta;
    if (zoom < MIN_ZOOM) {
        zoom = MIN_ZOOM;
    }
    panX = zoomPivotOnPageX - getBasicLeft() - zoomPivotOnImageX * (zoom * getBasicZoom());
    panY = zoomPivotOnPageY - getBasicTop() - zoomPivotOnImageY * (zoom * getBasicZoom());
    updateImagePlacement();
}
img.setAttribute('src', document.location.search.substring(1));
img.onload = function () {
    imageWidth = img.clientWidth;
    imageHeight = img.clientHeight;
    fitToScreen();
    img.style.visibility = 'visible';
    document.onkeydown = function (ev) {
        pressedKeys[ev.key] = true;
        getModeAndSetCursor();
        if (ev.key == 'F' || ev.key == 'f') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
            else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
        else if (ev.key == '0' && pressedKeys['Control']) {
            fitToScreen();
            ev.preventDefault();
        }
        else if (ev.key == ' ') {
            ev.preventDefault();
        }
    };
    document.onkeyup = function (ev) {
        ev.preventDefault();
        delete pressedKeys[ev.key];
        getModeAndSetCursor();
    };
    document.onmousedown = function (ev) {
        ev.preventDefault();
        zoomPivotOnPageX = lastMouseX = ev.pageX;
        zoomPivotOnPageY = lastMouseY = ev.pageY;
        zoomPivotOnImageX = (ev.pageX - (getBasicLeft() + panX)) / (zoom * getBasicZoom());
        zoomPivotOnImageY = (ev.pageY - (getBasicTop() + panY)) / (zoom * getBasicZoom());
        mouseButtonIsPressed = true;
        getModeAndSetCursor();
    };
    document.onmouseup = function (ev) {
        ev.preventDefault();
        mouseButtonIsPressed = false;
        getModeAndSetCursor();
    };
    document.onmousemove = function (ev) {
        ev.preventDefault();
        var mx = ev.pageX - lastMouseX;
        var my = ev.pageY - lastMouseY;
        lastMouseX = ev.pageX;
        lastMouseY = ev.pageY;
        var mode = getModeAndSetCursor();
        if (mode == Mode.Pan) {
            panX += mx;
            panY += my;
            updateImagePlacement();
        }
        else if (mode == Mode.Zoom) {
            adjustZoom(ev.movementX * 0.005);
        }
    };
    document.onwheel = function (ev) {
        ev.preventDefault();
        zoomPivotOnPageX = ev.pageX;
        zoomPivotOnPageY = ev.pageY;
        zoomPivotOnImageX = (ev.pageX - (getBasicLeft() + panX)) / (zoom * getBasicZoom());
        zoomPivotOnImageY = (ev.pageY - (getBasicTop() + panY)) / (zoom * getBasicZoom());
        adjustZoom(ev.deltaY * -0.002);
    };
    window.onresize = function () {
        updateImagePlacement();
    };
};
var helpButton = document.getElementById('HelpButton');
var helpContent = document.getElementById('HelpContent');
helpButton.onclick = function () {
    helpContent.style.visibility = 'visible';
};
helpContent.onclick = function () {
    helpContent.style.visibility = 'hidden';
};
//# sourceMappingURL=imageviewer.js.map