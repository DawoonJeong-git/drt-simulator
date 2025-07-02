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
      "line-opacity": 0.5,
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
      "circle-radius": 1.5,
      "circle-color": "#ffffff",
      "circle-opacity": 0.6,
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "#000000",
      "circle-stroke-opacity": 0.6,
    },
  });

}
