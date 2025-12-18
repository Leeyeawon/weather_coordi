document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pick");
  if (!btn) return;

  const row = btn.closest(".clean-row");
  if (!row) return;

  // 같은 row 안에서만 토글 (버릴/기부 중 1개만)
  row.querySelectorAll(".pick").forEach((b) => b.classList.remove("is-on"));
  btn.classList.add("is-on");
});
