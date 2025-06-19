import json
import math
import pandas as pd
from .ODD_visualization import initialize_graph, calculate_path


def interpolate_coords_by_speed(coords, speed_kmh):
    if not coords or len(coords) < 2:
        return []

    def haversine(lon1, lat1, lon2, lat2):
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = phi2 - phi1
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return 2 * R * math.asin(math.sqrt(a))

    speed_mps = speed_kmh * 1000 / 3600
    result = [coords[0]]
    t_buffer = 0.0

    for i in range(1, len(coords)):
        lon1, lat1 = coords[i - 1]
        lon2, lat2 = coords[i]
        segment_dist = haversine(lon1, lat1, lon2, lat2)

        while t_buffer + segment_dist >= speed_mps:
            ratio = (speed_mps - t_buffer) / segment_dist
            interpolated_lon = lon1 + (lon2 - lon1) * ratio
            interpolated_lat = lat1 + (lat2 - lat1) * ratio
            result.append([interpolated_lon, interpolated_lat])

            lon1, lat1 = interpolated_lon, interpolated_lat
            segment_dist -= (speed_mps - t_buffer)
            t_buffer = 0.0
        t_buffer += segment_dist

    return result


def generate_routes(df, city="sejong", speed_kmh=30, stop_duration_sec=60):
    with open("public/garage.json", "r", encoding="utf-8") as f:
        garage_station_id = json.load(f)["garageStationId"]

    base_path = f"./route_generator/ODD/{city}"
    link = pd.read_csv(f"{base_path}/Link.csv", encoding="utf-8")
    station = pd.read_csv(f"{base_path}/Station.csv", encoding="utf-8")
    node = pd.read_csv(f"{base_path}/Node.csv", encoding="utf-8")
    nodeR = pd.read_csv(f"{base_path}/NodeR.csv", encoding="utf-8")

    G = initialize_graph(link)
    results = []

    for _, row in df.iterrows():
        vehicle_id = row["VehicleID"]
        start_time = row["StartTime"]

        stops = []
        stop_ids = []
        for i in range(1, 11):
            stop_col = f"Stop_{i}"
            type_col = f"Type_{i}"
            stop = str(row.get(stop_col, "")).strip()
            stop_type = str(row.get(type_col, "")).strip().lower()

            if stop and stop.lower() != "nan":
                stops.append({"station": stop, "type": stop_type})
                stop_ids.append(stop)
            else:
                break

        if len(stop_ids) < 2:
            print(f"Warning: {vehicle_id} has fewer than 2 stops. Skipped.")
            continue

        station_list = [garage_station_id] + stop_ids + [garage_station_id]

        segments = []
        failed = False
        for i in range(len(station_list) - 1):
            try:
                path = calculate_path(G, station_list[i], station_list[i + 1], link, station, node, nodeR)
                segments.append(path)
            except Exception as e:
                print(f"Route error {vehicle_id}: {station_list[i]} → {station_list[i + 1]}:", e)
                failed = True
                break
        if failed:
            continue

        coords = []
        for i, path in enumerate(segments):
            seg_coords = [[pt[1], pt[0]] for pt in path["coords"]]
            interpolated = interpolate_coords_by_speed(seg_coords, speed_kmh)
            coords += interpolated

            if i < len(segments) - 1 and len(interpolated) > 0:
                coords += [interpolated[-1]] * stop_duration_sec

        results.append({
            "vehicle_id": vehicle_id,
            "start_time": start_time,
            "stops": stops,
            "coords": coords
        })

    return {"routes": results}
