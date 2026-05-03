const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let lastX = 0, lastY = 0, isDrawing = false;

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

hands.onResults((results) => {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const x = landmarks[8].x * canvas.width; // Index finger tip
    const y = landmarks[8].y * canvas.height;

    if (isDrawing) {
      ctx.strokeStyle = "red"; ctx.lineWidth = 8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
    }
    lastX = x; lastY = y; isDrawing = true;
  } else { isDrawing = false; }
  ctx.restore();
});

const camera = new Camera(video, {
  onFrame: async () => { await hands.send({image: video}); },
  width: 640, height: 480
});
camera.start();

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
