(function(){

function waitFirebase(){
  if(typeof firebase==="undefined" || !firebase.apps.length){
    setTimeout(waitFirebase,50);
    return;
  }
  startBanSystem();
}

waitFirebase();

function startBanSystem(){

// نخفي الصفحة لحد ما نتأكد
document.documentElement.style.display="none";

let analyticsAllowed = true; // التحكم في ارسال الداتا

/* نفس fingerprint بالظبط */
const ua = navigator.userAgent.replace(/[.#$[\]]/g,"");
const res = screen.width + "x" + screen.height;
const lang = navigator.language;
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const cores = navigator.hardwareConcurrency || "0";

const fingerprint = btoa(ua + res + lang + tz + cores).substring(0,50);

// نجيب deviceId
firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   document.documentElement.style.display="block";
   return;
 }

 const deviceId = snap.val();

 // 🔥 نراقب البان LIVE
 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .on("value",banSnap=>{

   const banned = banSnap.val()===true;

   if(banned){

     analyticsAllowed = false;
     window.stopAllTracking = true; // يقفل analytics

     // شاشة البان
     document.documentElement.innerHTML=`
     <div style="
     position:fixed;
     top:0;left:0;
     width:100%;
     height:100%;
     background:black;
     color:red;
     display:flex;
     align-items:center;
     justify-content:center;
     font-size:32px;
     font-weight:bold;
     z-index:999999">
     🚫 تم حظر هذا الجهاز
     </div>`;

     document.body.style.overflow="hidden";
     document.documentElement.style.overflow="hidden";

     return;
   }

   // 🟢 لو البان اتفك
   analyticsAllowed = true;
   window.stopAllTracking = false;

   // يرجع الموقع طبيعي بدون refresh
   location.reload();

 });

});

}

})();
