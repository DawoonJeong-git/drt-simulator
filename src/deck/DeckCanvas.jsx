// src/deck/DeckCanvas.jsx
import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { getVehicleLayers } from "./VehicleLayer";

function DeckCanvas() {
  const [routeData, setRouteData] = useState([]);

  useEffect(() => {
    fetch("/route_output.json")
      .then(res => res.json())
      .then(data => {
        setRouteData(data);
      });
  }, []);

  const viewState = {
    longitude: 127.265,
    latitude: 36.502,
    zoom: 15,
    pitch: 45,
    bearing: 0,
  };

  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={getVehicleLayers(routeData)}
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        zIndex: 0,
      }}
    />
  );
}

export default DeckCanvas;
