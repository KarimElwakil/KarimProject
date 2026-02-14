console.log("Analytics system starting...");

console.log("Firebase working test");

firebase.database().ref("test")
  .set({ time: Date.now() })
  .then(() => console.log("WRITE OK"))
  .catch(err => console.error("WRITE ERROR", err));

document.addEventListener("DOMContentLoaded", function () {

  if (typeof firebase === "undefined") {
    console.error("Firebase not loaded");
    return;
  }

  const db = firebase.database();

  // ======== DRAW TOP CARDS ========

document.getElementById('statsRow1').innerHTML =
[
  createStatCard("إجمالي الزيارات", '<span id="totalVisits">0</span>', svgIcons.eye, "", "", 50),
  createStatCard("الزوار الفريدين", '<span id="uniqueVisitors">0</span>', svgIcons.users, "", "", 100),
  createStatCard("معدل الارتداد", '<span id="bounceRate">0%</span>', svgIcons.bounce, "", "", 150),
  createStatCard("متوسط مدة الجلسة", '<span id="avgSession">0 ث</span>', svgIcons.clock, "", "", 200)
].join('');

document.getElementById('statsRow2').innerHTML =
[
  createStatCard("مشاهدات الصفحات", '<span id="pageViews">0</span>', svgIcons.page, "", "", 250),
  createStatCard("صفحات/جلسة", '<span id="pagesPerSession">0</span>', svgIcons.layers, "", "", 300),
  createStatCard("زوار جدد", '<span id="newVisitors">0</span>', svgIcons.userPlus, "", "", 350),
  createStatCard("زوار عائدين", '<span id="returningVisitors">0</span>', svgIcons.refresh, "", "", 400)
].join('');


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

  function detectOS() {
  const ua = navigator.userAgent;

  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";

  return "Unknown";
}


  function getDeviceFingerprint() {

  return (
    navigator.userAgent +
    navigator.language +
    screen.width +
    screen.height +
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

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
  let sessionId = sessionStorage.getItem("sessionId");

if (!sessionId) {
  sessionId = deviceRef.child("sessions").push().key;
  sessionStorage.setItem("sessionId", sessionId);
}

const sessionRef = deviceRef.child("sessions").child(sessionId);




  

  const baseSessionData = {
 device: detectDevice(),
deviceLabel:
  detectDevice() +
  " | " +
  screen.width + "x" + screen.height +
  " | " +
  deviceId.slice(-4),
  browser: detectBrowser(),
  os: detectOS(),
  startTime: formatDateTime(sessionStart),
  startTimestamp: sessionStart,
  isOnline: true
};

fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(loc => {

    baseSessionData.country = loc.country_name || "Unknown";
    baseSessionData.city = loc.city || "";

    sessionRef.set(baseSessionData);

  })
  .catch(() => {

    baseSessionData.country = "Unknown";

    sessionRef.set(baseSessionData);

  });


sessionRef.child("isOnline").onDisconnect().set(false);

/* ==============================
   DEVICE GLOBAL STATS
============================== */

const deviceStatsRef = deviceRef.child("stats");

deviceStatsRef.child("totalSessions")
  .transaction(v => (v || 0) + 1);

  db.ref("analytics/overview/uniqueVisitors")
  .transaction(v => (v || 0) + 1);

sessionRef.update({
  lastActive: Date.now()
});

setInterval(() => {
  sessionRef.update({
    lastActive: Date.now()
  });
}, 10000);


  
  if (navigator.connection) {

  sessionRef.update({
    networkType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink + "Mb/s"
  });

}

  sessionRef.update({
  screenResolution: window.screen.width + "x" + window.screen.height
});
sessionRef.update({
  language: "ar"
});

sessionRef.update({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});
sessionRef.update({
  isTouchDevice: ('ontouchstart' in window)
});


  // تحديث الثيم كل 3 ثواني
setInterval(function () {

  sessionRef.update({
    theme: document.documentElement.dataset.theme || "light"
  });

}, 500);


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

  path = path.split("/").pop() || "home";

  // حذف أي حروف غير مسموح بيها
  path = path.replace(/\.html$/, "");
  path = path.replace(/[.#$\[\]]/g, "");
  path = path.replace(/\//g, "_");

  return path || "home";
}


const pageName = getPageName();

  /* ==============================
   GLOBAL PAGE COUNTER
============================== */

const globalPageRef = db
  .ref("analytics/pages/" + pageName + "/views");

globalPageRef.transaction(v => (v || 0) + 1);


/* ==============================
   DEVICE PAGE COUNTER
============================== */

const devicePageRef = deviceRef
  .child("pageStats")
  .child(pageName)
  .child("visits");

  /* ==============================
   DEVICE PAGE LAST VISIT
============================== */

const devicePageBaseRef = deviceRef
  .child("pageStats")
  .child(pageName);

/* ==============================
   DEVICE PAGE STATS (ADVANCED)
============================== */

// عداد الزيارات
devicePageRef.child("visits")
  .transaction(v => (v || 0) + 1);

// أول زيارة (تتحط مرة واحدة بس)
devicePageRef.child("firstVisited")
  .transaction(v => v || formatDateTime(Date.now()));

devicePageRef.child("firstVisitTimestamp")
  .transaction(v => v || Date.now());

// آخر زيارة
devicePageRef.update({
  lastVisited: formatDateTime(Date.now()),
  lastVisitTimestamp: Date.now()
});






  /* ==============================
   PAGE TRANSITION TRACKING
============================== */

const previousPage = localStorage.getItem("lastPage");

if (previousPage && previousPage !== pageName) {

  const transitionRef = sessionRef.child("transitions").push();

  transitionRef.set({
    from: previousPage,
    to: pageName,
    at: formatDateTime(Date.now())
  });

}

// حفظ الصفحة الحالية للانتقال القادم
localStorage.setItem("lastPage", pageName);



  const pageStart = Date.now();

  const pageRef = sessionRef.child("pages").child(pageName);

  pageRef.update({
  referrer: document.referrer || "Direct"
});

  // تحديث الثيم للصفحة كل 3 ثواني
setInterval(function () {

  pageRef.update({
    theme: document.documentElement.dataset.theme || "light"
  });

}, 3000);


 pageRef.update({
  enteredAt: formatDateTime(pageStart),
  enterTimestamp: pageStart,
  maxScroll: 0
});

  setTimeout(function () {
  pageRef.update({
    theme: document.documentElement.dataset.theme || "light"
  });
}, 500);


  /* ==============================
     SCROLL
  ============================== */

  /* ========= SCROLL TRACKING FIXED ========= */

let maxScroll = 0;
  let lastScrollTime = Date.now();
let scrollSpeedSum = 0;
let scrollCount = 0;

window.addEventListener("scroll", function () {

  const now = Date.now();
  const diff = now - lastScrollTime;

  if (diff > 0) {
    scrollSpeedSum += diff;
    scrollCount++;
  }

  lastScrollTime = now;
});


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
function savePageExit() {

  db.ref("analytics/overview/totalSessionTime")
  .transaction(v => (v || 0) + durationSec);

db.ref("analytics/overview/totalSessions")
  .transaction(v => (v || 0) + 1);


  const avgScrollSpeed =
  scrollCount > 0 ? (scrollSpeedSum / scrollCount).toFixed(0) : 0;

pageRef.update({
  avgScrollIntervalMs: avgScrollSpeed
});

  const sessionDurationSec =
  Math.floor((Date.now() - sessionStart) / 1000);

  /* ==============================
   TOTAL TIME ON PAGE (DEVICE)
============================== */

  const endTime = Date.now();
const durationSec =
  Math.floor((endTime - pageStart) / 1000);

devicePageRef.child("totalTimeOnPageSec")
  .transaction(v => (v || 0) + durationSec);




deviceStatsRef.child("totalTimeSpent")
  .transaction(v => (v || 0) + sessionDurationSec);

  

 

  pageRef.update({
    exitedAt: formatDateTime(endTime),
    exitTimestamp: endTime,
    durationMinutes: (durationSec / 60).toFixed(2)
  });

}

// لما تسيب الصفحة أو تنتقل
document.addEventListener("visibilitychange", function () {

  if (document.visibilityState === "hidden") {

    const endTime = Date.now();
    const durationSec =
      Math.floor((endTime - pageStart) / 1000);

    pageRef.update({
      exitedAt: formatDateTime(endTime),
      exitTimestamp: endTime,
      durationMinutes: (durationSec / 60).toFixed(2),
      maxScroll: maxScroll,
      theme: document.documentElement.dataset.theme || "light"
    });

  }

});
    
  
  /* ==============================
     Global Counters
  ============================== */

  // Global Counters
db.ref("analytics/overview/pageViews")
  .transaction(v => (v || 0) + 1);

db.ref("analytics/overview/totalVisits")
  .transaction(v => (v || 0) + 1);




}); // ← دي نهاية DOMContentLoaded





























