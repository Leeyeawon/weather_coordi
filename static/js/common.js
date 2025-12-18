const backBtn = document.querySelector(".back-con");

if (backBtn) {
  backBtn.addEventListener("click", () => {
    history.back();
  });
}
