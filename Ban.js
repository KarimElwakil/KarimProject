(function(){

// اخفاء الموقع لحد ما نتأكد
document.documentElement.style.display="none";

// fingerprint
const fingerprint = btoa(
navigator.userAgent+
screen.width+
screen.height+
navigator.language+
Intl.DateTimeFormat().resolvedOptions().timeZone
).substring(0,50);

// نجيب device id
firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   document.documentElement.style.display="block";
   return;
 }

 const deviceId = snap.val();

 // مراقبة البان LIVE
 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .on("value",banSnap=>{

   const banned = banSnap.val()===true;

   if(banned){

     // وقف الصفحة بالكامل
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
     🚫 تم حظر هذا الجهاز من الموقع
     </div>`;

     document.body.style.overflow="hidden";
     document.documentElement.style.overflow="hidden";

   }else{
     // لو فكيت البان يرجع الموقع فوراً
     location.reload();
   }

   document.documentElement.style.display="block";

 });

});

})();
