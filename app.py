from flask import Flask, render_template, jsonify
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import time
import requests

app = Flask(__name__)

# ✅ 부산 고정 (부산광역시청 근처 좌표)
BUSAN_LAT = 35.1796
BUSAN_LON = 129.0756
TZ = "Asia/Seoul"
KST = ZoneInfo(TZ)

# ---- 간단 캐시(10분) ----
_cache = {"ts": 0.0, "data": None}
CACHE_SEC = 600


def _safe_get(url: str, params: dict):
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def _wx_text(code: int) -> str:
    # Open-Meteo weather_code 요약 매핑 (필요하면 더 추가 가능)
    if code == 0:
        return "맑음"
    if code in (1,):
        return "대체로 맑음"
    if code in (2,):
        return "부분적으로 흐림"
    if code in (3,):
        return "흐림"
    if code in (45, 48):
        return "안개"
    if code in (51, 53, 55, 56, 57):
        return "이슬비"
    if code in (61, 63, 65, 66, 67):
        return "비"
    if code in (71, 73, 75, 77):
        return "눈"
    if code in (80, 81, 82):
        return "소나기"
    if code in (95, 96, 99):
        return "뇌우"
    return "날씨"


def _aq_grade_pm10(v):
    # 많이 쓰는 구간 (좋음/보통/나쁨/매우나쁨)
    if v is None:
        return "-"
    if v <= 30:
        return "좋음"
    if v <= 80:
        return "보통"
    if v <= 150:
        return "나쁨"
    return "매우나쁨"


def _aq_grade_pm25(v):
    if v is None:
        return "-"
    if v <= 15:
        return "좋음"
    if v <= 35:
        return "보통"
    if v <= 75:
        return "나쁨"
    return "매우나쁨"


def _pick_hour_index(times: list[str], target_key: str) -> int:
    # times: ["2025-12-19T04:00", ...]
    if not times:
        return 0
    try:
        return times.index(target_key)
    except ValueError:
        # target_key가 정확히 없으면 "가장 가까운 시간"으로 잡기
        try:
            target_dt = datetime.fromisoformat(target_key)
        except Exception:
            return 0

        best_i = 0
        best_diff = None
        for i, t in enumerate(times):
            try:
                dt = datetime.fromisoformat(t)
                diff = abs((dt - target_dt).total_seconds())
                if best_diff is None or diff < best_diff:
                    best_diff = diff
                    best_i = i
            except Exception:
                continue
        return best_i


def get_dashboard_data():
    now_ts = time.time()
    if _cache["data"] and (now_ts - _cache["ts"] < CACHE_SEC):
        return _cache["data"]

    # ---- Weather (기온/체감/습도/바람/강수확률/UV/날씨코드/내일 최저최고/내일 강수) ----
    weather_url = "https://api.open-meteo.com/v1/forecast"
    weather_params = {
        "latitude": BUSAN_LAT,
        "longitude": BUSAN_LON,
        "timezone": TZ,
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
        "hourly": "precipitation_probability,uv_index",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max",
        "forecast_days": 3,
    }
    weather = _safe_get(weather_url, weather_params)

    # ---- Air Quality (PM10/PM2.5) ----
    aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    aq_params = {
        "latitude": BUSAN_LAT,
        "longitude": BUSAN_LON,
        "timezone": TZ,
        "hourly": "pm10,pm2_5",
        "forecast_days": 2,
    }
    air = _safe_get(aq_url, aq_params)

    # ---- 현재 시각(정시 기준) ----
    now_dt = datetime.now(KST)
    now_hour = now_dt.replace(minute=0, second=0, microsecond=0)
    now_key = now_hour.strftime("%Y-%m-%dT%H:00")

    # 현재(Weather current)
    cur = weather.get("current", {}) or {}
    temp = cur.get("temperature_2m")
    feels = cur.get("apparent_temperature")
    humidity = cur.get("relative_humidity_2m")
    wind = cur.get("wind_speed_10m")
    wcode = cur.get("weather_code")
    wx = _wx_text(wcode if isinstance(wcode, int) else -1)

    # 현재(강수확률/UV: hourly에서 현재시간 인덱스)
    hourly = weather.get("hourly", {}) or {}
    h_times = hourly.get("time", []) or []
    idx = _pick_hour_index(h_times, now_key)

    precip_prob = None
    uv = None
    if hourly.get("precipitation_probability"):
        precip_prob = hourly["precipitation_probability"][idx]
    if hourly.get("uv_index"):
        uv = hourly["uv_index"][idx]

    # 현재(PM10/PM2.5)
    ah = air.get("hourly", {}) or {}
    aq_times = ah.get("time", []) or []
    aidx = _pick_hour_index(aq_times, now_key)

    pm10 = None
    pm25 = None
    if ah.get("pm10"):
        pm10 = ah["pm10"][aidx]
    if ah.get("pm2_5"):
        pm25 = ah["pm2_5"][aidx]

    # 내일(일별)
    tomorrow = (now_dt.date() + timedelta(days=1)).isoformat()
    d = weather.get("daily", {}) or {}
    d_times = d.get("time", []) or []
    try:
        didx = d_times.index(tomorrow)
    except ValueError:
        didx = 1 if len(d_times) > 1 else 0

    tmin = d.get("temperature_2m_min", [None])[didx]
    tmax = d.get("temperature_2m_max", [None])[didx]
    tpop = d.get("precipitation_probability_max", [None])[didx]

    data = {
        "location": "부산광역시",
        "current": {
            "temp": temp,
            "feels": feels,
            "humidity": humidity,
            "wind": wind,
            "precip_prob": precip_prob,
            "uv": uv,
            "weather_code": wcode,
            "weather_text": wx,
        },
        "air": {
            "pm10": pm10,
            "pm25": pm25,
            "pm10_grade": _aq_grade_pm10(pm10),
            "pm25_grade": _aq_grade_pm25(pm25),
        },
        "tomorrow": {
            "min": tmin,
            "max": tmax,
            "precip_prob": tpop,
        },
    }

    _cache["ts"] = now_ts
    _cache["data"] = data
    return data

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/style")
def style():
    return render_template("style.html")

@app.get("/closet")
def closet():
    return render_template("closet.html")

@app.get("/favorites")
def favorites():
    return render_template("favorites.html")

@app.get("/profile")
def profile():
    return render_template("profile.html")

# --------------------
# APIs
# --------------------
@app.get("/api/dashboard")
def api_dashboard():
    try:
        return jsonify(get_dashboard_data())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# --------------------

if __name__ == "__main__":
    app.run(debug=True)
