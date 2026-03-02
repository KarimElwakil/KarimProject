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
   DEVICE SYSTEM ULTRA FIXED
=============================== */


// بصمة قوية للجهاز
const ua = navigator.userAgent.replace(/[.#$[\]]/g,"");
const res = screen.width + "x" + screen.height;
const lang = navigator.language;
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const cores = navigator.hardwareConcurrency || "0";

/* ===============================
   DEVICE ID FIXED (جهاز واحد فقط)
=============================== */

let deviceId = localStorage.getItem("deviceId");

if(!deviceId){
  deviceId = "dev_" + Math.random().toString(36).substring(2,12);
  localStorage.setItem("deviceId", deviceId);

  // تسجيل أول مرة فقط
  firebase.database().ref("devices/"+deviceId).set({
    firstSeen: Date.now(),
    ua: navigator.userAgent,
    res: screen.width+"x"+screen.height,
    lang: navigator.language
  });
}

const settingsRef = firebase.database().ref("deviceSettings/"+deviceId);

// إنشاء الإعدادات أول مرة
settingsRef.once("value").then(snap=>{
  if(!snap.exists()){
    settingsRef.set({
      notify:true,
      banned:false
   .then(()=>{
      startAnalytics();
    });
  }else{
    startAnalytics();
  }
});

function sendTelegram(text){

 const TELEGRAM_BOT = "8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k";
 const TELEGRAM_CHAT = "5986160897";

 fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:TELEGRAM_CHAT,
    text:text
  })
 });

}

let banVisible = false;

function showBanScreen(){

 if(banVisible) return;
 banVisible = true;

 let banBox = document.getElementById("banOverlay");

 if(!banBox){
   banBox = document.createElement("div");
   banBox.id="banOverlay";
   banBox.style.position="fixed";
   banBox.style.top="0";
   banBox.style.left="0";
   banBox.style.width="100%";
   banBox.style.height="100%";
   banBox.style.background="black";
   banBox.style.display="flex";
   banBox.style.alignItems="center";
   banBox.style.justifyContent="center";
   banBox.style.fontSize="28px";
   banBox.style.fontWeight="bold";
   banBox.style.color="red";
   banBox.style.zIndex="999999";
   banBox.innerHTML="🚫 تم حظر هذا الجهاز من الموقع";
   document.body.appendChild(banBox);
 }

 document.body.style.overflow="hidden";
 document.documentElement.style.overflow="hidden";
}

function hideBanScreen(){

 banVisible = false;

 const banBox = document.getElementById("banOverlay");
 if(banBox) banBox.remove();

 document.body.style.overflow="";
 document.documentElement.style.overflow="";
}


  
function startAnalytics(){

  /* =========================================
   TELEGRAM ULTRA TRACKING ENGINE
========================================= */
let inactiveTimer = null;
  let summaryTimer = null;

  
let tgMessageId = null;
let pageStartTG = Date.now();
let offlineTimer = null;


let sessionPages = JSON.parse(localStorage.getItem("tg_pages") || "[]");
let sessionStartTG = localStorage.getItem("tg_session_start");

if(!sessionStartTG){
  sessionStartTG = Date.now();
  localStorage.setItem("tg_session_start", sessionStartTG);
}

/* ===== helper ===== */
function tgSend(text){
 return fetch(`https://api.telegram.org/bot8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k/sendMessage`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:"5986160897",
    text:text
  })
 }).then(r=>r.json());
}

function tgEdit(id,text){
 return fetch(`https://api.telegram.org/bot8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k/editMessageText`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:"5986160897",
    message_id:id,
    text:text
  })
 });
}

function tgDelete(id){
 return fetch(`https://api.telegram.org/bot8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k/deleteMessage`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:"5986160897",
    message_id:id
  })
 });
}

  /* ========================================
   SMART ENTRY SYSTEM (ANTI SPAM)
======================================== */

const entryRef = firebase.database().ref("analyticsEntry/"+deviceId);

// آخر دخول محفوظ
entryRef.once("value").then(snap=>{

 const now = Date.now();

 // أول مرة يدخل في حياته
 if(!snap.exists()){

   sendEntryMessage("🆕 جهاز جديد دخل الموقع لأول مرة");

   entryRef.set({
     first: now,
     last: now
   });

   return;
 }

 const data = snap.val();
 const last = data.last || 0;

 // رجع بعد ساعة
 if(now - last > 3600000){

   sendEntryMessage("🔁 جهاز رجع للموقع بعد غياب");

   entryRef.update({
     last: now
   });

 }else{
   // دخل خلال ساعة → لا نرسل شيء
   entryRef.update({
     last: now
   });
 }

});


