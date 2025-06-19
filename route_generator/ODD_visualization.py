import networkx as nx
import pandas as pd

def initialize_graph(link_data):
    G = nx.DiGraph()
    for _, row in link_data.iterrows():
        G.add_edge(row['FNode'], row['Enode'], weight=row['Length'], link_id=row['LinkID'])
    return G

def calculate_path(G, start_station, end_station, link_data, station_data, node_data, nodeR_data):
    start_links = station_data[station_data['StationID'] == start_station]['LinkID'].values
    end_links = station_data[station_data['StationID'] == end_station]['LinkID'].values

    for start_link in start_links:
        for end_link in end_links:
            try:
                start_node = link_data[link_data['LinkID'] == start_link]['FNode'].values[0]
                end_node = link_data[link_data['LinkID'] == end_link]['Enode'].values[0]

                start_station_distance = station_data[station_data['StationID'] == start_station]['StationDis'].values[0]
                end_station_distance = station_data[station_data['StationID'] == end_station]['StationDis'].values[0]
                end_link_cost = link_data[link_data['LinkID'] == end_link]['Length'].values[0]

                length, path = nx.single_source_dijkstra(G, source=start_node, target=end_node)

                # 회전 제약 처리 (기본 True)
                valid_path = True
                for u, v in zip(path[:-1], path[1:]):
                    u_link_id = G[u][v]['link_id']
                    next_node = v
                    if next_node in nodeR_data['NodeID'].values:
                        turns = nodeR_data[(nodeR_data['NodeID'] == next_node) & (nodeR_data['StartLink'] == u_link_id)]
                        # 회전 금지 조건 사용하려면 여기에 활성화
                        # if any(turn['TurnType'] in [104, 105, 107, 108, 109] for _, turn in turns.iterrows()):
                        #     valid_path = False
                        #     break

                if valid_path:
                    trimmed_path = path[1:-1]
                    link_ids = [G[u][v]['link_id'] for u, v in zip(trimmed_path[:-1], trimmed_path[1:])]

                    length = length - start_station_distance + end_station_distance - end_link_cost

                    # 좌표 정보 만들기
                    path_coords = [
                        (node_data[node_data['NodeID'] == node]['NodeLat'].values[0],
                         node_data[node_data['NodeID'] == node]['NodeLon'].values[0])
                        for node in trimmed_path
                    ]

                    # 시작/도착 정류장 좌표 추가
                    start_coords = (
                        station_data[station_data['StationID'] == start_station]['StationLat'].values[0],
                        station_data[station_data['StationID'] == start_station]['StationLon'].values[0]
                    )
                    end_coords = (
                        station_data[station_data['StationID'] == end_station]['StationLat'].values[0],
                        station_data[station_data['StationID'] == end_station]['StationLon'].values[0]
                    )

                    path_coords.insert(0, start_coords)
                    path_coords.append(end_coords)

                    return {
                        'start_station': start_station,
                        'end_station': end_station,
                        'total_length': length,
                        'links': link_ids,
                        'nodes': trimmed_path,
                        'coords': path_coords
                    }
            except Exception as e:
                print(f"❌ 경로 계산 중 오류 발생: {start_station} → {end_station}: {e}")

    print(f"⚠️ 경로 없음: {start_station} → {end_station}")
    return None
