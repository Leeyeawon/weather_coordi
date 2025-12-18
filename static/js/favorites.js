document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".favorites-wrap");
  const empty = document.getElementById("emptyState");

  function updateEmpty() {
    const cards = wrap.querySelectorAll(".fav-card");
    if (empty) empty.hidden = cards.length !== 0;
  }

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".star-btn");
    if (!btn) return;

    const card = btn.closest(".fav-card");
    if (!card) return;

    // ✅ 즐겨찾기 해제: 카드 제거(나중에 DB/LocalStorage로 교체 가능)
    card.remove();
    updateEmpty();
  });

  updateEmpty();
});
