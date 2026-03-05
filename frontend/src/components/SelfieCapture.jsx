import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const DEFAULT_MODELS_PATH = `${import.meta.env.BASE_URL}models`;

export default function SelfieCapture({ onCaptured, setProcessing, modelsPath = DEFAULT_MODELS_PATH }) {
  const videoRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  // Ref to stop the loop once captured
  const loopRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const base = modelsPath.replace(/\/$/, "");
        
        // Load only what we strictly need for a smile check
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${base}/tiny_face_detector`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${base}/face_landmark_68`),
          faceapi.nets.faceRecognitionNet.loadFromUri(`${base}/face_recognition`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${base}/face_expression`),
        ]);

        if (!mounted) return;
        setLoaded(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Give the camera a second to adjust lighting, then start scanning
        setTimeout(() => {
          setIsReady(true);
          scanForSmile(); 
        }, 1000);

      } catch (e) {
        setError("Camera access required for verification.");
      }
    }
    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(loopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [modelsPath]);

  // Continuous background scan (no buttons required!)
  const scanForSmile = async () => {
    if (!videoRef.current || videoRef.current.paused) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptor();

    if (detection) {
      // Check if they are smiling (70% confidence)
      const isSmiling = detection.expressions.happy > 0.7;

      if (isSmiling) {
        // Stop the loop! We got what we need.
        cancelAnimationFrame(loopRef.current);
        if (setProcessing) setProcessing(true); // Show global loader
        
        // Small delay to let the UI catch up, then send the data
        setTimeout(() => {
          onCaptured(Array.from(detection.descriptor));
        }, 300);
        return; 
      }
    }

    // Keep looking at the next frame
    loopRef.current = requestAnimationFrame(scanForSmile);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {error && <div className="text-pink-400 text-xs bg-pink-500/10 p-3 rounded-xl border border-pink-500/20">{error}</div>}
      
      <div className="relative w-full max-w-[320px] rounded-full overflow-hidden border-4 border-white/10 aspect-square shadow-2xl shadow-pink-500/10 transition-all duration-500">
        
        {/* The Video Feed */}
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover bg-black scale-x-[-1] transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} 
          playsInline 
          muted 
        />
        
        {/* Sleek UI Overlays */}
        <div className="absolute inset-0 border-[6px] border-transparent rounded-full pointer-events-none" 
             style={{ boxShadow: isReady ? 'inset 0 0 20px rgba(236,72,153,0.5)' : 'none' }}>
        </div>

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
             <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Instructions that don't look like a button */}
      <div className="text-center h-12">
        {loaded ? (
          <p className="text-sm font-bold uppercase tracking-widest text-pink-400 animate-pulse">
            Smile to auto-capture 🙂
          </p>
        ) : (
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Warming up camera...
          </p>
        )}
      </div>
    </div>
  );
}