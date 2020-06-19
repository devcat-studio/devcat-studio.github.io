let img = document.getElementById('IMG');
let pressedKeys: { [id: string]: boolean; } = {};
let mouseButtonIsPressed = false;

let imageWidth = 1;
let imageHeight = 1;

let zoom = 1.0;
let panX = 0;
let panY = 0;

let zoomPivotOnImageX = 0;
let zoomPivotOnImageY = 0;
let zoomPivotOnPageX = 0;
let zoomPivotOnPageY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

let MIN_ZOOM = 0.2;

enum Mode { None, Pan, Zoom };

function getModeAndSetCursor(): Mode {
    // 확대/축소 (돋보기) – Ctrl + Spacebar + 드래그
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

    // Pan. 이미지를 상하좌우로 이동시킴 (손바닥) – Spacebar + 드래그
    if (pressedKeys[' '])
    {
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
    let zoomByWidth = window.innerWidth / imageWidth;
    let zoomByHeight = window.innerHeight / imageHeight;
    return Math.min(zoomByWidth, zoomByHeight) * 0.99;
}

function getBasicLeft() {
    return (window.innerWidth - imageWidth * zoom * getBasicZoom()) * 0.5;
}

function getBasicTop() {
    return (window.innerHeight - imageHeight * zoom * getBasicZoom()) * 0.5;
}

function updateImagePlacement() {
    let panRangeX = window.innerWidth * 0.4 + (imageWidth * zoom * getBasicZoom()) * 0.5;
    let panRangeY = window.innerHeight * 0.4 + (imageHeight * zoom * getBasicZoom()) * 0.5;
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

function adjustZoom(delta: number) {
    zoom += delta;
    if (zoom < MIN_ZOOM) { zoom = MIN_ZOOM; }

    // 줌 시작 위치에서 마우스 포인터가 가리키고 있던 이미지상의 위치가 동일하도록
    // 팬을 자동 조절한다.
    panX = zoomPivotOnPageX - getBasicLeft() - zoomPivotOnImageX * (zoom * getBasicZoom());
    panY = zoomPivotOnPageY - getBasicTop() - zoomPivotOnImageY * (zoom * getBasicZoom());
    updateImagePlacement();
}

img.setAttribute('src', document.location.search.substring(1));

img.onload = () => {
    imageWidth = img.clientWidth;
    imageHeight = img.clientHeight;
    fitToScreen();
    img.style.visibility = 'visible';

    document.onkeydown = (ev) => {
        //console.log('down ', ev);
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
    }

    document.onkeyup = (ev) => {
        //console.log('up ', ev);
        ev.preventDefault();

        delete pressedKeys[ev.key];
        getModeAndSetCursor();
    }

    document.onmousedown = (ev) => {
        ev.preventDefault();

        zoomPivotOnPageX = lastMouseX = ev.pageX;
        zoomPivotOnPageY = lastMouseY = ev.pageY;
        zoomPivotOnImageX = (ev.pageX - (getBasicLeft() + panX)) / (zoom * getBasicZoom());
        zoomPivotOnImageY = (ev.pageY - (getBasicTop() + panY)) / (zoom * getBasicZoom());
        
        mouseButtonIsPressed = true;
        getModeAndSetCursor();
    }

    document.onmouseup = (ev) => {
        ev.preventDefault();

        mouseButtonIsPressed = false;
        getModeAndSetCursor();
    }

    document.onmousemove = (ev) => {
        ev.preventDefault();

        let mx = ev.pageX - lastMouseX;
        let my = ev.pageY - lastMouseY;
        lastMouseX = ev.pageX;
        lastMouseY = ev.pageY;

        let mode = getModeAndSetCursor();
        if (mode == Mode.Pan) {
            panX += mx;
            panY += my;
            updateImagePlacement();
        }
        else if (mode == Mode.Zoom) {
            adjustZoom(ev.movementX * 0.005);
        }
    }

    document.onwheel = (ev) => {
        ev.preventDefault();

        zoomPivotOnPageX = ev.pageX;
        zoomPivotOnPageY = ev.pageY;
        zoomPivotOnImageX = (ev.pageX - (getBasicLeft() + panX)) / (zoom * getBasicZoom());
        zoomPivotOnImageY = (ev.pageY - (getBasicTop() + panY)) / (zoom * getBasicZoom());
        adjustZoom(ev.deltaY * -0.002);
    }

    window.onresize = () => {
        updateImagePlacement();
    }
}

let helpButton = document.getElementById('HelpButton');
let helpContent = document.getElementById('HelpContent');

helpButton.onclick = () => {
    helpContent.style.visibility = 'visible';
};

helpContent.onclick = () => {
    helpContent.style.visibility = 'hidden';
};
