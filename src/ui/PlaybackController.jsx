import { useEffect, useRef, useState } from "react";

function PlaybackController({
  elapsedTime,
  setElapsedTime,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
}) {
  const SLIDER_MAX = 3600;
  const SLIDER_STEP = SLIDER_MAX * 0.01;

  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");
  const [second, setSecond] = useState("00");

  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  useEffect(() => {
    let animationFrameId = null;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setElapsedTime((prev) => prev + delta * speed);
      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, speed]);

  useEffect(() => {
    const total = 8 * 3600 + Math.floor(elapsedTime);
    setHour(String(Math.floor(total / 3600)).padStart(2, "0"));
    setMinute(String(Math.floor((total % 3600) / 60)).padStart(2, "0"));
    setSecond(String(total % 60).padStart(2, "0"));
  }, [elapsedTime]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleSpeedDecrease();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleSpeedIncrease();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setElapsedTime((prev) => Math.max(0, prev - SLIDER_STEP));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setElapsedTime((prev) => Math.min(SLIDER_MAX, prev + SLIDER_STEP));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleReset = () => {
    setElapsedTime(0);
    setIsPlaying(false);
    setSpeed(1);
  };

  const handleSliderChange = (e) => {
    setElapsedTime(parseFloat(e.target.value));
  };

  const handleTimeApply = () => {
    const totalSec = parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
    const rel = totalSec - 8 * 3600;
    if (!isNaN(rel) && rel >= 0 && rel <= SLIDER_MAX) {
      setElapsedTime(rel);
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      handleTimeApply();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (field === "hh") minuteRef.current.focus();
      else if (field === "mm") secondRef.current.focus();
      else if (field === "ss") hourRef.current.focus();
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value));
  };

  const handleSpeedDecrease = () => {
    setSpeed((s) => Math.max(1, s - 1));
  };

  const handleSpeedIncrease = () => {
    setSpeed((s) => Math.min(100, s + 1));
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "1em 1.5em",
        borderRadius: "0.5em",
        boxShadow: "0 0 0.4em rgba(0,0,0,0.3)",
        fontSize: "12px", // 전체 기준 크기 확대
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        overflowX: "auto",
      }}
    >
      {/* 그룹 1: 재생 / 정지 / 초기화 */}
      <div style={{ display: "flex", gap: "0.5em", marginRight: "1.5em" }}>
        <button style={{ fontSize: "1em", padding: "0.4em 0.8em" }} onClick={() => setIsPlaying(true)}>▶️ 재생</button>
        <button style={{ fontSize: "1em", padding: "0.4em 0.8em" }} onClick={() => setIsPlaying(false)}>⏸ 정지</button>
        <button style={{ fontSize: "1em", padding: "0.4em 0.8em" }} onClick={handleReset}>🔁 초기화</button>
      </div>

      {/* 그룹 2: 슬라이더 + 시간 입력 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.8em", marginRight: "1.5em" }}>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={0.05}
          value={elapsedTime}
          onChange={handleSliderChange}
          style={{ width: "25em" }}
        />
        <span>
          <input
            ref={hourRef}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "hh")}
            style={{ width: "2.2em", fontSize: "1em", textAlign: "center" }}
          />
          :
          <input
            ref={minuteRef}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "mm")}
            style={{ width: "2.2em", fontSize: "1em", textAlign: "center" }}
          />
          :
          <input
            ref={secondRef}
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "ss")}
            style={{ width: "2.2em", fontSize: "1em", textAlign: "center" }}
          />
        </span>
      </div>

      {/* 그룹 3: 속도 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
        <strong style={{ fontSize: "0.9em" }}>Speed: x{speed.toFixed(1)}</strong>
        <button style={{ fontSize: "1em", padding: "0.3em 0.6em" }} onClick={handleSpeedDecrease}>–</button>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={speed}
          onChange={handleSpeedChange}
          style={{ width: "8em" }}
        />
        <button style={{ fontSize: "1em", padding: "0.3em 0.6em" }} onClick={handleSpeedIncrease}>+</button>
      </div>
    </div>
  );
}

export default PlaybackController;
