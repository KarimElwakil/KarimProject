const ONE_HOUR = 60*60*1000;
const currentPage = location.pathname;

/* سجل الصفحة فورًا */
localStorage.setItem("lastPage", currentPage);
localStorage.setItem("lastVisitTime", Date.now());

/* رجوع scroll */
window.addEventListener("DOMContentLoaded", ()=>{
  const saved = localStorage.getItem("scroll_"+currentPage);
  if(saved){
    setTimeout(()=>window.scrollTo(0, parseInt(saved)),100);
  }
});

/* حفظ scroll */
window.addEventListener("scroll", ()=>{
  localStorage.setItem("scroll_"+currentPage, window.scrollY);
});

/* 🔥 اهم جزء: لما تفتح index */
if(currentPage.includes("index")){
  const lastPage = localStorage.getItem("lastPage");
  const lastTime = localStorage.getItem("lastVisitTime");

  if(lastPage && lastTime){
    const diff = Date.now() - parseInt(lastTime);

    if(diff < ONE_HOUR && !lastPage.includes("index")){
      location.href = lastPage;
    }

    if(diff > ONE_HOUR){
      localStorage.clear();
    }
  }
}