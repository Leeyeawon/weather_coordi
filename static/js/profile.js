// 편집 토글 + 칩 추가/삭제 (간단 버전)
const btnEdit = document.getElementById("btnEditAvoid");
const chipsWrap = document.getElementById("avoidChips");
const addRow = document.getElementById("avoidAddRow");
const input = document.getElementById("avoidInput");
const btnAdd = document.getElementById("btnAddAvoid");

function isEditMode() {
  return document.body.classList.contains("is-edit");
}

btnEdit?.addEventListener("click", () => {
  document.body.classList.toggle("is-edit");
  btnEdit.textContent = isEditMode() ? "완료" : "편집";
});

chipsWrap?.addEventListener("click", (e) => {
  if (!isEditMode()) return;

  const chip = e.target.closest(".chip");
  if (!chip) return;

  // x 누를 때만 삭제되게
  if (e.target.classList.contains("x")) {
    chip.remove();
  }
});

btnAdd?.addEventListener("click", () => {
  if (!isEditMode()) return;

  const v = (input.value || "").trim();
  if (!v) return;

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.dataset.chip = v;
  chip.innerHTML = `${v} <span class="x" aria-hidden="true">✕</span>`;
  chipsWrap.appendChild(chip);

  input.value = "";
  input.focus();
});

// 엔터로 추가
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnAdd.click();
});
