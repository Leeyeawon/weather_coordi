document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard", { cache: "no-store" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // ----- helpers -----
    const $ = (id) => document.getElementById(id);
    const n = (v) => (v === null || v === undefined || Number.isNaN(v) ? null : v);
    const round0 = (v) => (n(v) === null ? null : Math.round(v));
    const round1 = (v) => (n(v) === null ? null : Math.round(v * 10) / 10);

    // ----- DOM: location -----
    if ($("locText")) $("locText").textContent = data.location || "부산광역시";

    // ----- current -----
    const cur = data.current || {};
    const air = data.air || {};
    const tom = data.tomorrow || {};

    if ($("curTemp")) $("curTemp").textContent = (round0(cur.temp) ?? "-") + "°";
    if ($("curFeels")) $("curFeels").textContent = "체감 온도 " + ((round0(cur.feels) ?? "-") + "°");
    if ($("curWx")) $("curWx").textContent = cur.weather_text || "-";

    if ($("curHumidity")) $("curHumidity").textContent = (round0(cur.humidity) ?? "-") + "%";
    if ($("curWind")) $("curWind").textContent = (round1(cur.wind) ?? "-"); // unit은 HTML에 이미 m/s가 있음
    if ($("curPop")) $("curPop").textContent = (round0(cur.precip_prob) ?? "--") + "%";
    if ($("curUv")) $("curUv").textContent = round0(cur.uv) ?? "-";

    // ----- air quality -----
    // 텍스트만 바꾸고 싶으면 등급만 표시 / 값도 같이 보고 싶으면 문자열 바꾸면 됨
    const pm10Txt =
      air.pm10_grade && n(air.pm10) !== null ? `${air.pm10_grade} (${round0(air.pm10)})` : (air.pm10_grade || "-");
    const pm25Txt =
      air.pm25_grade && n(air.pm25) !== null ? `${air.pm25_grade} (${round0(air.pm25)})` : (air.pm25_grade || "-");

    if ($("pm10State")) $("pm10State").textContent = pm10Txt;
    if ($("pm25State")) $("pm25State").textContent = pm25Txt;

    // ----- tomorrow preview -----
    const tmin = round0(tom.min);
    const tmax = round0(tom.max);
    const tpop = round0(tom.precip_prob);

    if ($("tomRange")) $("tomRange").textContent = `${tmin ?? "-"}° / ${tmax ?? "-"}°`;
    if ($("tomPop")) $("tomPop").textContent = `강수확률 ${tpop ?? "--"}%`;

    // ----- tips -----
    const todayTip = pickTodayTip({
      temp: round0(cur.temp),
      feels: round0(cur.feels),
      humidity: round0(cur.humidity),
      wind: round1(cur.wind),
      pop: round0(cur.precip_prob),
      pm10_grade: air.pm10_grade,
      pm25_grade: air.pm25_grade,
    });

    const tomorrowTip = makeTomorrowTip({
      tmin,
      tmax,
      tpop,
    });

    if ($("todayTipText")) $("todayTipText").textContent = todayTip;
    if ($("tomorrowTipText")) $("tomorrowTipText").textContent = tomorrowTip;
  } catch (e) {
    console.error(e);
  }
}

/**
 * 오늘 팁: 기온/습도/풍속/강수확률/미세먼지 상태에 따라 "해당 카테고리 안에서 랜덤"
 */
