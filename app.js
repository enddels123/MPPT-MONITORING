/* =========================
FIREBASE
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

const $ = (id) =>
document.getElementById(id);

function setText(id,val){

const el = $(id);

if(el){
el.innerHTML = val;
}

}

function num(v,d=1){

return Number(v || 0).toFixed(d);

}

/* =========================
CHART TEXT
========================= */

const gaugeText = {

id:'gaugeText',

beforeDraw(chart){

const {width,height,ctx} =
chart;

ctx.restore();

const value =
chart.config.data.datasets[0].data[0];

ctx.font =
'bold 22px Orbitron';

ctx.fillStyle =
'#00ffe5';

ctx.textAlign =
'center';

ctx.fillText(
Math.round(value),
width/2,
height/1.3
);

ctx.save();

}

};

Chart.register(gaugeText);

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

borderWidth:0

}]
},

options:{

responsive:true,

maintainAspectRatio:false,

rotation:-90,

circumference:180,

cutout:'78%',

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

const gauge1 =
createGauge(
'gauge1',
5000,
'#00ffe5'
);

const gauge2 =
createGauge(
'gauge2',
100,
'#7CFC00'
);

const gauge3 =
createGauge(
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

setText(
'mpptCharge',
num(data.charge_p)+'W'
);

setText(
'mpptEff',
num(data.mppt_eff)+'%'
);

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
FLOW NODE
========================= */

const svg =
document.getElementById(
'scadaSvg'
);

function createNode(color){

const node =
document.createElementNS(
"http://www.w3.org/2000/svg",
"circle"
);

node.setAttribute('r',6);

node.setAttribute(
'fill',
color
);

svg.appendChild(node);

return node;

}

const node1 =
createNode('#00ffe5');

const node2 =
createNode('#7CFC00');

const node3 =
createNode('#36a3ff');

/* =========================
FLOW PATH
========================= */

const path = [

{x:170,y:90},
{x:170,y:110},
{x:170,y:130},
{x:170,y:150},
{x:170,y:170},
{x:170,y:190},
{x:170,y:210},

{x:170,y:250},

{x:150,y:250},
{x:130,y:250},
{x:120,y:270},
{x:120,y:300},
{x:120,y:330},
{x:120,y:360},

{x:190,y:250},
{x:210,y:250},
{x:220,y:270},
{x:220,y:300},
{x:220,y:330},
{x:220,y:360}

];

let i1 = 0;
let i2 = 7;
let i3 = 14;

/* =========================
MOVE FLOW
========================= */

function animateFlow(){

node1.setAttribute(
'cx',
path[i1].x
);

node1.setAttribute(
'cy',
path[i1].y
);

node2.setAttribute(
'cx',
path[i2].x
);

node2.setAttribute(
'cy',
path[i2].y
);

node3.setAttribute(
'cx',
path[i3].x
);

node3.setAttribute(
'cy',
path[i3].y
);

i1++;
i2++;
i3++;

if(i1 >= path.length){
i1 = 0;
}

if(i2 >= path.length){
i2 = 0;
}

if(i3 >= path.length){
i3 = 0;
}

}

/* START */

animateFlow();

setInterval(
animateFlow,
120
);