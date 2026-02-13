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
    startTime: formatDateTime(sessionStart),
    startTimestamp: sessionStart
  });

  /* ==============================
     PAGE
  ============================== */

  const pageName = window.location.pathname
    .split("/")
    .pop()
    .replace(".html","") || "home";

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

  let maxScroll = 0;

  window.addEventListener("scroll", function () {

    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const percent =
      Math.round((scrollTop / docHeight) * 100);

    if (percent > maxScroll) {
      maxScroll = percent;
    }

  });

  /* ==============================
     EXIT
  ============================== */

  window.addEventListener("beforeunload", function () {

    const endTime = Date.now();

    sessionRef.update({
      endTime: formatDateTime(endTime),
      durationSeconds:
        Math.floor((endTime - sessionStart) / 1000)
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