function pickTodayTip({ temp, feels, humidity, wind, pop, pm10_grade, pm25_grade }) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 우선순위: (건강/안전) 미세먼지 → 비 → 강풍 → 더위/추위 → 습도 → 기본
  const dustBad = (pm10_grade === "나쁨" || pm10_grade === "매우나쁨" || pm25_grade === "나쁨" || pm25_grade === "매우나쁨");
  if (dustBad) {
    return pick([
      "미세먼지가 나쁜 날이에요. KF 마스크를 챙기고, 실내 환기는 짧게 하는 게 좋아요.",
      "초미세먼지 농도가 높을 수 있어요. 마스크 + 렌즈보단 안경을 추천해요.",
      "먼지가 많은 날엔 외출 후 세안/가글을 해주면 컨디션 관리에 도움이 돼요.",
    ]);
  }

  if (typeof pop === "number" && pop >= 60) {
    return pick([
      "비 올 확률이 높아요. 작은 우산이나 방수 아우터를 챙겨보세요.",
      "강수확률이 높아서 바닥이 미끄러울 수 있어요. 미끄럼 방지 신발이 좋아요.",
      "오늘은 비 대비가 중요해요. 가방엔 우산, 신발은 방수 위주로 추천!",
    ]);
  }

  const feelsGap = (typeof temp === "number" && typeof feels === "number") ? (temp - feels) : 0;
  if ((typeof wind === "number" && wind >= 6) || feelsGap >= 3) {
    return pick([
      "바람이 꽤 불어요. 체감 온도가 내려갈 수 있으니 바람막이나 머플러가 좋아요.",
      "바람 때문에 더 춥게 느껴질 수 있어요. 겉옷은 바람을 막아주는 소재가 좋아요.",
      "바람이 강한 날엔 얇게 여러 겹 레이어드하면 체온 조절이 쉬워요.",
    ]);
  }

  if (typeof temp === "number" && temp >= 28) {
    return pick([
      "오늘은 더운 편이에요. 통풍 잘 되는 소재(면/린넨)로 가볍게 입어보세요.",
      "기온이 높아요. 땀 배출 잘 되는 얇은 옷 + 물 챙기기 추천!",
      "더운 날엔 밝은 색 옷이 체감 온도를 낮추는 데 도움이 돼요.",
    ]);
  }

  if (typeof temp === "number" && temp <= 6) {
    return pick([
      "추운 날이에요. 목/손목/발목을 따뜻하게 하면 체감이 확 좋아져요.",
      "기온이 낮아요. 안쪽은 보온, 바깥은 방풍 되는 조합이 좋아요.",
      "추운 날엔 내복/히트텍 같은 이너를 먼저 챙기면 코디가 편해요.",
    ]);
  }

  if (typeof humidity === "number" && humidity >= 80) {
    return pick([
      "습도가 높은 날이에요. 얇은 겉옷으로 체온 조절하고, 땀 나는 소재는 피하는 게 좋아요.",
      "오늘은 습해서 끈적할 수 있어요. 통풍되는 옷/신발이 편해요.",
      "습도가 높을 땐 얇은 레이어드로 답답함을 줄여보세요.",
    ]);
  }

  return pick([
    "오늘은 무난한 날씨예요. 얇은 겉옷 하나 챙기면 실내외 온도차에 좋아요.",
    "급격한 온도 변화가 있을 수 있어요. 가벼운 겉옷을 추천해요.",
    "컨디션 따라 체감이 달라질 수 있어요. 레이어드가 정답!",
  ]);
}

/**
 * 내일 팁: 내일 최저/최고 + 강수확률 기준으로 코디 문구 생성
 */
function makeTomorrowTip({ tmin, tmax, tpop }) {
  // 강수 먼저
  if (typeof tpop === "number" && tpop >= 60) {
    return "내일은 비 올 확률이 높아요. 방수 아우터/우산 + 젖어도 괜찮은 신발을 추천해요.";
  }

  // 기온대별
  if (typeof tmax === "number" && tmax <= 5) {
    return "내일은 꽤 추워요. 두꺼운 코트나 패딩 + 니트 이너로 보온을 챙겨보세요.";
  }
  if (typeof tmax === "number" && tmax <= 12) {
    return "내일은 쌀쌀한 편이에요. 코트나 두꺼운 니트가 잘 어울리는 날이에요.";
  }
  if (typeof tmax === "number" && tmax <= 20) {
    return "내일은 선선해요. 가벼운 자켓/가디건 정도가 딱 좋아요.";
  }
  if (typeof tmax === "number" && tmax >= 26) {
    return "내일은 따뜻한 편이에요. 반팔+가벼운 겉옷 정도로 시원하게 추천해요.";
  }

  // 그 외
  const range = (typeof tmin === "number" && typeof tmax === "number") ? (tmax - tmin) : null;
  if (typeof range === "number" && range >= 10) {
    return "내일은 일교차가 커요. 낮엔 가볍게, 아침/저녁엔 걸칠 수 있는 겉옷을 추천해요.";
  }
  return "내일은 무난한 날씨예요. 얇은 레이어드로 편하게 코디해보세요.";
}
