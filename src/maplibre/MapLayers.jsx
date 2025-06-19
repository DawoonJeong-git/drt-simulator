// src/maplibre/MapLayers.js

export function addMapLibreLayers(map) {
  // ✅ Link Layer
  map.addSource("link", {
    type: "geojson",
    data: "/Link.geojson",
  });
  map.addLayer({
    id: "link-layer",
    type: "line",
    source: "link",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": "#ffffff",
      "line-opacity": 1,
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.5, 14, 3, 18, 6],
    },
  });

  // ✅ Station Layer
  map.addSource("station", {
    type: "geojson",
    data: "/Station.geojson",
  });
  map.addLayer({
    id: "station-layer",
    type: "circle",
    source: "station",
    paint: {
      "circle-radius": 3,
      "circle-color": "#ff4d91",
      "circle-opacity": 1,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-opacity": 0.9,
    },
  });

  // ✅ Node Layer
  map.addSource("node", {
    type: "geojson",
    data: "/Node.geojson",
  });
  map.addLayer({
    id: "node-layer",
    type: "circle",
    source: "node",
    paint: {
      "circle-radius": 1.2,
      "circle-color": "#aaaaaa",
      "circle-opacity": 0.6,
    },
  });
}
