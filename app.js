/* MQTT */

const client =
mqtt.connect(
"wss://broker.hivemq.com:8884/mqtt"
);

const topic =
"solar/jnge/hybrid";

/* FIREBASE */

const firebaseConfig = {

apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
authDomain:"isokuiki-scada.firebaseapp.com",
databaseURL:"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"isokuiki-scada",
storageBucket:"isokuiki-scada.firebasestorage.app",
messagingSenderId:"1078745557059",
appId:"1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

firebase.initializeApp(firebaseConfig);

const db =
firebase.database();

/* =========================
   GAUGE
========================= */

function createGauge(id,color){

return new Chart(
document.getElementById(id),
{
type:'doughnut',

data:{
datasets:[{
data:[0,100],
backgroundColor:[
color,
'#132544'
],
borderWidth:0
}]
},

options:{

responsive:true,
maintainAspectRatio:false,

cutout:'82%',

plugins:{
legend:{display:false}
},

animation:{
duration:500
}

}
});
}

const gauge1 =
createGauge(
'gauge1',
'#00ffe1'
);

const gauge2 =
createGauge(
'gauge2',
'#00ff88'
);

const gauge3 =
createGauge(
'gauge3',
'#00aaff'
);

/* =========================
   NODE FLOW
========================= */

let p1=0;
let p2=0;
let p3=0;

function animateFlow(){

p1 += 2;
p2 += 2;
p3 += 2;

/* PV -> MPPT */

if(p1>95)p1=0;

document.getElementById("n1")
.setAttribute(
"transform",
`translate(200 ${135+p1})`
);

/* MPPT -> BAT */

if(p2>260)p2=0;

let x2,y2;

if(p2<90){

x2 = 200 - p2;
y2 = 335;

}else{

x2 = 110;
y2 = 335 + (p2-90);

}

document.getElementById("n2")
.setAttribute(
"transform",
`translate(${x2} ${y2})`
);

/* MPPT -> LOAD */

if(p3>260)p3=0;

let x3,y3;

if(p3<90){

x3 = 200 + p3;
y3 = 335;

}else{

x3 = 290;
y3 = 335 + (p3-90);

}

document.getElementById("n3")
.setAttribute(
"transform",
`translate(${x3} ${y3})`
);

requestAnimationFrame(
animateFlow
);

}

animateFlow();

/* =========================
   MQTT CONNECT
========================= */

client.on(
'connect',
()=>{

client.subscribe(topic);

document.getElementById(
'onlineText'
).innerHTML='ONLINE';

console.log("MQTT CONNECTED");

}
);

/* =========================
   MQTT MESSAGE
========================= */

client.on(
'message',
(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* SAVE FIREBASE */

db.ref(
'history'
).push({

time:Date.now(),

pv_v:d.pv_v,
pv_i:d.pv_i,
pv_p:d.pv_p,

charge_p:d.charge_p,
mppt_eff:d.mppt_eff,

bat_v:d.bat_v,
bat_i:d.bat_i,
soc:d.soc,

kwh_day:d.kwh_day,
kwh_month:d.kwh_month

});

/* STATUS */

document.getElementById(
'deviceStatus'
).innerHTML =

d.status === "WORKING"

?

"DEVICE WORKING"

:

"DEVICE SHUTDOWN";

/* PV */

document.getElementById(
'pvv'
).innerHTML =
d.pv_v + "V";

document.getElementById(
'pvi'
).innerHTML =
d.pv_i + "A";

document.getElementById(
'pvp'
).innerHTML =
d.pv_p + "W";

/* MPPT */

document.getElementById(
'charge'
).innerHTML =
d.charge_p + "W";

document.getElementById(
'eff'
).innerHTML =
d.mppt_eff + "%";

/* BATTERY */

document.getElementById(
'bv'
).innerHTML =
d.bat_v + "V";

document.getElementById(
'bi'
).innerHTML =
d.bat_i + "A";

document.getElementById(
'soc'
).innerHTML =
d.soc + "%";

/* ENERGY */

document.getElementById(
'day'
).innerHTML =
d.kwh_day;

document.getElementById(
'month'
).innerHTML =
d.kwh_month;

/* =========================
   GAUGE UPDATE
========================= */

gauge1.data.datasets[0].data = [

d.pv_p,
5000-d.pv_p

];

gauge2.data.datasets[0].data = [

d.soc,
100-d.soc

];

gauge3.data.datasets[0].data = [

d.mppt_eff,
100-d.mppt_eff

];

gauge1.update();
gauge2.update();
gauge3.update();

}
);

/* =========================
   AUTO RECONNECT
========================= */

client.on(
'reconnect',
()=>{

console.log(
"MQTT RECONNECT..."
);

}
);

client.on(
'offline',
()=>{

document.getElementById(
'onlineText'
).innerHTML='OFFLINE';

}
);

client.on(
'error',
(err)=>{

console.log(err);

}
);