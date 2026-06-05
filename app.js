/* =========================
FIREBASE
========================= */

const firebaseConfig = {

apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
authDomain:"isokuiki-scada.firebaseapp.com",
databaseURL:"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

projectId: "isokuiki-scada"

};

/* =========================
FIREBASE CONFIG
========================= */

const firebaseConfig = {

apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
authDomain:"isokuiki-scada.firebaseapp.com",
databaseURL:"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "isokuiki-scada"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/* =========================
SHORTCUT
========================= */

const $ = (id) => document.getElementById(id);

function setText(id, value){

const el = $(id);

if(el){
el.innerHTML = value;
}

}

function num(v, d = 1){
return Number(v || 0).toFixed(d);
}

/* =========================
CHART PLUGIN TEXT
========================= */

const gaugeTextPlugin = {

id: 'gaugeText',

beforeDraw(chart){

const { width, height, ctx } = chart;

ctx.restore();

const value =
chart.config.data.datasets[0].data[0];

ctx.font = "bold 22px Orbitron";

ctx.fillStyle = "#00ffe5";

ctx.textAlign = "center";

ctx.fillText(
Math.round(value),
width / 2,
height / 1.3
);

ctx.save();

}

};

Chart.register(gaugeTextPlugin);

/* =========================
CREATE GAUGE
========================= */

function createGauge(id,max,color){

return new Chart($(id),{

type:'doughnut',

data:{
datasets:[{

data:[0,max],

backgroundColor:[
color,
'rgba(255,255,255,.08)'
],

borderWidth:0,

hoverOffset:0

}]
},

options:{

responsive:true,

maintainAspectRatio:false,

cutout:'78%',

rotation:-90,

circumference:180,

animation:{
duration:800
},

plugins:{

legend:{
display:false
},

tooltip:{
enabled:false
}

}

}

});

}

/* =========================
GAUGE INIT
========================= */

const gauge1 = createGauge(
'gauge1',
5000,
'#00ffe5'
);

const gauge2 = createGauge(
'gauge2',
100,
'#7CFC00'
);

const gauge3 = createGauge(
'gauge3',
100,
'#36a3ff'
);

/* =========================
UPDATE GAUGE
========================= */

function updateGauge(chart,val,max){

chart.data.datasets[0].data = [
val,
Math.max(max-val,0)
];

chart.update();

}

/* =========================
UPDATE UI
========================= */

function updateUI(data){

/* PV */

setText(
'pvVoltage',
num(data.pv_v)+'V'
);

setText(
'pvCurrent',
num(data.pv_i)+'A'
);

setText(
'pvPower',
num(data.pv_p)+'W'
);

/* MPPT */

setText(
'mpptCharge',
num(data.charge_p)+'W'
);

setText(
'mpptEff',
num(data.mppt_eff)+'%'
);

/* BATTERY */

setText(
'batVoltage',
num(data.bat_v)+'V'
);

setText(
'batCurrent',
num(data.bat_i)+'A'
);

setText(
'batSoc',
num(data.soc)+'%'
);

/* ENERGY */

setText(
'dailyEnergy',
num(data.kwh_day,2)+' kWh'
);

setText(
'monthlyEnergy',
num(data.kwh_month,2)+' kWh'
);

/* SCADA */

setText(
'pvPowerScada',
num(data.pv_p,0)+'W'
);

setText(
'pvVoltScada',
num(data.pv_v)+'V | '+num(data.pv_i)+'A'
);

setText(
'mpptPowerScada',
num(data.charge_p,0)+'W'
);

setText(
'mpptEffScada',
num(data.mppt_eff,0)+'%'
);

setText(
'batSocScada',
num(data.soc,0)+'%'
);

setText(
'batVoltScada',
num(data.bat_v)+'V | '+num(data.bat_i)+'A'
);

setText(
'loadPowerScada',
num(data.load_p,0)+'W'
);

setText(
'loadVoltScada',
num(data.load_v)+'V | '+num(data.load_i)+'A'
);

/* UPDATE GAUGE */

updateGauge(
gauge1,
Math.min(data.pv_p,5000),
5000
);

updateGauge(
gauge2,
Math.min(data.soc,100),
100
);

updateGauge(
gauge3,
Math.min(data.mppt_eff,100),
100
);

/* ONLINE STATUS */

const online =
(Date.now() - data.timestamp) < 15000;

if(online){

$('onlineText').innerHTML = 'ONLINE';
$('onlineText').style.color = '#7CFC00';

$('deviceStatus').innerHTML =
'DEVICE ACTIVE';

}else{

$('onlineText').innerHTML = 'OFFLINE';
$('onlineText').style.color = '#ff3b3b';

$('deviceStatus').innerHTML =
'DEVICE DISCONNECTED';

}

}

/* =========================
FIREBASE REALTIME
========================= */

db.ref('solar_monitor')
.on('value',(snapshot)=>{

const data = snapshot.val();

if(data){

updateUI(data);

}

});

/* =========================
SCADA NODE ANIMATION
========================= */

const nodes = [

$('n1'),
$('n2'),
$('n3')

];

let activeNode = 0;

function animateNodes(){

nodes.forEach((node,index)=>{

if(index === activeNode){

node.setAttribute(
'fill',
'#00ffe5'
);

node.setAttribute(
'r',
'10'
);

}else{

node.setAttribute(
'fill',
'#00ff88'
);

node.setAttribute(
'r',
'6'
);

}

});

activeNode++;

if(activeNode >= nodes.length){

activeNode = 0;

}

}

/* START NODE */

setInterval(
animateNodes,
300
);