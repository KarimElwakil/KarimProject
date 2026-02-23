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

document.documentElement.style.display="none";

let wasBanned = false; // لمعرفة هل كان متبند قبل كده

const ua = navigator.userAgent.replace(/[.#$[\]]/g,"");
const res = screen.width + "x" + screen.height;
const lang = navigator.language;
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const cores = navigator.hardwareConcurrency || "0";

const fingerprint = btoa(ua + res + lang + tz + cores).substring(0,50);

firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   document.documentElement.style.display="block";
   return;
 }

 const deviceId = snap.val();

 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .on("value",banSnap=>{

   const banned = banSnap.val()===true;

   // 🔴 لو متبند
   if(banned){

     wasBanned = true;
     window.stopAllTracking = true;

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
   if(!banned){

     window.stopAllTracking = false;

     // لو كان متبند فعلاً قبلها → reload مرة واحدة فقط
     if(wasBanned){
       location.reload();
       return;
     }

     document.documentElement.style.display="block";
   }

 });

});

}

})();
