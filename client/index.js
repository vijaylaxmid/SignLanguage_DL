(env => {
  const API_BASE_URL = "http://localhost:5006";

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  function getPrediction(imageDataUrl) {
    return fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      cache: 'no-cache',
      body: imageDataUrl
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log(data)
        return data;
      });
  }

  function captureVideoFrame(canvas) {
    let ctx = canvas.getContext("2d")
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect(40,60,20,20);
    return ctx.toDataURL("image/jpeg",0.5);
  }

  function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, c.height);
  }

  function drawRect(canvas, x, y, width, height, color = "#FF0000") {
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Main app things
   */
  function App() {

    alert("App is working")
    const videoElem = document.querySelector("#video-container video");
    const captionElem = document.querySelector(".caption");
    const canvas = document.querySelector("#video-container > canvas");

    /**
     * Stateful things
     */
    const state = {
      predictionLoop: undefined,
      captionText: "?"
    };

    const setCaptionText = text => {
      state.captionText = text;
      captionElem.textContent = state.captionText;
    };

    const startPredictionLoop = () => {
      state.predictionLoop = setInterval(() => {
        const imageDataUrl = captureVideoFrame(canvas);
        getPrediction(imageDataUrl)
          .then(data => {
            console.log(data)
            clearCanvas(canvas);
            drawRect(canvas, data.bb[0], data.bb[1], data.bb[2], data.bb[3]);
            setCaptionText(data.class);
          })
          .catch((err) => {
            console.error(err)
            stopPredictionLoop();
          });
      }, 200);
    };

    const stopPredictionLoop = () => {
      clearInterval(state.predictionLoop);
    };

    const initialise = () => {
      alert("Inside startPredictionLoop")

      navigator.getUserMedia(
        {
          video: true
        },
        stream => {
          console.info("got stream", stream);
          videoElem.srcObject = stream;

          // configure a fake presentation for demo purposes
          
          startPredictionLoop();
          
        },
        err => console.error(err)
      );
    };

    return {
      initialise
    };
  }

  const app = App();
  app.initialise();
})("demo");
