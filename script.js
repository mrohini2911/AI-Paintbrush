const video = document.getElementById('video');
const drawCanvas = document.getElementById('drawCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');

const drawCtx = drawCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let lastX = 0;
let lastY = 0;
let isDrawing = false;

// MediaPipe Hands
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Hand tracking
hands.onResults((results) => {

  // ❗ ONLY clear overlay (not drawing canvas)
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

    const landmarks = results.multiHandLandmarks[0];

    const x = landmarks[8].x * drawCanvas.width;
    const y = landmarks[8].y * drawCanvas.height;

    // Yellow pointer
    overlayCtx.fillStyle = "yellow";
    overlayCtx.beginPath();
    overlayCtx.arc(x, y, 6, 0, 2 * Math.PI);
    overlayCtx.fill();

    // Drawing logic
    drawCtx.strokeStyle = "red";
    drawCtx.lineWidth = 8;
    drawCtx.lineCap = "round";

    if (!isDrawing) {
      lastX = x;
      lastY = y;
      isDrawing = true;
    }

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();

    lastX = x;
    lastY = y;

  } else {
    isDrawing = false;
    lastX = 0;
    lastY = 0;
  }
});

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// Clear
function clearCanvas() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

// Save
function saveImage() {
  const link = document.createElement('a');
  link.download = 'painting.png';
  link.href = drawCanvas.toDataURL();
  link.click();
}
