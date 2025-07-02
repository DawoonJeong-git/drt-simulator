import React, { useRef, useState, useCallback } from "react";
import axios from "axios";
import { getAPIBase } from "../utils/api";
import { Save } from "lucide-react";

function UploadController({ onRouteDataUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("input");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const openModalWithMode = (mode) => {
    setUploadMode(mode);
    setSelectedFile(null);
    setTimeout(() => setIsModalOpen(true), 0);
  };

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      if (uploadMode === "input") {
        const res = await axios.post(`${getAPIBase()}/api/generate`, formData);
        const json = res.data;
        if (json.routes) {
          onRouteDataUpdate(json.routes);
          alert("✅ 경로 생성 완료");
        } else {
          throw new Error("routes 데이터가 없습니다.");
        }
      } else if (uploadMode === "output_json") {
        await axios.post(`${getAPIBase()}/upload_output_json`, formData);
        alert("✅ output.json 업로드 완료");

        const routeRes = await fetch(`${getAPIBase()}/route_output.json`);
        const data = await routeRes.json();
        onRouteDataUpdate(data);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("📛 업로드 실패:", err.response?.data || err.message || err);
      alert("❌ 업로드 실패: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLoadDefaultInput = async () => {
    try {
      const res = await fetch("/route_input.csv");
      
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });

      const formData = new FormData();
      formData.append("file", blob, "route_input.csv");

      const uploadRes = await fetch(`${getAPIBase()}/api/generate`, {
        method: "POST",
        body: formData,
      });



      const json = await uploadRes.json();
      if (json.routes) {
        onRouteDataUpdate(json.routes);
        alert("✅ 기본 CSV로 경로 생성 완료");
      } else {
        throw new Error("routes 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("❌ 기본 route_input.csv 불러오기 실패:", err);
      alert("❌ 불러오기 실패: " + (err.message || "알 수 없는 오류"));
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <>
      {/* 📂 업로드 버튼들 + 💾 저장 버튼 */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 16px",
          borderRadius: "8px",
          backdropFilter: "blur(6px)",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button onClick={handleLoadDefaultInput} title="기본 route_input.csv 불러오기">
          <Save size={16} />
        </button>
        <button onClick={() => openModalWithMode("input")}>📂 Input (csv)</button>
        <button onClick={() => openModalWithMode("output_json")}>🗂 Output (json)</button>
      </div>

      {/* 🪟 업로드 모달 */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: 520,
              padding: 28,
              backgroundColor: "white",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {uploadMode === "input" && "📂 Input (csv) 업로드"}
              {uploadMode === "output_json" && "🗂 Output (json) 업로드"}
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginTop: 20 }}>
              <label
                style={{
                  flex: 1,
                  padding: "30px 16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
              >
                📁 파일 선택
                <input
                  type="file"
                  accept=".csv,.json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  flex: 3,
                  padding: "50px 16px",
                  border: "2px dashed #aaa",
                  borderRadius: 10,
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                드래그하여<br />파일 업로드
              </div>
            </div>

            {selectedFile && (
              <div style={{ marginTop: 16, fontSize: "13px", color: "#333" }}>
                ✅ 선택된 파일: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}

            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={() => setIsModalOpen(false)}>❌ 취소</button>
              <button onClick={handleConfirmUpload} disabled={!selectedFile}>✅ 확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UploadController;
