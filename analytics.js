console.log("Analytics system starting...");

document.addEventListener("DOMContentLoaded", function () {

  if (typeof firebase === "undefined") {
    console.error("Firebase not loaded");
    return;
  }

  const db = firebase.database();

  /* ==============================
     Helper Functions
  ============================== */

  function getDateTime() {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, '0') + "-" +
      String(now.getDate()).padStart(2, '0') + " " +
      String(now.getHours()).padStart(2, '0') + ":" +
      String(now.getMinutes()).padStart(2, '0') + ":" +
      String(now.getSeconds()).padStart(2, '0');
  }

  function getTodayKey() {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, '0') + "-" +
      String(now.getDate()).padStart(2, '0');
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

  /* ==============================
     Device ID
  ============================== */

  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = "device_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("deviceId", deviceId);
  }

  const deviceRef = db.ref("analytics/devices/" + deviceId);

  /* ===============================
   ADVANCED SESSION SYSTEM
================================= */

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString() + " - " + d.toLocaleTimeString();
}

function detectBrowser() {
  const ua = navigator.userAgent;

  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";

  return "Unknown Browser";
}

function getThemeMode() {
  return document.documentElement.dataset.theme || "light";
}

const sessionKey = deviceRef.child("sessions").push().key;
const sessionRef = deviceRef.child("sessions/" + sessionKey);

const sessionStartTimestamp = Date.now();

sessionRef.set({
  device: detectDevice(),
  browser: detectBrowser(),
  theme: getThemeMode(),
  startTime: formatDateTime(sessionStartTimestamp),
  startTimestamp: sessionStartTimestamp,
  pages: {},
  maxScroll: 0
});


  deviceRef.child("deviceName").set(detectDevice());
  deviceRef.child("lastSeen").set(getDateTime());

  

  /* ==============================
     Page Tracking
  ============================== */

 function getCleanPageName() {
  let path = window.location.pathname;

  // لو الصفحة الرئيسية
  if (path === "/" || path === "") {
    return "home";
  }

  // شيل أول /
  path = path.substring(1);

  // شيل .html
  path = path.replace(".html", "");

  // شيل اسم الفولدر لو موجود
  if (path.includes("/")) {
    path = path.split("/").pop();
  }

  return path;
}

const pageName = getCleanPageName();

  /* ===============================
   PAGE INSIDE SESSION
================================= */

const pageEnterTime = Date.now();
const pageSessionRef = sessionRef.child("pages").child(pageName);

pageSessionRef.set({
  enteredAt: formatDateTime(pageEnterTime),
  enterTimestamp: pageEnterTime,
  maxScroll: 0
});

  let maxScroll = 0;

window.addEventListener("scroll", function () {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return;

  const percent = Math.round((scrollTop / docHeight) * 100);

  if (percent > maxScroll) {
    maxScroll = percent;
  }
});


 const pageRef = db.ref("analytics/pages/" + pageName + "/views");
pageRef.transaction(current => (current || 0) + 1);


  /* ==============================
     Global Counters
  ============================== */

  db.ref("analytics/overview/pageViews")
    .transaction(v => (v || 0) + 1);

  db.ref("analytics/overview/totalVisits")
    .transaction(v => (v || 0) + 1);

 /* ===============================
   SESSION END (Advanced)
================================= */

window.addEventListener("beforeunload", function () {

  const endTimestamp = Date.now();
  const durationSec = Math.floor((endTimestamp - sessionStartTimestamp) / 1000);

  sessionRef.update({
    endTime: formatDateTime(endTimestamp),
    endTimestamp: endTimestamp,
    durationSeconds: durationSec,
    maxScroll: maxScroll
  });

  pageSessionRef.update({
    exitedAt: formatDateTime(endTimestamp),
    exitTimestamp: endTimestamp,
    durationOnPageSec: Math.floor((endTimestamp - pageEnterTime) / 1000),
    maxScroll: maxScroll
  });

});



