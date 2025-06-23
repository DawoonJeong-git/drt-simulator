import { useEffect, useRef, useState } from "react";
import { controlBoxStyle, darkButtonStyle } from "./CommonStyles";
import { fixedMonoTextStyle } from "./CommonStyles";

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
    setSecond(String(Math.floor(total % 60)).padStart(2, "0"));
  }, [elapsedTime]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTypingField = ["input", "textarea", "select"].includes(tag);
      const key = e.key.toLowerCase();

      if (key === " " && !isTypingField) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (key === "r" && !isTypingField) {
        e.preventDefault();
        handleReset();
      } else if (key === "arrowdown") {
        e.preventDefault();
        handleSpeedDecrease();
      } else if (key === "arrowup") {
        e.preventDefault();
        handleSpeedIncrease();
      } else if (key === "arrowleft") {
        e.preventDefault();
        setElapsedTime((prev) => Math.max(0, prev - SLIDER_STEP));
      } else if (key === "arrowright") {
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
    <div style={controlBoxStyle}>
      {/* ▶/⏸ + 🔁 초기화 */}
      <div style={{ display: "flex", gap: "0.5em" }}>
        <button style={darkButtonStyle} onClick={() => setIsPlaying((prev) => !prev)}>
          {isPlaying ? "⏸ 재생/정지" : "▶️ 재생/정지"}
        </button>
        <button style={darkButtonStyle} onClick={handleReset}>🔁 초기화</button>
      </div>

      {/* 슬라이더 + 시간 입력 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.8em", marginLeft: "1.5em" }}>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={0.05}
          value={elapsedTime}
          onChange={handleSliderChange}
          style={{ width: "250px" }}
        />
        <span>
          <input
            ref={hourRef}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "hh")}
            style={{
              width: "2.8em",
              fontSize: "1em",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
          :
          <input
            ref={minuteRef}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "mm")}
            style={{
              width: "2.8em",
              fontSize: "1em",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
          :
          <input
            ref={secondRef}
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "ss")}
            style={{
              width: "2.8em",
              fontSize: "1em",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
        </span>
      </div>

      {/* 속도 조절 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5em", marginLeft: "1.5em" }}>
        <strong
          style={fixedMonoTextStyle}>
            <span>Speed: x</span>
            <span style={{
              display: "inline-block",
              fontFamily: "monospace",
              width: "50px",               // 숫자 영역 고정
              textAlign: "right",
            }}>
              {speed.toFixed(1)}
            </span>
        </strong>



        <button style={darkButtonStyle} onClick={handleSpeedDecrease}>–</button>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={speed}
          onChange={handleSpeedChange}
          style={{ width: "100px" }}
        />
        <button style={darkButtonStyle} onClick={handleSpeedIncrease}>+</button>
      </div>
    </div>
  );
}

export default PlaybackController;
