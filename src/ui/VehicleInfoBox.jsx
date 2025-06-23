import React from "react";

export function VehicleInfoBox({ vehicleId, passengerGeneral, passengerWheel, startTime, position }) {
  return (
    <div
      className="tooltip-box"
      style={{
        position: "absolute",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        background: "white",
        border: "1px solid #ccc",
        padding: "8px",
        borderRadius: "6px",
        zIndex: 10,
        maxWidth: "300px",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        pointerEvents: "none",
        transform: "translateY(-100%)",
      }}
    >
      <strong>차량 ID:</strong> {vehicleId}
      <hr />
      <div>
        <strong>탑승 중</strong>
        <div>일반: {passengerGeneral}</div>
        <div>휠체어: {passengerWheel}</div>
      </div>
      <div style={{ marginTop: "6px" }}>
        <strong>출발시간:</strong> {startTime}
      </div>
    </div>
  );
}
