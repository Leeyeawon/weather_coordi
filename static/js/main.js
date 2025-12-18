// static/js/main.js

function fmtNum(v, unit = "") {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const n = Math.round(Number(v));
  return `${n}${unit}`;
}

function pickTip(d) {
  const pop = Number(d?.current?.precip_prob ?? 0);
  const uv = Number(d?.current?.uv ?? 0);
  const pm10g = d?.air?.pm10_grade || "-";
  const pm25g = d?.air?.pm25_grade || "-";
  const feels = Number(d?.current?.feels ?? 0);

  if (pop >= 50) return "비 올 확률이 높아요. 우산/우비 챙겨요 ☔";
  if (uv >= 6) return "자외선이 강해요. 양산/모자 추천 🌤️";
  if (pm10g === "나쁨" || pm10g === "매우나쁨" || pm25g === "나쁨" || pm25g === "매우나쁨")
    return "미세먼지가 나빠요. 마스크 챙기기 😷";
  if (feels <= 8) return "체감이 낮아요. 보온 아이템 추천 🧣";
  return "오늘 컨디션에 맞춰 가볍게 준비해요 🙂";
}

async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // 위치
    const loc = document.getElementById("locText");
    if (loc) loc.textContent = data.location || "부산광역시";

    // 현재
    const cur = data.current || {};
    const air = data.air || {};
    const tom = data.tomorrow || {};

    const curTemp = document.getElementById("curTemp");
    if (curTemp) curTemp.textContent = fmtNum(cur.temp, "°");

    const curFeels = document.getElementById("curFeels");
    if (curFeels) curFeels.textContent = `체감 온도 ${fmtNum(cur.feels, "°")}`;

    const curWx = document.getElementById("curWx");
    if (curWx) curWx.textContent = cur.weather_text || "-";

    const curHumidity = document.getElementById("curHumidity");
    if (curHumidity) curHumidity.textContent = fmtNum(cur.humidity, "%");

    const curWind = document.getElementById("curWind");
    if (curWind) curWind.textContent = fmtNum(cur.wind, "");

    const curPop = document.getElementById("curPop");
    if (curPop) curPop.textContent = fmtNum(cur.precip_prob, "%");

    const curUv = document.getElementById("curUv");
    if (curUv) curUv.textContent = fmtNum(cur.uv, "");

    const pm10State = document.getElementById("pm10State");
    if (pm10State) pm10State.textContent = air.pm10_grade || "-";

    const pm25State = document.getElementById("pm25State");
    if (pm25State) pm25State.textContent = air.pm25_grade || "-";

    // 내일
    const tomRange = document.getElementById("tomRange");
    if (tomRange) tomRange.textContent = `${fmtNum(tom.min, "°")} / ${fmtNum(tom.max, "°")}`;

    const tomPop = document.getElementById("tomPop");
    if (tomPop) tomPop.textContent = `강수확률 ${fmtNum(tom.precip_prob, "%")}`;

    // (원하면 index 하단 문구도 id 달아서 바꿀 수 있음)
    // const tip = document.getElementById("tipText"); tip.textContent = pickTip(data);

  } catch (e) {
    console.error("dashboard load error:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 기존 버튼 로직 유지(있으면)
  const btn = document.querySelector(".coordi-button");
  if (btn) btn.addEventListener("click", () => (window.location.href = "/style"));

  loadDashboard();
});
