const video = document.getElementById('video');
const drawCanvas = document.getElementById('drawCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');

const drawCtx = drawCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let lastX = 0;
let lastY = 0;
let isDrawing = false;

// ✅ Initialize MediaPipe Hands
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

// ✅ Hand tracking logic
hands.onResults((results) => {

  // Clear only overlay
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  // Draw camera feed
  overlayCtx.drawImage(results.image, 0, 0, overlayCanvas.width, overlayCanvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

    const landmarks = results.multiHandLandmarks[0];

    const x = landmarks[8].x * drawCanvas.width;
    const y = landmarks[8].y * drawCanvas.height;

    // Draw pointer (yellow dot)
    overlayCtx.fillStyle = "yellow";
    overlayCtx.beginPath();
    overlayCtx.arc(x, y, 5, 0, 2 * Math.PI);
    overlayCtx.fill();

    // Draw persistent line
    if (isDrawing) {
      drawCtx.strokeStyle = "red";
      drawCtx.lineWidth = 5;
      drawCtx.lineCap = "round";

      drawCtx.beginPath();
      drawCtx.moveTo(lastX, lastY);
      drawCtx.lineTo(x, y);
      drawCtx.stroke();
    }

    lastX = x;
    lastY = y;
    isDrawing = true;

  } else {
    isDrawing = false;
  }
});

// ✅ Start camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// ✅ Clear button
function clearCanvas() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}
