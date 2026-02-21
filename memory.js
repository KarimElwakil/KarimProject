/* =========================
   GLOBAL MEMORY SYSTEM FINAL
========================= */

const ONE_HOUR = 60 * 60 * 1000;
const currentPage = location.pathname;
const now = Date.now();

/* =========================
   1️⃣ لو عدى ساعة → reset كامل
========================= */

const lastTime = localStorage.getItem("lastVisitTime");

if (lastTime) {
  const diff = now - parseInt(lastTime);

  if (diff > ONE_HOUR) {
    localStorage.clear(); // مسح كل حاجة
  }
}

/* =========================
   2️⃣ تسجيل آخر صفحة (ماعدا index)
========================= */

if (!currentPage.includes("index")) {
  localStorage.setItem("lastPage", currentPage);
  localStorage.setItem("lastVisitTime", now);
}

/* =========================
   3️⃣ حفظ scroll لكل صفحة
========================= */

window.addEventListener("scroll", () => {
  localStorage.setItem("scroll_" + currentPage, window.scrollY);
});

/* =========================
   4️⃣ استرجاع scroll عند الدخول
========================= */

window.addEventListener("DOMContentLoaded", () => {

  const lastTime = localStorage.getItem("lastVisitTime");
  if (!lastTime) return;

  const diff = Date.now() - parseInt(lastTime);

  // لو عدى ساعة → ابدأ من الأول
  if (diff > ONE_HOUR) return;

  const savedScroll = localStorage.getItem("scroll_" + currentPage);
  if (!savedScroll) return;

  setTimeout(() => {
    window.scrollTo(0, parseInt(savedScroll));
  }, 120);

});