function sendEntryMessage(title){

firebase.database()
.ref("deviceSettings/"+deviceId+"/notify")
.once("value")
.then(snap=>{

 if(snap.val() !== true) return;

 const msg =
`${title}

ID: ${deviceId}
🕒 ${new Date().toLocaleString()}
📱 ${navigator.userAgent}
🖥️ ${screen.width}x${screen.height}`;

 fetch(`https://api.telegram.org/bot8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k/sendMessage`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:"5986160897",
    text:msg
  })
 });

});

}
  



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

// اسم المتصفح
const browserName = detectBrowser();

// مسار المتصفح
const browserRef = deviceRef.child("browsers").child(browserName);

// مسار الجلسة داخل المتصفح
const sessionRef = browserRef.child("sessions").child(sessionId);

  
// فتح الجلسة أول مرة
sessionRef.child("info").update({
  isOnline:true,
  start: Date.now(),
  readableStart: new Date().toLocaleString(),
  device: navigator.userAgent
});

  // 🔔 إشعار دخول جهاز
const deviceName =
 detectDevice() + " | " +
 screen.width+"x"+screen.height;



// لما يقفل الموقع
window.addEventListener("beforeunload",()=>{
  sessionRef.child("info/isOnline").set(false);
});

// لو النت فصل فجأة
sessionRef.child("info/isOnline").onDisconnect().set(false);



 



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

  // Telegram
  if (ua.includes("Telegram")) return "Telegram";

  // Facebook / Instagram webview
  if (ua.includes("FBAN") || ua.includes("FBAV")) return "Facebook";
  if (ua.includes("Instagram")) return "Instagram";

  // Edge
  if (ua.includes("Edg")) return "Edge";

  // Chrome
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";

  // Firefox
  if (ua.includes("Firefox")) return "Firefox";

  // Safari الحقيقي
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";

  return "Unknown";
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
  const pageStart = Date.now();


function getPageName(){
  let path = location.pathname;
  if(!path || path==="/") return "home";
  path = path.split("/").pop();
  return path.replace(".html","");
}

const pageName = getPageName();

/* =========================
   PAGE ENTER TELEGRAM
========================= */

firebase.database()
.ref("deviceSettings/"+deviceId+"/notify")
.once("value")
.then(snap=>{
 if(snap.val()!==true) return;

 // لو refresh → لا ترسل
 const nav = performance.getEntriesByType("navigation")[0];
 if(nav && nav.type==="reload") return;

 const msg =
`📄 دخول صفحة: ${pageName}
🕒 ${new Date().toLocaleString()}
⏳ جاري التتبع...`;

 tgSend(msg).then(d=>{
   if(d.result){
     tgMessageId = d.result.message_id;

     sessionPages.push({
       page:pageName,
       msgId:tgMessageId,
       start:Date.now(),
       clicks:0,
       scroll:0
     });

     localStorage.setItem("tg_pages",JSON.stringify(sessionPages));
   }
 });

});
  
  /* تسجيل مشاهدة صفحة عالمياً */
const globalPageRef = db.ref("analytics/pages/"+pageName);

globalPageRef.child("views").transaction(v => (v || 0) + 1);

// unique per device
globalPageRef.child("devices/"+deviceId).set(true);


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

  // حفظ ترتيب الصفحات داخل الجلسة
sessionRef.child("flow").push({
 page: pageName,
 time: Date.now(),
 readable: new Date().toLocaleString()
});


  // نخليه متاح عالمياً
window.currentVisitRef = visitRef;
window.pageEnterTime = Date.now();

/* ===== PAGE ONLINE SYSTEM ===== */

// أول دخول
visitRef.child("isOnline").set(true);

// لما يخرج من الصفحة
window.addEventListener("beforeunload",()=>{
  visitRef.child("isOnline").set(false);
});



// لو النت فصل
visitRef.child("isOnline").onDisconnect().set(false);




