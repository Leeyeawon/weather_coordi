// ===== 오늘의 추천 아이템(기존 기능 유지) =====
const itemContainer = document.querySelector(".item-align-con");
const btnDiffItem = document.querySelector(".btn-diff-item");
const itemImage = document.querySelector(".item-img-con img");
const itemName = document.querySelector(".item-name");
const itemDetail = document.querySelector(".item-detail");
const countEl = document.querySelector(".count");
const favorite = document.querySelector(".favorite");
const btnFavorite = document.querySelector(".btn-favorite");
const btnText = document.querySelector(".btn-favorite p");

let count = 1;
let isFavorite = false;

const ITEM = {
  1: {
    url: "/static/img/style1.png",
    name: "크림 니트",
    detail:
      "오늘 같은 쌀쌀한 날씨에 딱 맞는 따뜻하고 부드러운 니트예요. 심플한 디자인으로 다양한 코디에 활용하기 좋아요.",
  },
  2: {
    url: "/static/img/style2.png",
    name: "숏 패딩",
    detail:
      "바람이 부는 날엔 보온이 중요해요. 가벼운 숏패딩으로 활동성도 챙겨보세요.",
  },
  3: {
    url: "/static/img/style3.png",
    name: "후드 집업",
    detail:
      "간절기/실내외 온도차가 있을 때 툭 걸치기 좋아요. 레이어드에도 잘 어울려요.",
  },
};

function addCount() {
  if (count === 3) count = 1;
  else count += 1;
}

function changeStyleInfo() {
  if (!itemImage) return;
  itemImage.src = ITEM[count].url;
  itemImage.alt = `style${count}`;
  if (itemName) itemName.textContent = ITEM[count].name;
  if (itemDetail) itemDetail.textContent = ITEM[count].detail;
  if (countEl) countEl.textContent = `${count}/3`;
}

if (btnDiffItem) {
  btnDiffItem.addEventListener("click", () => {
    if (itemContainer) itemContainer.classList.add("fade-out");
    setTimeout(() => {
      addCount();
      changeStyleInfo();
      if (itemContainer) itemContainer.classList.remove("fade-out");
    }, 200);
  });
}

if (btnFavorite) {
  btnFavorite.addEventListener("click", () => {
    if (!btnText || !favorite) return;
    if (isFavorite) {
      alert("즐겨찾기 제거 완료!!");
      btnText.textContent = "이 코디를 즐겨찾기로 저장하기";
      favorite.classList.remove("show");
    } else {
      alert("즐겨찾기 등록 완료!!");
      btnText.textContent = "이 코디를 즐겨찾기에서 제거하기";
      favorite.classList.add("show");
    }
    isFavorite = !isFavorite;
  });
}

