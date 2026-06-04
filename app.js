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

/* CHART */

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
cutout:'80%',
plugins:{
legend:{display:false}
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

function createLine(id,color,label){

return new Chart(
document.getElementById(id),
{
type:'line',
data:{
labels:[],
datasets:[{
label:label,
data:[],
borderColor:color,
backgroundColor:color,
tension:.4
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'#fff'
}
}
},
scales:{
x:{
ticks:{color:'#fff'}
},
y:{
ticks:{color:'#fff'}
}
}
}
});
}

const chart1 =
createLine(
'chart1',
'#00ffe1',
'PV Power'
);

const chart2 =
createLine(
'chart2',
'#00ff88',
'Daily kWh'
);

const chart3 =
createLine(
'chart3',
'#00aaff',
'Monthly kWh'
);

/* FLOW NODE */

let t1=0;
let t2=0;
let t3=0;

function animateFlow(){

t1+=.01;
t2+=.01;
t3+=.01;

const n1 =
document.getElementById('n1');

const n2 =
document.getElementById('n2');

const n3 =
document.getElementById('n3');

/* PV -> MPPT */

n1.setAttribute(
'cx',
150
);

n1.setAttribute(
'cy',
70 + (100*t1%100)
);

/* MPPT -> BATTERY */

n2.setAttribute(
'cx',
150 - (80*t2%80)
);

n2.setAttribute(
'cy',
300
);

/* MPPT -> ENERGY */

n3.setAttribute(
'cx',
150 + (80*t3%80)
);

n3.setAttribute(
'cy',
300
);

requestAnimationFrame(
animateFlow
);
}

animateFlow();

/* MQTT */

client.on(
'connect',
()=>{

client.subscribe(topic);

document.getElementById(
'onlineText'
).innerHTML='ONLINE';

}
);

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
).push(d);

/* DEVICE */

document.getElementById(
'deviceStatus'
).innerHTML =
d.status === "WORKING"
?
"DEVICE WORKING"
:
"DEVICE SHUTDOWN";

/* UPDATE */

const map = {

pvv:d.pv_v+"V",
pvi:d.pv_i+"A",
pvp:d.pv_p+"W",

charge:d.charge_p+"W",
eff:d.mppt_eff+"%",

bv:d.bat_v+"V",
bi:d.bat_i+"A",
soc:d.soc+"%",

day:d.kwh_day,
month:d.kwh_month

};

Object.keys(map).forEach(id=>{

document.getElementById(id)
.innerHTML = map[id];

});

/* SCADA */

document.getElementById(
'pvVolt'
).innerHTML =
d.pv_v+"V";

document.getElementById(
'pvAmp'
).innerHTML =
d.pv_i+"A";

document.getElementById(
'pvPower'
).innerHTML =
d.pv_p+"W";

document.getElementById(
'mpptW'
).innerHTML =
d.charge_p+"W";

document.getElementById(
'mpptEff'
).innerHTML =
d.mppt_eff+"%";

document.getElementById(
'batVolt'
).innerHTML =
d.bat_v+"V";

document.getElementById(
'batAmp'
).innerHTML =
d.bat_i+"A";

document.getElementById(
'batSoc'
).innerHTML =
d.soc+"%";

document.getElementById(
'kwhDay'
).innerHTML =
d.kwh_day;

/* GAUGE */

gauge1.data.datasets[0].data =
[d.pv_p,5000-d.pv_p];

gauge2.data.datasets[0].data =
[d.soc,100-d.soc];

gauge3.data.datasets[0].data =
[d.mppt_eff,100-d.mppt_eff];

gauge1.update();
gauge2.update();
gauge3.update();

/* CHART */

const now =
new Date()
.toLocaleTimeString();

chart1.data.labels.push(now);
chart1.data.datasets[0].data.push(d.pv_p);

chart2.data.labels.push(now);
chart2.data.datasets[0].data.push(d.kwh_day);

chart3.data.labels.push(now);
chart3.data.datasets[0].data.push(d.kwh_month);

if(chart1.data.labels.length>10){

chart1.data.labels.shift();
chart1.data.datasets[0].data.shift();

chart2.data.labels.shift();
chart2.data.datasets[0].data.shift();

chart3.data.labels.shift();
chart3.data.datasets[0].data.shift();

}

chart1.update();
chart2.update();
chart3.update();

});