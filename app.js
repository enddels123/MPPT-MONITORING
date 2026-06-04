/* =====================================================
   ISOKUIKI NEXT-GEN INDUSTRIAL SCADA v2.0
   MQTT + FIREBASE + REALTIME SCADA
===================================================== */

/* =====================================================
   MQTT
===================================================== */

const client =
mqtt.connect(
"wss://broker.hivemq.com:8884/mqtt"
);

const topic =
"solar/jnge/hybrid";

/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {

apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",

authDomain:
"isokuiki-scada.firebaseapp.com",

databaseURL:
"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

projectId:
"isokuiki-scada",

storageBucket:
"isokuiki-scada.firebasestorage.app",

messagingSenderId:
"1078745557059",

appId:
"1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

firebase.initializeApp(firebaseConfig);

const db =
firebase.database();

/* =====================================================
   CHART CONFIG
===================================================== */

Chart.defaults.color = "#ffffff";

Chart.defaults.font.family =
"Orbitron";

/* =====================================================
   CREATE CHART
===================================================== */

function createChart(id,datasets){

return new Chart(

document.getElementById(id),

{

type:'line',

data:{

labels:[],

datasets:datasets

},

options:{

responsive:true,

maintainAspectRatio:false,

animation:false,

plugins:{

legend:{

labels:{

color:'#ffffff',

font:{
size:10
}

}

}

},

elements:{

line:{
borderWidth:2
},

point:{
radius:0
}

},

scales:{

x:{

ticks:{
display:false
},

grid:{
color:'rgba(255,255,255,.03)'
}

},

y:{

ticks:{
color:'#ffffff',
font:{size:9}
},

grid:{
color:'rgba(255,255,255,.05)'
}

}

}

}

});

}

/* =====================================================
   PV CHART
===================================================== */

const chart1 =
createChart(

'chart1',

[

{
label:'Voltage',
data:[],
borderColor:'#00ffe1',
tension:.4
},

{
label:'Current',
data:[],
borderColor:'#00ff88',
tension:.4
},

{
label:'Power',
data:[],
borderColor:'#2b7cff',
tension:.4
}

]

);

/* =====================================================
   DAILY CHART
===================================================== */

const chart2 =
createChart(

'chart2',

[

{
label:'Daily kWh',
data:[],
borderColor:'#00ff88',
tension:.4
}

]

);

/* =====================================================
   MONTHLY CHART
===================================================== */

const chart3 =
createChart(

'chart3',

[

{
label:'Monthly kWh',
data:[],
borderColor:'#00aaff',
tension:.4
}

]

);

/* =====================================================
   DYNAMIC NODE FLOW
===================================================== */

let pvFlow = 0;
let batFlow = 0;
let energyFlow = 0;

function animateNodes(){

/* =========================
   PV -> MPPT
========================= */

pvFlow += 2;

if(pvFlow > 90){
pvFlow = 0;
}

document
.getElementById("node1")
.setAttribute(
"cx",
150
);

document
.getElementById("node1")
.setAttribute(
"cy",
60 + pvFlow
);

/* =========================
   MPPT -> BATTERY
========================= */

batFlow += 2;

if(batFlow > 170){
batFlow = 0;
}

let batX;
let batY;

if(batFlow <= 70){

batX =
150 - batFlow;

batY =
310;

}else{

batX =
80;

batY =
310 + (batFlow - 70);

}

document
.getElementById("node2")
.setAttribute("cx",batX);

document
.getElementById("node2")
.setAttribute("cy",batY);

/* =========================
   MPPT -> ENERGY
========================= */

energyFlow += 2;

if(energyFlow > 170){
energyFlow = 0;
}

let energyX;
let energyY;

if(energyFlow <= 70){

energyX =
150 + energyFlow;

energyY =
310;

}else{

energyX =
220;

energyY =
310 + (energyFlow - 70);

}

document
.getElementById("node3")
.setAttribute("cx",energyX);

document
.getElementById("node3")
.setAttribute("cy",energyY);

requestAnimationFrame(
animateNodes
);

}

animateNodes();

/* =====================================================
   MQTT CONNECT
===================================================== */

client.on(

'connect',

()=>{

console.log(
'MQTT CONNECTED'
);

client.subscribe(topic);

document
.getElementById(
'onlineText'
)
.innerHTML =
'ONLINE';

}

/* reconnect */

);

client.on(

'reconnect',

()=>{

document
.getElementById(
'onlineText'
)
.innerHTML =
'RECONNECTING...';

}

);

client.on(

'offline',

()=>{

document
.getElementById(
'onlineText'
)
.innerHTML =
'OFFLINE';

}

);

/* =====================================================
   MQTT MESSAGE
===================================================== */

client.on(

'message',

(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* =====================================================
   SAVE FIREBASE HISTORY
===================================================== */

db.ref(
'history'
).push({

timestamp:
Date.now(),

date:
new Date()
.toLocaleString(),

pv_v:d.pv_v,
pv_i:d.pv_i,
pv_p:d.pv_p,

charge_p:d.charge_p,
mppt_eff:d.mppt_eff,

bat_v:d.bat_v,
bat_i:d.bat_i,
soc:d.soc,

kwh_day:d.kwh_day,
kwh_month:d.kwh_month,

status:d.status

});

/* =====================================================
   DEVICE STATUS
===================================================== */

document
.getElementById(
'deviceStatus'
)
.innerHTML =

d.status === "WORKING"

?

"DEVICE WORKING"

:

"DEVICE SHUTDOWN";

/* =====================================================
   WIDGET VALUE
===================================================== */

const map = {

pvv:
d.pv_v + "V",

pvi:
d.pv_i + "A",

pvp:
d.pv_p + "W",

charge:
d.charge_p + "W",

eff:
d.mppt_eff + "%",

bv:
d.bat_v + "V",

bi:
d.bat_i + "A",

soc:
d.soc + "%",

day:
d.kwh_day,

month:
d.kwh_month

};

Object.keys(map).forEach(id=>{

const el =
document.getElementById(id);

if(el){

el.innerHTML =
map[id];

}

});

/* =====================================================
   SCADA VALUE
===================================================== */

pvVolt.innerHTML =
d.pv_v + "V";

pvAmp.innerHTML =
d.pv_i + "A";

pvPower.innerHTML =
d.pv_p + "W";

mpptW.innerHTML =
d.charge_p + "W";

mpptEff.innerHTML =
d.mppt_eff + "%";

batVolt.innerHTML =
d.bat_v + "V";

batAmp.innerHTML =
d.bat_i + "A";

batSoc.innerHTML =
d.soc + "%";

kwhDay.innerHTML =
d.kwh_day;

/* =====================================================
   CHART UPDATE
===================================================== */

const now =
new Date()
.toLocaleTimeString();

/* PV */

chart1.data.labels.push(now);

chart1.data.datasets[0]
.data.push(d.pv_v);

chart1.data.datasets[1]
.data.push(d.pv_i);

chart1.data.datasets[2]
.data.push(d.pv_p);

/* DAILY */

chart2.data.labels.push(now);

chart2.data.datasets[0]
.data.push(d.kwh_day);

/* MONTHLY */

chart3.data.labels.push(now);

chart3.data.datasets[0]
.data.push(d.kwh_month);

/* LIMIT */

if(chart1.data.labels.length > 20){

chart1.data.labels.shift();

chart1.data.datasets
.forEach(ds=>{

ds.data.shift();

});

chart2.data.labels.shift();

chart2.data.datasets[0]
.data.shift();

chart3.data.labels.shift();

chart3.data.datasets[0]
.data.shift();

}

/* UPDATE */

chart1.update();
chart2.update();
chart3.update();

}

/* END MESSAGE */

);

/* =====================================================
   LOAD FIREBASE HISTORY
===================================================== */

db.ref(
'history'
)
.limitToLast(20)
.once(
'value',
(snapshot)=>{

snapshot.forEach((child)=>{

const d =
child.val();

const time =
new Date(
d.timestamp
)
.toLocaleTimeString();

/* PV */

chart1.data.labels.push(time);

chart1.data.datasets[0]
.data.push(d.pv_v);

chart1.data.datasets[1]
.data.push(d.pv_i);

chart1.data.datasets[2]
.data.push(d.pv_p);

/* DAILY */

chart2.data.labels.push(time);

chart2.data.datasets[0]
.data.push(d.kwh_day);

/* MONTH */

chart3.data.labels.push(time);

chart3.data.datasets[0]
.data.push(d.kwh_month);

});

chart1.update();
chart2.update();
chart3.update();

});