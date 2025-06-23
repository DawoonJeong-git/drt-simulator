import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import MapView from "../maplibre/MapView";
import DeckGL from "@deck.gl/react";
import { getVehicleLayers } from "../deck/VehicleLayer";
import { useStationCoords } from "../deck/useStationCoords";
import { getUpcomingVehiclesByStation } from "../utils/getUpcomingVehiclesByStation";
import { StationInfoBox } from "../ui/StationInfoBox";
import { VehicleInfoBox } from "../ui/VehicleInfoBox";
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
  const [hoverInfo, setHoverInfo] = useState(null);

  const stationCoords = useStationCoords();
  const deckRef = useRef(null);
  const animationRef = useRef(null);

  useLayoutEffect(() => {
    window.setHoverInfo = setHoverInfo;
  }, []);

  const upcomingVehicles = useMemo(() => {
    return getUpcomingVehiclesByStation(routeData, elapsedTime, stationCoords);
  }, [routeData, elapsedTime, stationCoords]);

  useEffect(() => {
    if (routeData.length === 0 || !stationCoords || Object.keys(stationCoords).length === 0) {
      setDeckLayers([]);
      return;
    }

    const animate = async () => {
      const viewport = deckRef.current?.deck?.getViewports?.()[0];
      const layers = await getVehicleLayers(routeData, elapsedTime, stationCoords, viewport);
      setDeckLayers(layers);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [routeData, elapsedTime, stationCoords]);

  return (
    <div
      className={hideUI ? "hidden-ui" : ""}
      style={{ position: "relative", width: "100vw", height: "100vh" }}
    >
      <div
        id="canvas-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <MapView viewState={viewState} setViewState={setViewState} />
        <DeckGL
          ref={deckRef}
          viewState={viewState}
          controller={true}
          layers={deckLayers}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
      </div>

      {!hideUI && (
        <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 1000 }}>
          <UploadController onRouteDataUpdate={setRouteData} />
        </div>
      )}

      {!hideUI && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
          <PlaybackController
            elapsedTime={elapsedTime}
            setElapsedTime={setElapsedTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            speed={speed}
            setSpeed={setSpeed}
            darkMode={true}
          />
        </div>
      )}

      {!hideUI && (
        <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 1000 }}>
          <RecordingController setHideUI={setHideUI} />
        </div>
      )}

      {hoverInfo?.type === "station" && (
        <StationInfoBox
          stationId={hoverInfo.stationId}
          position={{ x: hoverInfo.x, y: hoverInfo.y }}
          vehicles={upcomingVehicles[hoverInfo.stationId] || []}
        />
      )}
      {hoverInfo?.type === "vehicle" && (
        <VehicleInfoBox
          vehicleId={hoverInfo.vehicleId}
          passengerGeneral={hoverInfo.passengerGeneral}
          passengerWheel={hoverInfo.passengerWheel}
          startTime={hoverInfo.startTime}
          position={{ x: hoverInfo.x, y: hoverInfo.y }}
        />
      )}
    </div>
  );
}

export default CombinedView;
