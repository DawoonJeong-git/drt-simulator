import { PathLayer, IconLayer, ScatterplotLayer } from "@deck.gl/layers";

let cachedGarageId = null;
async function getGarageId() {
  if (cachedGarageId) return cachedGarageId;
  const res = await fetch("/garage.json");
  const json = await res.json();
  cachedGarageId = json.garageStationId;
  return cachedGarageId;
}

function parseTimeToSeconds(timeStr) {
  const [hh, mm, ss] = timeStr.split(":" ).map(Number);
  return hh * 3600 + mm * 60 + (ss || 0);
}

function interpolatePosition(coords, time) {
  const idx = Math.floor(time);
  const frac = time - idx;
  if (idx >= coords.length - 1) return coords.at(-1);
  const [lng1, lat1] = coords[idx];
  const [lng2, lat2] = coords[idx + 1];
  return [lng1 + (lng2 - lng1) * frac, lat1 + (lat2 - lat1) * frac];
}

function clean(val) {
  const n = Number(String(val ?? "0").trim());
  return isNaN(n) ? 0 : n;
}

export async function getVehicleLayers(routeData, elapsedTime, stationCoords, viewport) {
  const pathLayers = [];
  const otherLayers = [];

  const garageStationId = await getGarageId();
  const garagePosition = stationCoords[garageStationId];

  const vehicles = [];
  const stationIcons = [];
  const statusDots = [];

  const simStartSec = 8 * 3600;

  for (const v of routeData) {
    const { coords, vehicle_id, start_time, vehicle_type, stops = [] } = v;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const vehicleStartSec = parseTimeToSeconds(start_time);
    const delay = vehicleStartSec - simStartSec;
    const relativeTime = elapsedTime - delay;
    if (relativeTime < 0 || relativeTime >= coords.length) continue;

    const pos = interpolatePosition(coords, relativeTime);
    if (!pos) continue;

    const pastCoords = coords.slice(0, Math.floor(relativeTime) + 1);
    const futureCoords = coords.slice(Math.floor(relativeTime));

    if (pastCoords.length >= 2) {
      pathLayers.push(new PathLayer({
        id: `path-past-${vehicle_id}`,
        data: [{ path: pastCoords }],
        getPath: d => d.path,
        getColor: [230, 115, 83],
        getWidth: 2,
        widthScale: 2,
        opacity: 0.6,
        pickable: false,
      }));
    }

    if (futureCoords.length >= 2) {
      pathLayers.push(new PathLayer({
        id: `path-future-${vehicle_id}`,
        data: [{ path: futureCoords }],
        getPath: d => d.path,
        getColor: [50, 194, 151],
        getWidth: 2,
        widthScale: 2.5,
        opacity: 0.8,
        pickable: false,
      }));
    }

    let passengerGeneral = 0;
    let passengerWheel = 0;
    const processedStops = new Set();
    const totalTravelSec = coords.length;
    const secondsPerStop = totalTravelSec / (stops.length + 1);

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const stopNum = i + 1;
      const eta = stopNum * secondsPerStop;

      if (relativeTime >= eta && !processedStops.has(i)) {
        processedStops.add(i);
        const pickupGen = clean(stop.pickup_general);
        const pickupWhl = clean(stop.pickup_wheelchair);
        const dropGen = clean(stop.dropoff_general);
        const dropWhl = clean(stop.dropoff_wheelchair);
        passengerGeneral += pickupGen;
        passengerWheel += pickupWhl;
        passengerGeneral -= dropGen;
        passengerWheel -= dropWhl;
      }
    }

    const passengerCount = passengerGeneral + passengerWheel;
    let status = "to_pickup";
    const lastStopETA = (stops.length) * secondsPerStop;
    if (passengerCount > 0) status = "with_passenger";
    else if (relativeTime >= lastStopETA) status = "to_garage";

    vehicles.push({
      vehicle_id,
      position: pos,
      icon: `/car_${vehicle_type}.png`,
      status,
      passengerCount,
      passengerGeneral,
      passengerWheel,
      startTime: start_time,
    });

    if (viewport && viewport.project && viewport.unproject) {
      const now = performance.now();
      const blink = Math.floor((now / 500) % 2) === 0 ? 255 : 50;

      let color = [0, 0, 0, 0];
      if (status === "with_passenger") color = [0, 100, 255, blink];
      else if (status === "to_pickup") color = [255, 165, 0, blink];

      const screenPos = viewport.project(pos);
      const offset = [20, -25];
      const dotScreenPos = [screenPos[0] + offset[0], screenPos[1] + offset[1]];
      const geoPos = viewport.unproject(dotScreenPos);

      statusDots.push({ position: geoPos, color });
    }

    for (const stop of stops) {
      const coord = stationCoords[stop.station];
      if (!coord) continue;
      stationIcons.push({
        stationId: stop.station,
        position: coord,
        icon: "/station.png",
      });
    }
  }

  otherLayers.push(new IconLayer({
    id: "vehicle-icons",
    data: vehicles,
    getIcon: d => ({ url: d.icon, width: 128, height: 128, anchorY: 128 }),
    getPosition: d => [...d.position, 5],
    getSize: 3,
    sizeScale: 10,
    pickable: true,
    onHover: ({ object, x, y }) => {
      if (object) {
        window.setHoverInfo?.({
          type: "vehicle",
          vehicleId: object.vehicle_id,
          passengerGeneral: object.passengerGeneral,
          passengerWheel: object.passengerWheel,
          startTime: object.startTime,
          x,
          y,
        });
      } else {
        window.setHoverInfo?.(null);
      }
    },
  }));

  otherLayers.push(new IconLayer({
    id: "station-icons",
    data: stationIcons,
    getIcon: d => ({ url: d.icon, width: 80, height: 80, anchorY: 80 }),
    getPosition: d => [...d.position, 1],
    getSize: 3,
    sizeScale: 8,
    pickable: true,
    onHover: ({ object, x, y }) => {
      if (object) {
        window.setHoverInfo?.({
          type: "station",
          stationId: object.stationId,
          x,
          y,
        });
      } else {
        window.setHoverInfo?.(null);
      }
    },
  }));

  if (garagePosition) {
    otherLayers.push(new IconLayer({
      id: "garage-icon",
      data: [{ position: garagePosition, icon: "/garage.png" }],
      getIcon: d => ({ url: d.icon, width: 128, height: 128, anchorY: 128 }),
      getPosition: d => [...d.position, 5],
      getSize: 3,
      sizeScale: 10,
      pickable: true,
    }));
  }

  otherLayers.push(new ScatterplotLayer({
    id: "status-dots",
    data: statusDots,
    getPosition: d => d.position,
    getFillColor: d => d.color,
    getRadius: 3,
    radiusMinPixels: 3,
    pickable: false,
  }));

  return [...pathLayers, ...otherLayers];
}
