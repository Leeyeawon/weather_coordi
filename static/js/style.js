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
