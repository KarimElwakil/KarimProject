
(function(){

// نمنع عرض الصفحة لحد ما نتاكد
document.documentElement.style.display = "none";

// نفس fingerprint بتاعك
const fingerprint = btoa(
navigator.userAgent +
screen.width +
screen.height +
navigator.language +
Intl.DateTimeFormat().resolvedOptions().timeZone
).substring(0,50);

firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   document.documentElement.style.display = "block";
   return;
 }

 const deviceId = snap.val();

 firebase.database()
 .ref("deviceSettings/"+deviceId+"/banned")
 .once("value")
 .then(banSnap=>{

   if(banSnap.val() === true){

     document.documentElement.innerHTML = `
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

     throw new Error("BANNED");
   }

   // لو مش متبند
   document.documentElement.style.display = "block";

 });

});

})();


<!-- 🔴 BAN SYSTEM END -->
