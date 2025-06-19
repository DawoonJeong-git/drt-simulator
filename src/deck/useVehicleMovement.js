// src/hooks/useVehicleMovement.js

import { useMemo } from "react";

/**
 * 차량 위치 보간 계산 Hook
 * @param {Array} coords - 차량 경로 좌표 리스트
 * @param {number} elapsedTime - 경과 시간 (초 단위)
 * @returns {Array|null} position - [lng, lat]
 */
export function useVehiclePosition(coords, elapsedTime) {
  return useMemo(() => {
    if (!Array.isArray(coords) || coords.length === 0) return null;

    const idx = Math.floor(elapsedTime);
    const frac = elapsedTime - idx;

    if (idx >= coords.length - 1) return coords[coords.length - 1];

    const [lng1, lat1] = coords[idx];
    const [lng2, lat2] = coords[idx + 1];

    const lng = lng1 + (lng2 - lng1) * frac;
    const lat = lat1 + (lat2 - lat1) * frac;

    return [lng, lat];
  }, [coords, elapsedTime]);
}
