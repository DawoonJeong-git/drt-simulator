import { useState } from "react";

function RecordingController({ setHideUI }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunks = [];

  const handleStartRecording = async () => {
    console.log("🟢 녹화 시작");

    try {
      setHideUI(true); // ✅ UI 숨기기

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 }
      });

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `simulation_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
        a.click();
        chunks.length = 0;
        setHideUI(false); // ✅ 녹화 종료 시 UI 다시 보이기
      };

      recorder.start();
      console.log("🎥 녹화 중...");
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("❌ 녹화 실패", err);
      setHideUI(false); // 실패해도 UI 복원
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 2000,
        backgroundColor: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 0 6px rgba(0,0,0,0.2)",
      }}
    >
      {!isRecording ? (
        <button onClick={handleStartRecording}>⏺️ 화면 녹화 시작</button>
      ) : (
        <button onClick={handleStopRecording}>⏹️ 녹화 종료 및 저장</button>
      )}
    </div>
  );
}

export default RecordingController;
