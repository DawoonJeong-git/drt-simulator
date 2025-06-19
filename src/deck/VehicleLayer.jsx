import { PathLayer, IconLayer } from "@deck.gl/layers";

// ✅ garage ID를 fetch로 불러옴
let cachedGarageId = null;
async function getGarageId() {
  if (cachedGarageId) return cachedGarageId;
  const res = await fetch("/garage.json");
  const json = await res.json();
  cachedGarageId = json.garageStationId;
  return cachedGarageId;
}

// ✅ "08:02:00" → 초로 변환
function parseTimeToSeconds(timeStr) {
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  return hh * 3600 + mm * 60 + (ss || 0);
}

// ✅ 위치 보간
function interpolatePosition(coords, time) {
  const idx = Math.floor(time);
  const frac = time - idx;

  if (idx >= coords.length - 1) return coords.at(-1);

  const [lng1, lat1] = coords[idx];
  const [lng2, lat2] = coords[idx + 1];

  return [
    lng1 + (lng2 - lng1) * frac,
    lat1 + (lat2 - lat1) * frac,
  ];
}

export async function getVehicleLayers(routeData, elapsedTime, stationCoords) {
  const layers = [];
  const garageStationId = await getGarageId();
  const garagePosition = stationCoords[garageStationId];

  const startIcons = [], endIcons = [], vehicles = [];

  for (const v of routeData) {
    const { coords, vehicle_id, start_time, stops = [] } = v;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const simStartSec = 8 * 3600;
    const vehicleStartSec = parseTimeToSeconds(start_time);
    const delay = vehicleStartSec - simStartSec;

    if (elapsedTime < delay) continue;

    const relativeTime = elapsedTime - delay;
    const pos = interpolatePosition(coords, relativeTime);
    if (!pos) continue;

    const isAtLastStep = Math.floor(relativeTime) >= coords.length - 1;
    const atGarage = garagePosition &&
      Math.hypot(pos[0] - garagePosition[0], pos[1] - garagePosition[1]) < 0.0001;
    if (isAtLastStep && atGarage) continue;

    // 📍 경로
    layers.push(new PathLayer({
      id: `path-${vehicle_id}`,
      data: [{ path: coords }],
      getPath: d => d.path,
      getColor: [66, 135, 245],
      getWidth: 4,
      pickable: false,
    }));

    // 🚗 차량
    vehicles.push({ position: pos, icon: "/car-icon.png" });

    // 🏁 정차지점 아이콘 (stops 기반)
    for (const stop of stops) {
      const coord = stationCoords[stop.station];
      if (!coord) continue;

      if (stop.type === "start") {
        startIcons.push({ position: coord, icon: "/StartStation.png" });
      } else if (stop.type === "end") {
        endIcons.push({ position: coord, icon: "/EndStation.png" });
      }
    }
  }

  // ✅ Layer 구성
  layers.push(
    new IconLayer({
      id: "vehicle-icons",
      data: vehicles,
      getIcon: d => ({ url: d.icon, width: 128, height: 128 }),
      getPosition: d => d.position,
      getSize: 4,
      sizeScale: 10,
    }),
    new IconLayer({
      id: "start-icons",
      data: startIcons,
      getIcon: d => ({ url: d.icon, width: 128, height: 128 }),
      getPosition: d => d.position,
      getSize: 3,
      sizeScale: 8,
    }),
    new IconLayer({
      id: "end-icons",
      data: endIcons,
      getIcon: d => ({ url: d.icon, width: 128, height: 128 }),
      getPosition: d => d.position,
      getSize: 3,
      sizeScale: 8,
    })
  );

  // 🏠 차고지 아이콘
  if (garagePosition) {
    layers.push(new IconLayer({
      id: "garage-icon",
      data: [{ position: garagePosition, icon: "/garage.png" }],
      getIcon: d => ({ url: d.icon, width: 128, height: 128 }),
      getPosition: d => d.position,
      getSize: 3,
      sizeScale: 10,
    }));
  }

  return layers;
}
