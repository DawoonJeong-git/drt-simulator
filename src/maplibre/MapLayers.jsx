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
      "circle-radius": 1,
      "circle-color": "#ffffff",
      "circle-opacity": 0.8,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffff00",
      "circle-stroke-opacity": 0.8,
    },
  });

}
