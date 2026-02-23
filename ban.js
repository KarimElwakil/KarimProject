(function(){

let isBanned = false;

// نخفي الصفحة لحين الفحص
document.documentElement.style.visibility="hidden";

function waitFirebase(){
  if(typeof firebase==="undefined" || !firebase.apps.length){
    setTimeout(waitFirebase,50);
    return;
  }
  startBan();
}
waitFirebase();

function startBan(){

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
   document.documentElement.style.visibility="visible";
   window.stopAllTracking=false;
   return;
 }

 const deviceId = snap.val();

 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .on("value",snap=>{

   const banned = snap.val()===true;

   if(banned){

     isBanned = true;
     window.stopAllTracking = true;

     showBanOverlay();
     return;
   }

   // لو اتفك
   if(!banned){

     window.stopAllTracking = false;

     if(isBanned){
       location.reload();
       return;
     }

     document.documentElement.style.visibility="visible";
   }

 });

});

}

function showBanOverlay(){

  if(document.getElementById("banOverlay")) return;

  const div = document.createElement("div");
  div.id="banOverlay";
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
  div.style.fontSize="34px";
  div.style.fontWeight="bold";
  div.style.zIndex="9999999";
  div.innerHTML="🚫 تم حظر هذا الجهاز";

  document.body.appendChild(div);
  document.body.style.overflow="hidden";

}

})();
