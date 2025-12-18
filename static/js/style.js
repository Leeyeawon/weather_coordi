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

ITEM = {
  1: {
    url: "./static/img/style1.png",
    name: "크림 니트",
    detail:
      "오늘 같은 쌀쌀한 날씨에 딱 맞는 따뜻하고 부드러운 니트예요. 심플한 디자인으로 다양한 코디에 활용하기 좋아요.",
  },
  2: {
    url: "./static/img/style2.png",
    name: "숏 패딩",
    detail:
      "바람이 부는 날엔 보온이 중요해요. 가벼운 숏패딩으로 활동성도 챙겨보세요.",
  },
  3: {
    url: "./static/img/style3.png",
    name: "후드 집업",
    detail:
      "간절기/실내외 온도차가 있을 때 툭 걸치기 좋아요. 레이어드에도 잘 어울려요.",
  },
};

const addCount = () => {
  if (count === 3) {
    count = 1;
    return;
  }
  count += 1;
};

const changeStyleInfo = () => {
  itemImage.src = ITEM[count].url;
  itemImage.alt = `style${count}`;
  itemName.textContent = ITEM[count].name;
  itemDetail.textContent = ITEM[count].detail;

  countEl.textContent = `${count}/3`;
};

btnDiffItem.addEventListener("click", () => {
  // 1. 페이드 아웃
  itemContainer.classList.add("fade-out");

  // 2. 애니메이션 시간 후 내용 변경
  setTimeout(() => {
    addCount();
    changeStyleInfo();

    // 3. 페이드 인
    itemContainer.classList.remove("fade-out");
  }, 200); // css쪽 transition 시간이랑 맞추기 0.3s => 300
});

btnFavorite.addEventListener("click", () => {
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

function el(tag, cls) {
  const x = document.createElement(tag);
  if (cls) x.className = cls;
  return x;
}

function gradeBad(grade) {
  return grade === "나쁨" || grade === "매우나쁨";
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildHealthCards(data) {
  const cur = data.current || {};
  const air = data.air || {};

  const wx = cur.weather_text || "";
  const pop = toNum(cur.precip_prob, 0);
  const uv = toNum(cur.uv, 0);

  const pm10Bad = gradeBad(air.pm10_grade);
  const pm25Bad = gradeBad(air.pm25_grade);
  const dustBad = pm10Bad || pm25Bad;

  const cards = [];

  // 1) 미세먼지 → 마스크
  if (dustBad) {
    cards.push({
      img: "./static/img/mask.png",
      alt: "mask",
      title: "마스크 착용 권장",
      desc: `미세먼지(${air.pm10_grade || "-"})/초미세먼지(${air.pm25_grade || "-"})가 좋지 않아요. KF 마스크를 챙겨보세요.`,
    });
  } else {
    cards.push({
      img: "./static/img/mask.png",
      alt: "mask",
      title: "마스크(선택)",
      desc: `미세먼지(${air.pm10_grade || "-"})/초미세먼지(${air.pm25_grade || "-"})는 무난한 편이에요. 필요할 때만 챙겨도 좋아요.`,
    });
  }

  // 2) 자외선 → 양산/모자/선크림
  if (uv >= 6) {
    cards.push({
      img: "./static/img/uv-protect.png",
      alt: "uv",
      title: "자외선 차단",
      desc: `오늘 UV 지수는 ${Math.round(uv)}로 높은 편이에요. 선크림 + 모자/양산을 추천해요.`,
    });
  } else if (uv >= 3) {
    cards.push({
      img: "./static/img/uv-protect.png",
      alt: "uv",
      title: "자외선 차단",
      desc: `오늘 UV 지수는 ${Math.round(uv)}예요. 외출 시간이 길면 선크림을 추천해요.`,
    });
  } else {
    cards.push({
      img: "./static/img/uv-protect.png",
      alt: "uv",
      title: "자외선 차단",
      desc: `오늘 UV 지수는 ${Math.round(uv)}로 낮은 편이에요. 그래도 기본 선크림은 추천해요.`,
    });
  }

  // 3) 강수/날씨 → 우산/우비/레인부츠 (조건부로 3번째 카드로 추가)
  const rainy = pop >= 50 || wx.includes("비") || wx.includes("소나기") || wx.includes("뇌우");
  if (rainy) {
    // ✅ 너 프로젝트에 rain 관련 이미지가 없다면, 일단 umbrella.png를 추가하거나 임시로 mask/uv 중 하나로 대체해야 해.
    // 여기선 umbrella.png가 있다고 가정할게 (없으면 아래 "이미지 파일" 섹션 참고)
    cards.push({
      img: "./static/img/umbrella.png",
      alt: "umbrella",
      title: "우산 챙기기",
      desc: `강수확률이 ${Math.round(pop)}%예요. 우산(또는 우비/레인부츠)을 챙겨두면 좋아요.`,
    });
  }

  // 카드 최대 3개까지만 (원하면 늘릴 수 있음)
  return cards.slice(0, 3);
}

function renderHealthCards(cards) {
  const list = document.getElementById("healthList");
  if (!list) return;

  // 기존 내용 비우기
  list.innerHTML = "";

  cards.forEach((c, i) => {
    const wrapCls = i === 0 ? "health1-con" : (i === 1 ? "health2-con" : "health3-con");
    const imgCls  = i === 0 ? "health1-img-con" : (i === 1 ? "health2-img-con" : "health3-img-con");
    const infoCls = i === 0 ? "health1-info-con" : (i === 1 ? "health2-info-con" : "health3-info-con");

    const wrap = el("div", wrapCls);

    const imgCon = el("div", imgCls);
    const img = el("img");
    img.src = c.img;
    img.alt = c.alt;
    imgCon.appendChild(img);

    const infoCon = el("div", infoCls);
    const p1 = el("p");
    p1.textContent = c.title;
    const p2 = el("p");
    p2.textContent = c.desc;
    infoCon.appendChild(p1);
    infoCon.appendChild(p2);

    wrap.appendChild(imgCon);
    wrap.appendChild(infoCon);
    list.appendChild(wrap);
  });
}

async function loadHealthRecommend() {
  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const cards = buildHealthCards(data);
    renderHealthCards(cards);
  } catch (e) {
    console.error("health recommend error:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHealthRecommend();
});
