(env => {
  const API_BASE_URL = "http://localhost:5007";

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  function getPrediction(imageDataUrl) { 
    return fetch(`${API_BASE_URL}/api/predict`, {
      mode: 'no-cors',
      method: "POST",
      body: imageDataUrl
      /*headers: {
        "content-type": "application/json",
      }*/
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        return data;
      });
  } 

  function captureVideoFrame(canvas, video) {
    canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
    return canvas.toDataURL("image/jpeg");
  }

  function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      //alert("In predictionLoop")
      state.predictionLoop = setInterval(() => {
        imageDataUrl = captureVideoFrame(canvas, videoElem);
        imageDataUrl = JSON.stringify(imageDataUrl);
        
        console.log(imageDataUrl);
        getPrediction(imageDataUrl)
          .then(data => {
            clearCanvas(canvas);
            drawRect(canvas, data.bb[0], data.bb[1], data.bb[2], data.bb[3]);
            setCaptionText(data.class);
          })
          .catch((err) => {
            stopPredictionLoop();
          });
      }, 2000);
    };

    const stopPredictionLoop = () => {

      clearInterval(state.predictionLoop);
    };

    const initialise = () => {
      navigator.getUserMedia(
        {
          video: true
        },
        stream => {
          console.info("got stream", stream);
          videoElem.srcObject = stream;

          // configure a fake presentation for demo purposes
          //if (env === "demo") {
          //  drawRect(canvas, 200, 250, 230, 170);
          //  setCaptionText("B");
         // } else {
            //drawRect(canvas, 200, 250, 230, 170);
            startPredictionLoop();
         // }
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