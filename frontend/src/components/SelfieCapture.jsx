// src/components/SelfieCapture.jsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

// Default base path for models (works with Vite + subpaths)
const DEFAULT_MODELS_PATH = `${import.meta.env.BASE_URL}models`;

/*
Props:
  onCaptured(descriptorArray)  // called when capture succeeded
  modelsPath = DEFAULT_MODELS_PATH
*/
export default function SelfieCapture({
  onCaptured,
  modelsPath = DEFAULT_MODELS_PATH,
}) {
  const videoRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Base: e.g. "/models"
        const base = modelsPath.replace(/\/$/, "");

        // Subfolders that match your folder structure
        const tinyPath = `${base}/tiny_face_detector`;
        const landmarkPath = `${base}/face_landmark_68`;
        const recogPath = `${base}/face_recognition`;

        console.log("🧠 Loading face-api models from:", {
          tinyPath,
          landmarkPath,
          recogPath,
        });

        // Optional quick check to catch HTML/404 issues early
        const testUrl = `${tinyPath}/tiny_face_detector_model-weights_manifest.json`;
        const res = await fetch(testUrl, { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) {
          const textSample = await res.text().catch(() => "");
          throw new Error(
            `Model manifest fetch failed at ${testUrl}. status=${res.status}, content-type=${ct}, sample="${textSample.slice(
              0,
              80
            )}"`
          );
        }

        // Load required models from their subfolders
        await faceapi.nets.tinyFaceDetector.loadFromUri(tinyPath);
        await faceapi.nets.faceLandmark68Net.loadFromUri(landmarkPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(recogPath);

        if (!mounted) return;

        setLoaded(true);

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (e) {
        console.error("SelfieCapture load error:", e);
        setError(
          "Cannot load camera or models. Check permissions and models path."
        );
      }
    }

    init();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [modelsPath]);

  async function capture() {
    setError(null);
    if (!loaded) return setError("Models still loading...");
    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return setError(
          "No face detected. Please try again with good lighting and face visible."
        );
      }
      const descriptor = Array.from(detection.descriptor);
      onCaptured(descriptor);
    } catch (e) {
      console.error(e);
      setError("Error capturing face. Try again.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <video
        ref={videoRef}
        width={360}
        height={270}
        className="rounded-lg bg-black"
      />
      <div>
        <button
          onClick={capture}
          disabled={!loaded}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          Take selfie
        </button>
      </div>
      {!loaded && (
        <div className="text-xs text-zinc-400 mt-2">
          Loading camera/models…
        </div>
      )}
    </div>
  );
}
