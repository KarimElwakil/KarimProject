

const ONE_HOUR = 60 * 60 * 1000;
const currentPage = location.pathname;
const now = Date.now();



const lastTime = localStorage.getItem("lastVisitTime");

if (lastTime) {
  const diff = now - parseInt(lastTime);

  if (diff > ONE_HOUR) {
    localStorage.clear(); // مسح كل حاجة
  }
}


if (!currentPage.includes("index")) {
  localStorage.setItem("lastPage", currentPage);
  localStorage.setItem("lastVisitTime", now);
}



window.addEventListener("scroll", () => {
  localStorage.setItem("scroll_" + currentPage, window.scrollY);
});



window.addEventListener("DOMContentLoaded", () => {

  const lastTime = localStorage.getItem("lastVisitTime");
  if (!lastTime) return;

  const diff = Date.now() - parseInt(lastTime);

 
  if (diff > ONE_HOUR) return;

  const savedScroll = localStorage.getItem("scroll_" + currentPage);
  if (!savedScroll) return;

  setTimeout(() => {
    window.scrollTo(0, parseInt(savedScroll));
  }, 120);

});

