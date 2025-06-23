import { IconLayer } from "@deck.gl/layers";

export function StationLayer({ stationCoords, routeData, elapsedTime, setHoverInfo, setSelectedInfo }) {
  const visibleStationIds = new Set();

  for (const vehicle of routeData) {
    const [hh, mm, ss] = vehicle.start_time.split(":").map(Number);
    const startSec = hh * 3600 + mm * 60 + (ss || 0);
    const endSec = startSec + vehicle.coords.length;

    if (elapsedTime >= startSec && elapsedTime <= endSec) {
      for (const stop of vehicle.stops) {
        visibleStationIds.add(stop.station);
      }
    }
  }

  const data = [...visibleStationIds]
    .filter(id => stationCoords[id])
    .map(id => ({
      stationId: id,
      coordinates: stationCoords[id],
    }));

  return new IconLayer({
    id: "station-icons",
    data,
    pickable: true,
    getPosition: d => d.coordinates,
    getIcon: () => ({
      url: "/station.png",
      width: 128,
      height: 128,
      anchorY: 128,
    }),
    sizeScale: 1,
    getSize: 30,
    onHover: ({ object, x, y }) => {
      if (object) {
        setHoverInfo({
          type: "station",
          stationId: object.stationId,
          x,
          y,
        });
      } else {
        setHoverInfo(null);
      }
    },
    onClick: ({ object, x, y }) => {
      if (object) {
        setSelectedInfo({
          type: "station",
          stationId: object.stationId,
          x,
          y,
        });
      }
    },
  });
}
