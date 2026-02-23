

/* 🛑 اخفي الصفحة فوراً لحد ما نقرر */
document.documentElement.style.display="none";

let stopAllTracking = false;

/* نفس fingerprint القديم بالظبط */
const fingerprint = btoa(
navigator.userAgent +
screen.width +
screen.height +
navigator.language +
Intl.DateTimeFormat().resolvedOptions().timeZone
).substring(0,50);

/* هات deviceId */
firebase.database()
.ref("devicesIndex/"+fingerprint)
.once("value")
.then(snap=>{

 if(!snap.exists()){
   document.documentElement.style.display="block";
   return;
 }

 const deviceId = snap.val();

 const banRef = firebase.database().ref("deviceSettings/"+deviceId+"/banned");

 /* 🔴 مراقبة لحظية للبان */
 banRef.on("value",banSnap=>{

   const banned = banSnap.val()===true;

   if(banned){

     stopAllTracking = true;

     /* امسح الصفحة كلها */
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

     /* امنع الاسكرول */
     document.body.style.overflow="hidden";
     document.documentElement.style.overflow="hidden";

     /* 🛑 وقف أي فايربيز */
     firebase.database().goOffline();

     return;
   }

   /* 🟢 لو البان اتفك */
   if(!banned){

     /* رجع الاتصال */
     firebase.database().goOnline();

     /* لو كان متبند قبل كده */
     if(stopAllTracking){
       location.reload(); // يرجع الموقع طبيعي
       return;
     }

     document.documentElement.style.display="block";
   }

 });

});

})();

