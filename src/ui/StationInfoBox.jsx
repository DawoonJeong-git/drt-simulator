export function StationInfoBox({ stationId, vehicles, position, fixed = false, onClose }) {
  const sortedVehicles = [...vehicles].sort((a, b) => a.etd - b.etd);

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
        maxWidth: "400px",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <strong>정류장:</strong> {stationId}
      <hr />
      {sortedVehicles.length === 0 ? (
        <div>도착 예정 차량 없음</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerStyle}>순번</th>
              <th style={headerStyle}>ID</th>
              <th style={headerStyle}>차량</th>
              <th style={headerStyle}>탑승</th>
              <th style={headerStyle}>하차</th>
            </tr>
          </thead>
          <tbody>
            {sortedVehicles.map((v, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={cellStyle}>{i + 1}</td>
                <td style={cellStyle}>{v.vehicle_id}</td>
                <td style={cellStyle}>{v.vehicle_type}</td>
                <td style={cellStyle}>
                  <div>일반: {v.pickup_general || "-"}</div>
                  <div>휠체어: {v.pickup_wheelchair || "-"}</div>
                </td>
                <td style={cellStyle}>
                  <div>일반: {v.dropoff_general || "-"}</div>
                  <div>휠체어: {v.dropoff_wheelchair || "-"}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {fixed && (
        <button
          style={{
            marginTop: "8px",
            fontSize: "11px",
            padding: "4px 8px",
            border: "1px solid #999",
            background: "#f0f0f0",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          닫기
        </button>
      )}
    </div>
  );
}

// ✅ 공통 스타일
const headerStyle = {
  textAlign: "left",
  padding: "4px 6px",
  borderBottom: "1px solid #aaa",
  backgroundColor: "#f9f9f9",
};

const cellStyle = {
  padding: "4px 6px",
  textAlign: "left",
  whiteSpace: "pre-line",
};
