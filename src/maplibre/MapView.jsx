import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { addMapLibreLayers } from "./MapLayers";

function MapView({ viewState, setViewState }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.maptiler.com/maps/0195ec79-0a2f-735c-b071-447cc493837d/style.json?key=hxJKhwGnL2MZxHh5fCcz",
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
      minZoom: 10,
      maxZoom: 18,
      keyboard: false,
    });

    mapRef.current = map;

    const moveAmount = 50;
    const rotateAmount = 2.5;
    const pitchAmount = 2;
    const zoomAmount = 0.05;

    const heldKeys = new Set();
    let animationFrameId = null;

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);
      if (!mapRef.current || heldKeys.size === 0) return;

      const map = mapRef.current;

      let newBearing = map.getBearing();
      let newZoom = map.getZoom();
      let newPitch = map.getPitch();
      let deltaX = 0;
      let deltaY = 0;

      heldKeys.forEach((key) => {
        switch (key) {
          case "w":
            deltaY -= moveAmount;
            break;
          case "s":
            deltaY += moveAmount;
            break;
          case "a":
            deltaX -= moveAmount;
            break;
          case "d":
            deltaX += moveAmount;
            break;
          case "q":
            newBearing += rotateAmount;
            break;
          case "e":
            newBearing -= rotateAmount;
            break;
          case "[":
            newZoom += zoomAmount;
            break;
          case "]":
            newZoom -= zoomAmount;
            break;
          case "z":
            newPitch = Math.min(newPitch + pitchAmount, 85);
            break;
          case "c":
            newPitch = Math.max(newPitch - pitchAmount, 0);
            break;
          default:
            break;
        }
      });

      if (deltaX !== 0 || deltaY !== 0) {
        map.panBy([deltaX, deltaY], { duration: 0 });
      }
      map.setBearing(newBearing);
      map.setZoom(newZoom);
      map.setPitch(newPitch);
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "r") {
        mapRef.current?.jumpTo({
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
        });
        return;
      }

      heldKeys.add(key);
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      heldKeys.delete(key);
      if (heldKeys.size === 0 && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl(), "bottom-left");

    map.on("load", () => {
      console.log("🗺️ MapLibre loaded");
      addMapLibreLayers(map);
    });

    map.on("move", () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const pitch = map.getPitch();
      const bearing = map.getBearing();

      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom,
        pitch,
        bearing,
      });
    });

    return () => {
      map.remove();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ✅ DeckGL → MapLibre 카메라 상태 반영
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    const changed =
      center.lng !== viewState.longitude ||
      center.lat !== viewState.latitude ||
      zoom !== viewState.zoom ||
      pitch !== viewState.pitch ||
      bearing !== viewState.bearing;

    if (changed) {
      map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
      });
    }
  }, [viewState]);

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "auto",
      }}
    />
  );
}

export default MapView;
