// src/data/useStationCoords.js
import { useEffect, useState } from "react";

export function useStationCoords() {
  const [stationMap, setStationMap] = useState({});

  useEffect(() => {
    fetch("/Station.geojson")
      .then(res => res.json())
      .then(data => {
        const map = {};
        for (const feature of data.features) {
          const id = feature.properties.StationID;
          const coords = feature.geometry.coordinates;
          map[id] = coords;
        }
        setStationMap(map);
      })
      .catch(err => {
        console.error("📛 Station.geojson 불러오기 실패:", err);
      });
  }, []);

  return stationMap;
}
