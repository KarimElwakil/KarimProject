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

  deviceRef.child("deviceName").set(detectDevice());
  deviceRef.child("lastSeen").set(getDateTime());

  /* ==============================
     Session Start
  ============================== */

  const today = getTodayKey();
  const sessionId = "session_" + Date.now();

  const sessionRef = deviceRef.child("sessions/" + today + "/" + sessionId);

  const sessionStart = new Date();

  sessionRef.child("startTime").set(getDateTime());

  /* ==============================
     Page Tracking
  ============================== */

  let pageName = window.location.pathname
    .replace(/\//g, '')
    .replace('.html', '') || "home";

  const pageRef = sessionRef.child("pages/" + pageName);

  pageRef.child("enterTime").set(getDateTime());

  /* ==============================
     Global Counters
  ============================== */

  db.ref("analytics/overview/pageViews")
    .transaction(v => (v || 0) + 1);

  db.ref("analytics/overview/totalVisits")
    .transaction(v => (v || 0) + 1);

  /* ==============================
     Session End
  ============================== */

  window.addEventListener("beforeunload", function () {

    const exitTime = new Date();
    const duration = Math.floor((exitTime - sessionStart) / 1000);

    sessionRef.child("endTime").set(getDateTime());
    sessionRef.child("durationSeconds").set(duration);

    pageRef.child("leaveTime").set(getDateTime());
  });

  console.log("Analytics tracking active");

});
