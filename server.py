from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import csv
import json
import pandas as pd
from route_generator.generate_route_json import generate_routes

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return "✅ Flask 백엔드 서버가 정상 작동 중입니다."

# 📤 INPUT CSV 업로드
@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"status": "error", "message": "No file"}), 400

    file.save("public/route_input.csv")
    print("✅ route_input.csv 저장 완료")
    return jsonify({"status": "success", "message": "Input CSV 업로드 완료"}), 200

# 📤 OUTPUT CSV → JSON 변환
@app.route("/upload_output_csv", methods=["POST"])
def upload_output_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"status": "error", "message": "No file"}), 400

    temp_csv_path = "public/temp_output.csv"
    json_path = "public/route_output.json"

    file.save(temp_csv_path)
    print("✅ 임시 CSV 저장 완료:", temp_csv_path)

    try:
        with open(temp_csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)

        print("✅ route_output.json 변환 완료")
        return jsonify({"status": "success", "message": "Output CSV → JSON 변환 완료"}), 200
    except Exception as e:
        print("❌ CSV → JSON 변환 실패:", e)
        return jsonify({"status": "error", "message": "CSV to JSON 변환 실패"}), 500

# 📤 OUTPUT JSON 직접 업로드
@app.route("/upload_output_json", methods=["POST"])
def upload_output_json():
    file = request.files.get("file")
    if not file:
        return jsonify({"status": "error", "message": "No file"}), 400

    file.save("public/route_output.json")
    print("✅ route_output.json 직접 업로드 완료")
    return jsonify({"status": "success", "message": "Output JSON 업로드 완료"}), 200

# ✅ 기존 방식: 알고리즘 실행 후 JSON 파일 생성
@app.route("/api/generate", methods=["GET"])
def generate_route_legacy():
    try:
        result = subprocess.run(
            ["python", "route_generator/generate_route_json.py"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(result.stdout.decode(errors="ignore"))
        return jsonify({"status": "success", "message": "경로가 생성되었습니다."})
    except subprocess.CalledProcessError as e:
        print(e.stderr.decode(errors="ignore"))
        return jsonify({"status": "error", "message": "실행 실패"}), 500

# ✅ 신규 API 방식: CSV 업로드 → 경로 생성 → JSON 직접 응답
@app.route("/api/generate", methods=["POST"])
def generate_route_api():
    try:
        uploaded_file = request.files['file']
        df = pd.read_csv(uploaded_file)
        output = generate_routes(df)

        # coords 정규화: 문자열이 아닌 float 배열로 보정
        for route in output["routes"]:
            route["coords"] = [
                [float(lon), float(lat)] for lon, lat in route["coords"]
            ]

        return jsonify(output)
    except Exception as e:
        print("❌ 실시간 API 응답 실패:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
