(function(){

window.stopAllTracking = true; // افتراضياً وقف التتبع

let overlayShown = false;

function waitFirebase(){
  if(typeof firebase==="undefined" || !firebase.apps.length){
    setTimeout(waitFirebase,50);
    return;
  }
  start();
}
waitFirebase();

function start(){

const ua = navigator.userAgent.replace(/[.#$[\]]/g,"");
const res = screen.width+"x"+screen.height;
const lang = navigator.language;
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const cores = navigator.hardwareConcurrency || "0";

const fingerprint = btoa(ua+res+lang+tz+cores).substring(0,50);

firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   window.stopAllTracking=false;
   return;
 }

 const deviceId = snap.val();

 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .on("value",snap=>{

   const banned = snap.val()===true;

   if(banned){

     window.stopAllTracking = true;

     if(!overlayShown){
       showBan();
       overlayShown=true;
     }

     return;
   }

   // لو مش متبند
   if(!banned){

     window.stopAllTracking=false;

     if(overlayShown){
       location.reload(); // يرجع الموقع
     }
   }

 });

});

}

function showBan(){

document.body.innerHTML="";

const div = document.createElement("div");
div.style.position="fixed";
div.style.top="0";
div.style.left="0";
div.style.width="100%";
div.style.height="100%";
div.style.background="black";
div.style.color="red";
div.style.display="flex";
div.style.alignItems="center";
div.style.justifyContent="center";
div.style.fontSize="35px";
div.style.fontWeight="bold";
div.style.zIndex="999999999";
div.innerHTML="🚫 تم حظر هذا الجهاز";

document.body.appendChild(div);
document.body.style.overflow="hidden";

}

})();