visitRef.set({
  mouseMoves:[],
clicks:[],
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

  // تسجيل الماوس
document.addEventListener("mousemove",(e)=>{
  if(!window.currentVisitRef) return;

  window.currentVisitRef.child("mouseMoves").push({
    x:e.clientX,
    y:e.clientY,
    t:Date.now()
  });
});

  /* ===== TRACK INTERACTION ===== */

let currentPage = sessionPages[sessionPages.length-1];

document.addEventListener("click",()=>{
 if(!currentPage) return;
 currentPage.clicks++;
 localStorage.setItem("tg_pages",JSON.stringify(sessionPages));
});

window.addEventListener("scroll",()=>{
 if(!currentPage) return;

 const h = document.body.scrollHeight-window.innerHeight;
 const sc = Math.round((window.scrollY/h)*100);
 if(sc>currentPage.scroll) currentPage.scroll=sc;

 localStorage.setItem("tg_pages",JSON.stringify(sessionPages));
});

// تسجيل الكليك
document.addEventListener("click",(e)=>{
  if(!window.currentVisitRef) return;

  window.currentVisitRef.child("clicks").push({
    x:e.clientX,
    y:e.clientY,
    t:Date.now()
  });
});







  

 




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




 


  const sessionDurationSec =
  Math.floor((Date.now() - sessionStart) / 1000);

  /* ==============================
   TOTAL TIME ON PAGE (DEVICE)
============================== */

  const endTime = Date.now();
const durationSec =
  Math.floor((endTime - pageStart) / 1000);





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
  /* جمع وقت الجلسة كله */
sessionRef.child("totalDuration").transaction(v => (v || 0) + durationSec);

/* آخر نشاط */
sessionRef.child("info/lastSeen").set(Date.now());


  window.currentVisitRef.update({
 exitTimeReadable: new Date().toLocaleString(),
 exitTimestamp: exitTime,
 durationSec: durationSec,
 durationMin: (durationSec/60).toFixed(2),
theme: document.documentElement.getAttribute("data-theme") || "light"
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


  // ===== TELEGRAM EDIT =====
if(tgMessageId){

 const staySec = Math.floor((Date.now() - pageStartTG)/1000);

 const finalMsg =
`📄 صفحة: ${pageName}

⏱️ المدة: ${staySec} ثانية
📜 Scroll: ${maxScroll || 0}%
🖱️ Clicks تم تسجيلها
📱 ${navigator.userAgent}

🕒 خرج: ${new Date().toLocaleString()}`;

 fetch(`https://api.telegram.org/bot8492890302:AAEdVpPK_3o8J6DmUcNlZk-vOQzR4eHyZ2k/editMessageText`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    chat_id:"5986160897",
    message_id: tgMessageId,
    text: finalMsg
  })
 });

}





  /* =========================
   PAGE EXIT / NAVIGATION
========================= */

function closeTelegramPage(nextPage="exit"){

 if(!sessionPages.length) return;

 let last = sessionPages[sessionPages.length-1];
 if(!last.msgId) return;

 const stay = Math.floor((Date.now()-last.start)/1000);

 const text =
`📄 صفحة: ${last.page}

⏱️ المدة: ${stay} ثانية
📜 Scroll: ${last.scroll||0}%
🖱️ Clicks: ${last.clicks||0}

➡️ انتقل إلى: ${nextPage}`;

 tgEdit(last.msgId,text);
}

/* انتقال صفحة */
window.addEventListener("beforeunload",()=>{
 closeTelegramPage("صفحة أخرى");
});

  /* =========================
   INACTIVE 5 MIN
========================= */

function resetInactive(){
 clearTimeout(inactiveTimer);

 inactiveTimer=setTimeout(()=>{
   closeTelegramPage("inactive");
 },300000); // 5 min
}

["click","scroll","mousemove","keydown"].forEach(e=>{
 document.addEventListener(e,resetInactive);
});

resetInactive();


  /* =========================
   FINAL SUMMARY 20 MIN
========================= */

function sendFinalSummary(){

 let pages = JSON.parse(localStorage.getItem("tg_pages")||"[]");
 if(!pages.length) return;

 let text=`📊 ملخص الزيارة\n\n`;

 text+=`📱 جهاز:\n`;
 text+=navigator.userAgent+"\n";
 text+=screen.width+"x"+screen.height+"\n\n";

 pages.forEach(p=>{
  const stay=Math.floor((Date.now()-p.start)/1000);

  text+=`📄 ${p.page}\n`;
  text+=`⏱️ ${stay}ث\n`;
  text+=`📜 ${p.scroll||0}%\n`;
  text+=`🖱️ ${p.clicks||0}\n\n`;
 });

 tgSend(text);

 // حذف كل الرسائل القديمة
 pages.forEach(p=>{
  if(p.msgId) tgDelete(p.msgId);
 });

 localStorage.removeItem("tg_pages");
 localStorage.removeItem("tg_session_start");
}

summaryTimer=setTimeout(sendFinalSummary,1200000); //20 min


}); // نهاية DOMContentLoaded


























