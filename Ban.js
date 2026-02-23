(function(){

document.documentElement.style.display="none";

const fingerprint = btoa(
navigator.userAgent+
screen.width+
screen.height+
navigator.language+
Intl.DateTimeFormat().resolvedOptions().timeZone
).substring(0,50);

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

   if(banned){
     document.documentElement.innerHTML=`
     <div style="position:fixed;top:0;left:0;width:100%;height:100%;
     background:black;color:red;display:flex;align-items:center;
     justify-content:center;font-size:32px;font-weight:bold;z-index:999999">
     🚫 تم حظر هذا الجهاز
     </div>`;
     return;
   }

   document.documentElement.style.display="block";
 });

});

})();
