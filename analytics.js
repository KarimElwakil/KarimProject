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
   CLEAN ADVANCED SESSION SYSTEM
================================= */

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString() + " - " + d.toLocaleTimeString();
}

function detectBrowser() {
  const ua = navigator.userAgent;

  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";

  return "Unknown Browser";
}

function getThemeMode() {
  return document.documentElement.dataset.theme || "light";
}

/* ========= SESSION START ========= */

const sessionStartTimestamp = Date.now();

const sessionKey = deviceRef.child("sessions").push().key;
const sessionRef = deviceRef.child("sessions/" + sessionKey);

sessionRef.set({
  device: detectDevice(),
  browser: detectBrowser(),
  theme: getThemeMode(),
  startTime: formatDateTime(sessionStartTimestamp),
  startTimestamp: sessionStartTimestamp
});

/* ========= PAGE TRACKING INSIDE SESSION ========= */

const cleanPageName = window.location.pathname
  .split("/")
  .pop()
  .replace(".html","") || "home";

const pageEnterTimestamp = Date.now();

const pageSessionRef = sessionRef
  .child("pages")
  .child(cleanPageName);

pageSessionRef.set({
  enteredAt: formatDateTime(pageEnterTimestamp),
  enterTimestamp: pageEnterTimestamp,
  maxScroll: 0
});

/* ========= SCROLL TRACKING ========= */

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

/* ========= SESSION END ========= */

window.addEventListener("beforeunload", function () {

  const endTimestamp = Date.now();

  const sessionDuration =
    Math.floor((endTimestamp - sessionStartTimestamp) / 1000);

  const pageDuration =
    Math.floor((endTimestamp - pageEnterTimestamp) / 1000);

  sessionRef.update({
    endTime: formatDateTime(endTimestamp),
    durationSeconds: sessionDuration
  });

  pageSessionRef.update({
    exitedAt: formatDateTime(endTimestamp),
    exitTimestamp: endTimestamp,
    durationOnPageSec: pageDuration,
    maxScroll: maxScroll
  });

});
