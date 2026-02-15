console.log("Analytics system starting...");

console.log("Firebase working test");

// ===== UI HELPERS =====

const svgIcons = {
  eye: "👁️",
  users: "👥",
  bounce: "📉",
  clock: "⏱️",
  page: "📄",
  layers: "📚",
  userPlus: "🆕",
  refresh: "🔄"
};

function createStatCard(title, value, icon, change, type, delay) {
  return `
  <div class="glass stat-card anim-up" style="animation-delay:${delay}ms">
    <div class="stat-header">
      <span class="stat-label">${title}</span>
      <div class="stat-icon">${icon}</div>
    </div>
    <div class="stat-value">${value}</div>
  </div>`;
}


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

  const sessionStart = Date.now();

/* ===============================
   DEVICE ID ثابت
=============================== */
/* ===============================
   DEVICE ID FINAL FIX
=============================== */
/* ===============================
   DEVICE ID FINAL (STABLE)
=============================== */

let deviceId = localStorage.getItem("deviceId");

if(!deviceId){

  const ua = navigator.userAgent.replace(/[.#$[\]]/g,"");
  const res = screen.width + "x" + screen.height;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fingerprint = btoa(ua + res + lang + tz).substring(0,40);

  deviceId = "dev_" + fingerprint;
  localStorage.setItem("deviceId", deviceId);
}

// ربطه في فايربيز
db.ref("deviceFingerprints/" + deviceId).set({
  ua: navigator.userAgent,
  res: screen.width+"x"+screen.height,
  lastSeen: Date.now()
});


/* ===============================
   SESSION SYSTEM PRO (15 MIN)
=============================== */

let sessionId = localStorage.getItem("sessionId");
let lastSeen = localStorage.getItem("lastSeen");
let lastPage = localStorage.getItem("lastPage");

// لو خرج اكتر من 15 دقيقة → جلسة جديدة
if (!sessionId || !lastSeen || (Date.now() - lastSeen > 900000)) {

  const now = new Date();
  const readable =
    now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+
    now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

  sessionId = "session_" + readable;

  localStorage.setItem("sessionId", sessionId);
  sessionStorage.removeItem("sessionRank");
sessionStorage.clear();

}

localStorage.setItem("lastSeen", Date.now());

const deviceRef = db.ref("analytics/devices/" + deviceId);
const sessionRef = deviceRef.child("sessions").child(sessionId);

// فتح الجلسة لو أول مرة
sessionRef.child("info").update({
  start: Date.now(),
  readableStart: new Date().toLocaleString(),
  device: navigator.userAgent
});

// تحديث اخر نشاط كل 10 ثواني
setInterval(()=>{
  localStorage.setItem("lastSeen", Date.now());
  sessionRef.child("info/lastActive").set(Date.now());
},10000);

// عند الخروج
window.addEventListener("beforeunload",()=>{
  localStorage.setItem("lastSeen", Date.now());
  sessionRef.child("info/isOnline").set(false);
});

sessionRef.child("info/isOnline").set(true);

/* ===============================
   THEME TRACKING PRO
=============================== */

// حفظ أول ثيم
let currentTheme = document.documentElement.getAttribute("data-theme") || "light";

sessionRef.child("info/theme").set(currentTheme);

// مراقبة التغيير الحقيقي فقط
const themeObserver = new MutationObserver(() => {

  const newTheme = document.documentElement.getAttribute("data-theme") || "light";

  if (newTheme !== currentTheme) {
    currentTheme = newTheme;

    sessionRef.child("info/theme").set(currentTheme);

    // كمان نسجل داخل الصفحة الحالية لو موجودة
    if (window.currentVisitRef) {
      window.currentVisitRef.child("themeChanges").push({
        theme: currentTheme,
        at: Date.now()
      });
    }
  }

});

themeObserver.observe(document.documentElement,{
  attributes:true,
  attributeFilter:["data-theme"]
});

 


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

let source = document.referrer
  ? new URL(document.referrer).hostname
  : "Direct";

// تنظيف الاسم من الحروف الممنوعة
source = source.replace(/\./g,"_")
               .replace(/#/g,"")
               .replace(/\$/g,"")
               .replace(/\[/g,"")
               .replace(/\]/g,"");

db.ref("analytics/sources/" + source + "/visits")
  .transaction(v => (v || 0) + 1);


fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(loc => {

    baseSessionData.country = loc.country_name || "Unknown";
    baseSessionData.city = loc.city || "";

    sessionRef.update(baseSessionData);



  })
  .catch(() => {

    baseSessionData.country = "Unknown";

    sessionRef.update(baseSessionData);


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




  


  /* ==============================
     PAGE
  ============================== */

/* ===============================
   PAGE VISITS SYSTEM FINAL
=============================== */

function getPageName(){
  let path = location.pathname;
  if(!path || path==="/") return "home";
  path = path.split("/").pop();
  return path.replace(".html","");
}

const pageName = getPageName();

/* ========= ترتيب الصفحات داخل الجلسة ========= */

let globalRank = sessionStorage.getItem("globalRank");
if(!globalRank) globalRank = 0;

globalRank = parseInt(globalRank) + 1;
sessionStorage.setItem("globalRank", globalRank);

/* ========= جاي منين ========= */

let fromPage = sessionStorage.getItem("lastPage");

if(!fromPage){
  fromPage = "direct";
}else if(fromPage === pageName){
  fromPage = "refresh";
}

sessionStorage.setItem("lastPage", pageName);

  // last seen للصفحة
sessionRef.child("pages").child(pageName).child("lastSeen").set({
  time: Date.now(),
  readable: new Date().toLocaleString()
});


  const pageVisitsRef = sessionRef
  .child("pages")
  .child(pageName)
  .child("visits");

// رقم الزيارة داخل الصفحة
let pageVisitCount = sessionStorage.getItem("visitCount_"+pageName);
if(!pageVisitCount) pageVisitCount = 0;

pageVisitCount = parseInt(pageVisitCount) + 1;
sessionStorage.setItem("visitCount_"+pageName, pageVisitCount);

// ترتيب داخل الجلسة
let sessionRank = sessionStorage.getItem("sessionRank");
if(!sessionRank) sessionRank = 0;

sessionRank = parseInt(sessionRank) + 1;
sessionStorage.setItem("sessionRank", sessionRank);

// جاي منين

if(!fromPage) fromPage = "direct";
else if(fromPage === pageName) fromPage = "refresh";

sessionStorage.setItem("lastPage", pageName);

// إنشاء زيارة جديدة مستقلة
const visitRef = pageVisitsRef.push();

  // نخليه متاح عالمياً
window.currentVisitRef = visitRef;
window.pageEnterTime = Date.now();


visitRef.set({
  visitNumber: pageVisitCount,
  rank: sessionRank,
  from: fromPage,
  enterTime: new Date().toLocaleString(),
  enterTimestamp: Date.now(),

  device: detectDevice(),
  browser: detectBrowser(),
  os: detectOS(),
  resolution: screen.width+"x"+screen.height,
  language: navigator.language,
  isOnline:true
});

  


  let maxScroll = 0;

window.addEventListener("scroll",()=>{
  const scrollTop = window.scrollY;
  const height = document.body.scrollHeight - window.innerHeight;
  const percent = Math.round((scrollTop/height)*100);

  if(percent>maxScroll){
    maxScroll = percent;
    visitRef.update({
      maxScroll:maxScroll
    });
  }
});


visitRef.child("isOnline").onDisconnect().set(false);



  

 




  /* ==============================
     EXIT
  ============================== */

 function saveTimeSpent() {

  const endTime = Date.now();

  const duration =
    Math.floor((endTime - pageStart) / 1000);

 

}

  // عند الخروج
function savePageExit() {

  db.ref("analytics/overview/totalSessionTime")
  .transaction(v => (v || 0) + durationSec);

db.ref("analytics/overview/totalSessions")
  .transaction(v => (v || 0) + 1);


  const avgScrollSpeed =
  scrollCount > 0 ? (scrollSpeedSum / scrollCount).toFixed(0) : 0;



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

  

 

  

}

// لما تسيب الصفحة أو تنتقل
document.addEventListener("visibilitychange", function () {

  if (document.visibilityState === "hidden") {

    const endTime = Date.now();
    const durationSec =
      Math.floor((endTime - pageStart) / 1000);

    

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

  /* ==============================
   GLOBAL OVERVIEW COUNTERS
============================== */

// زيارة
db.ref("analytics/overview/totalVisits")
.transaction(v => (v || 0) + 1);

// page view
db.ref("analytics/overview/pageViews")
.transaction(v => (v || 0) + 1);

// unique
db.ref("analytics/overview/uniqueVisitors/" + deviceId)
.set(true);


/* ===============================
   EXIT + DURATION لكل زيارة
=============================== */

function closeVisit(){

  if(!window.currentVisitRef) return;

  const exitTime = Date.now();
  const durationSec = Math.floor((exitTime - window.pageEnterTime)/1000);

  window.currentVisitRef.update({
    exitTimeReadable: new Date().toLocaleString(),
    exitTimestamp: exitTime,
    durationSec: durationSec,
    durationMin: (durationSec/60).toFixed(2)
  });

}

// عند الانتقال او قفل الصفحة
window.addEventListener("beforeunload", closeVisit);

// عند تغيير التاب
document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState==="hidden"){
    closeVisit();
  }
});




}); // ← دي نهاية DOMContentLoaded






















































