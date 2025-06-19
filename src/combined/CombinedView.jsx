import { useState, useEffect, useRef } from "react";
import MapView from "../maplibre/MapView";
import DeckGL from "@deck.gl/react";
import { getVehicleLayers } from "../deck/VehicleLayer";
import { useStationCoords } from "../deck/useStationCoords";
import PlaybackController from "../ui/PlaybackController";
import UploadController from "../ui/UploadController";
import RecordingController from "../ui/RecordingController";

function CombinedView() {
  const [viewState, setViewState] = useState({
    longitude: 127.265,
    latitude: 36.502,
    zoom: 15,
    pitch: 45,
    bearing: 0,
  });

  const [routeData, setRouteData] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [deckLayers, setDeckLayers] = useState([]);
  const [hideUI, setHideUI] = useState(false);

  const stationCoords = useStationCoords();
  const isPlayingRef = useRef(isPlaying);

  // 최신 상태 유지
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    async function updateLayers() {
      const layers = await getVehicleLayers(routeData, elapsedTime, stationCoords);
      setDeckLayers(layers);
    }

    if (stationCoords && routeData.length > 0) {
      updateLayers();
    }
  }, [routeData, elapsedTime, stationCoords]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* ✅ 녹화 대상: 지도 + 차량 */}
      <div
        id="canvas-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "auto",
        }}
      >
        <MapView viewState={viewState} setViewState={setViewState} />

        <DeckGL
          viewState={viewState}
          controller={false}
          layers={deckLayers}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 🎛️ UI 컨트롤러들 */}
      <UploadController onRouteDataUpdate={setRouteData} />
      <PlaybackController
        elapsedTime={elapsedTime}
        setElapsedTime={setElapsedTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
      />
      <RecordingController setHideUI={setHideUI} />
    </div>
  );
}

export default CombinedView;
