console.log("Analytics system starting...");

document.addEventListener("DOMContentLoaded", function () {

  if (typeof firebase === "undefined") {
    console.error("Firebase not loaded");
    return;
  }

  const db = firebase.database();

  /* ==============================
     Helpers
  ============================== */

  function formatDateTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + " - " + d.toLocaleTimeString();
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "Unknown Device";
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    return "Unknown Browser";
  }

  /* ==============================
     Device ID
  ============================== */

  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = "device_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("deviceId", deviceId);
  }

  const deviceRef = db.ref("analytics/devices/" + deviceId);

  /* ==============================
     SESSION
  ============================== */

  const sessionStart = Date.now();
  const sessionRef = deviceRef.child("sessions").push();

  sessionRef.set({
  device: detectDevice(),
  browser: detectBrowser(),
  theme: document.documentElement.dataset.theme || "light",
  startTime: formatDateTime(sessionStart),
  startTimestamp: sessionStart
});

  console.log("Current theme:", document.documentElement.dataset.theme);


  // تحديث الثيم كل 3 ثواني
setInterval(function () {

  sessionRef.update({
    theme: document.documentElement.dataset.theme || "light"
  });

}, 3000);


  // تحديث الثيم لو اتغير
const observer = new MutationObserver(function () {

  sessionRef.update({
    theme: document.documentElement.dataset.theme || "light"
  });

});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"]
});


  /* ==============================
     PAGE
  ============================== */

  function getPageName() {

  let path = window.location.pathname;

  if (!path || path === "/") return "home";

  path = path.split("/").pop();

  if (!path) return "home";

  return path.replace(".html","");

}

const pageName = getPageName();


  const pageStart = Date.now();

  const pageRef = sessionRef.child("pages").child(pageName);

  pageRef.set({
    enteredAt: formatDateTime(pageStart),
    enterTimestamp: pageStart,
    maxScroll: 0
  });

  /* ==============================
     SCROLL
  ============================== */

  /* ========= SCROLL TRACKING FIXED ========= */

let maxScroll = 0;

function updateScroll() {

  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop;

  const docHeight =
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;

  if (docHeight <= 0) {
    maxScroll = 100;
    return;
  }

  const percent = Math.round((scrollTop / docHeight) * 100);

  if (percent > maxScroll) {
    maxScroll = percent;
  }

}

window.addEventListener("scroll", updateScroll);

// تأكد إنه يتحسب أول ما الصفحة تفتح
updateScroll();


  // تحديث القيمة في فايربيز كل 3 ثواني
setInterval(function () {
  pageRef.update({
    maxScroll: maxScroll
  });
}, 1000);



  /* ==============================
     EXIT
  ============================== */

 function saveTimeSpent() {

  const endTime = Date.now();

  const duration =
    Math.floor((endTime - pageStart) / 1000);

  pageRef.update({
    durationOnPageSec: duration
  });

}

  // عند الخروج
window.addEventListener("beforeunload", saveTimeSpent);

// عند الانتقال لتبويب تاني
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") {
    saveTimeSpent();
  }
});


    document.addEventListener("visibilitychange", function () {

  if (document.visibilityState === "hidden") {

    const endTime = Date.now();

    pageRef.update({
      durationOnPageSec:
        Math.floor((endTime - pageStart) / 1000)
    });

  }

});


    pageRef.update({
      exitedAt: formatDateTime(endTime),
      durationOnPageSec:
        Math.floor((endTime - pageStart) / 1000),
      maxScroll: maxScroll
    });

  });

  /* ==============================
     Global Counters
  ============================== */

  db.ref("analytics/overview/pageViews")
    .transaction(v => (v || 0) + 1);

  db.ref("analytics/overview/totalVisits")
    .transaction(v => (v || 0) + 1);

});





