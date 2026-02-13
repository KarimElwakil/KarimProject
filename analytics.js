<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<script>
const firebaseConfig = {
  apiKey: "AIzaSyCs6OJNRdad5jwpaWOmEzs-Z_71QJcA-4M",
  authDomain: "searchanalytics-4bbbf.firebaseapp.com",
  databaseURL: "https://searchanalytics-4bbbf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "searchanalytics-4bbbf",
  storageBucket: "searchanalytics-4bbbf.firebasestorage.app",
  messagingSenderId: "555407096660",
  appId: "1:555407096660:web:3a3865df93d90d4147e6c1"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* =========================
   UTIL FUNCTIONS
========================= */

function getFormattedDateTime() {
  const now = new Date();
  return now.getFullYear() + "-" +
         String(now.getMonth()+1).padStart(2,'0') + "-" +
         String(now.getDate()).padStart(2,'0') + " " +
         String(now.getHours()).padStart(2,'0') + ":" +
         String(now.getMinutes()).padStart(2,'0') + ":" +
         String(now.getSeconds()).padStart(2,'0');
}

function getTodayKey() {
  const now = new Date();
  return now.getFullYear() + "-" +
         String(now.getMonth()+1).padStart(2,'0') + "-" +
         String(now.getDate()).padStart(2,'0');
}

function getDeviceName() {
  const ua = navigator.userAgent;

  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Macintosh/i.test(ua)) return "Mac";
  return "Unknown Device";
}

/* =========================
   DEVICE IDENTIFICATION
========================= */

let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = "device_" + Math.random().toString(36).substring(2,10);
  localStorage.setItem("deviceId", deviceId);
}

const deviceRef = db.ref("analytics/devices/" + deviceId);

deviceRef.child("deviceName").set(getDeviceName());
deviceRef.child("firstSeen").set(getFormattedDateTime());

/* =========================
   SESSION START
========================= */

const todayKey = getTodayKey();
const sessionId = "session_" + Math.random().toString(36).substring(2,10);
const sessionRef = deviceRef.child("sessions/" + todayKey + "/" + sessionId);

const sessionStartTime = new Date();

sessionRef.child("enterTime").set(getFormattedDateTime());

/* =========================
   PAGE TRACKING
========================= */

let currentPage = window.location.pathname.replace(/\//g,'').replace('.html','') || "home";
const pageRef = sessionRef.child("pages/" + currentPage);

pageRef.child("enter").set(getFormattedDateTime());

/* =========================
   PAGE VIEWS COUNTER
========================= */

const overviewRef = db.ref("analytics/overview/pageViews");
overviewRef.transaction(current => (current || 0) + 1);

const totalRef = db.ref("analytics/overview/totalVisits");
totalRef.transaction(current => (current || 0) + 1);

/* =========================
   SESSION END
========================= */

window.addEventListener("beforeunload", () => {

  const exitTime = new Date();
  const duration = Math.floor((exitTime - sessionStartTime) / 1000);

  sessionRef.child("exitTime").set(getFormattedDateTime());
  sessionRef.child("durationSeconds").set(duration);

  pageRef.child("leave").set(getFormattedDateTime());
});
</script>