// ===== 공통 유틸 =====
function gradeBad(grade) {
  return grade === "나쁨" || grade === "매우나쁨";
}
function toNum(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function round0(v) {
  const n = toNum(v, null);
  return n === null ? null : Math.round(n);
}

// ===== 내일 코디 팁 생성 =====
function makeTomorrowTip({ tmin, tmax, tpop }) {
  if (typeof tpop === "number" && tpop >= 60) {
    return "내일은 비 올 확률이 높아요. 방수 아우터/우산 + 젖어도 괜찮은 신발을 추천해요.";
  }
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
  const range =
    typeof tmin === "number" && typeof tmax === "number" ? tmax - tmin : null;
  if (typeof range === "number" && range >= 10) {
    return "내일은 일교차가 커요. 낮엔 가볍게, 아침/저녁엔 걸칠 수 있는 겉옷을 추천해요.";
  }
  return "내일은 무난한 날씨예요. 얇은 레이어드로 편하게 코디해보세요.";
}

// ===== style 페이지: 건강 & 보조 아이템(2개 고정) + 내일 미리보기 =====
async function loadStyleDashboard() {
  try {
    const res = await fetch("/api/dashboard", { cache: "no-store" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const cur = data.current || {};
    const air = data.air || {};
    const tom = data.tomorrow || {};

    const pop = round0(cur.precip_prob);
    const uv = round0(cur.uv);
    const wx = (cur.weather_text || "").toString();

    const pm10Bad = gradeBad(air.pm10_grade);
    const pm25Bad = gradeBad(air.pm25_grade);
    const dustBad = pm10Bad || pm25Bad;
    const rainy =
      (typeof pop === "number" && pop >= 50) ||
      wx.includes("비") ||
      wx.includes("소나기") ||
      wx.includes("뇌우");

    // --- 추천 후보 3개 중 우선순위로 2개 선택: 미세먼지 > 비 > 자외선 ---
    const candidates = [];

    // 1) 미세먼지
    candidates.push({
      key: "dust",
      icon: "/static/img/mask.png",
      title: dustBad ? "마스크 착용 권장" : "마스크(선택)",
      desc: dustBad
        ? `미세먼지(${air.pm10_grade || "-"})/초미세먼지(${air.pm25_grade || "-"})가 좋지 않아요. 마스크를 꼭 챙겨보세요.`
        : `미세먼지(${air.pm10_grade || "-"})/초미세먼지(${air.pm25_grade || "-"})는 무난한 편이에요. 필요할 때만 챙겨도 좋아요.`,
      score: dustBad ? 3 : 0,
    });

    // 2) 비/강수
    candidates.push({
      key: "rain",
      // umbrella.png 없을 수도 있어서 precipitation.png로 안전하게
      icon: "/static/img/precipitation.png",
      title: rainy ? "우산 챙기기" : "우산(가방에 소형)",
      desc: rainy
        ? `강수확률이 ${pop ?? "--"}%예요. 우산(또는 방수 아우터)을 챙겨두면 좋아요.`
        : "비 소식은 크지 않지만, 갑작스러운 비 대비로 작은 우산 하나 챙기면 좋아요.",
      score: rainy ? 2 : 0,
    });

    // 3) 자외선
    const uvLevel = typeof uv === "number" ? uv : 0;
    candidates.push({
      key: "uv",
      icon: "/static/img/uv-protect.png",
      title: "자외선 차단",
      desc:
        uvLevel >= 6
          ? `오늘 UV 지수는 ${uvLevel}로 높은 편이에요. 선크림 + 모자/양산을 추천해요.`
          : uvLevel >= 3
          ? `오늘 UV 지수는 ${uvLevel}예요. 외출 시간이 길면 선크림을 추천해요.`
          : `오늘 UV 지수는 ${uvLevel}로 낮은 편이에요. 그래도 기본 선크림은 추천해요.`,
      score: uvLevel >= 6 ? 1 : uvLevel >= 3 ? 0.5 : 0,
    });

    // 점수 높은 순 2개 뽑기
    candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
    const pick2 = candidates.slice(0, 2);

    // --- DOM 반영 (네가 준 id 기준) ---
    const h1Icon = document.getElementById("health1Icon");
    const h1Title = document.getElementById("health1Title");
    const h1Desc = document.getElementById("health1Desc");

    const h2Icon = document.getElementById("health2Icon");
    const h2Title = document.getElementById("health2Title");
    const h2Desc = document.getElementById("health2Desc");

    if (pick2[0] && h1Icon && h1Title && h1Desc) {
      h1Icon.src = pick2[0].icon;
      h1Title.textContent = pick2[0].title;
      h1Desc.textContent = pick2[0].desc;
    }
    if (pick2[1] && h2Icon && h2Title && h2Desc) {
      h2Icon.src = pick2[1].icon;
      h2Title.textContent = pick2[1].title;
      h2Desc.textContent = pick2[1].desc;
    }

    // --- 내일 미리보기 ---
    const tmin = round0(tom.min);
    const tmax = round0(tom.max);
    const tpop = round0(tom.precip_prob);

    const elRange = document.getElementById("styleTomRange");
    const elPop = document.getElementById("styleTomPop");
    const elTip = document.getElementById("styleTomTip");

    if (elRange) elRange.textContent = `${tmin ?? "-"}° / ${tmax ?? "-"}°`;
    if (elPop) elPop.textContent = `강수확률 ${tpop ?? "--"}%`;
    if (elTip) elTip.textContent = makeTomorrowTip({ tmin, tmax, tpop });

    // (디버그용) 값이 이상하면 이 로그 확인
    // console.log("STYLE dashboard:", data);
  } catch (e) {
    console.error("style dashboard error:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadStyleDashboard();
});
