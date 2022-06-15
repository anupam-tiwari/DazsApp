import { useRef, useEffect, useState } from 'react';
import './App.css';
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [mood, setMood] = useState("");
  const [moodarray, setMoodArray] = useState([])

  useEffect(() => {
    startVideo();

    videoRef && loadModels();

  }, []);
  
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]).then(() => {
        faceDetection();
      })
    };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error(err)
      });
  }

  const faceDetection = async () => {
    setInterval(async() => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const faceexpression  = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions(); 
      //onsole.log(faceexpression.expressions)
      await setMoodArray([faceexpression.expressions.angry,faceexpression.expressions.disgusted, faceexpression.expressions.fearful, faceexpression.expressions.happy, faceexpression.expressions.neutral, faceexpression.expressions.sad, faceexpression.expressions.surprised ])
      console.log(moodarray)
      
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      })

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)


    }, 1000)
  }

  return (
    <div  className="app">
      <h1 style={{color:'white', fontFamily:'sans-serif', fontSize: 80, paddingBottom:0}}>Dazs App</h1>
      <div className='app__video'>
        <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
      </div>
        <canvas ref={canvasRef} width="940" height="650" className='app__canvas' />
    </div>
  );
}

export default App;
