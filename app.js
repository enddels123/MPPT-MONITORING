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

function $(id){
return document.getElementById(id);
}

function setText(id,val){

const el = $(id);

if(el){
el.innerText = val;
}

}

function num(v,d=1){
return Number(v || 0).toFixed(d);
}

/* =========================
GAUGE CREATE
========================= */

function createGauge(canvasId,maxValue,color){

return new Chart($(canvasId),{

type:'doughnut',

data:{
datasets:[{
data:[0,maxValue],
backgroundColor:[
color,
'rgba(255,255,255,.08)'
],
borderWidth:0,
cutout:'75%'
}]
},

options:{

responsive:true,

maintainAspectRatio:false,

rotation:-90,

circumference:180,

animation:{
animateRotate:true,
duration:700
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
GAUGE
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

setText('pvVoltage',
num(data.pv_v)+'V');

setText('pvCurrent',
num(data.pv_i)+'A');

setText('pvPower',
num(data.pv_p)+'W');

/* MPPT */

setText('mpptCharge',
num(data.charge_p)+'W');

setText('mpptEff',
num(data.mppt_eff)+'%');

/* BATTERY */

setText('batVoltage',
num(data.bat_v)+'V');

setText('batCurrent',
num(data.bat_i)+'A');

setText('batSoc',
num(data.soc)+'%');

/* ENERGY */

setText('dailyEnergy',
num(data.kwh_day,2)+' kWh');

setText('monthlyEnergy',
num(data.kwh_month,2)+' kWh');

/* SCADA */

setText('pvPowerScada',
num(data.pv_p,0)+'W');

setText('pvVoltScada',
num(data.pv_v)+'V | '+num(data.pv_i)+'A');

setText('mpptPowerScada',
num(data.charge_p,0)+'W');

setText('mpptEffScada',
num(data.mppt_eff,0)+'%');

setText('batSocScada',
num(data.soc,0)+'%');

setText('batVoltScada',
num(data.bat_v)+'V | '+num(data.bat_i)+'A');

setText('loadPowerScada',
num(data.load_p,0)+'W');

setText('loadVoltScada',
num(data.load_v)+'V | '+num(data.load_i)+'A');

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

const onlineText = $('onlineText');

const deviceStatus = $('deviceStatus');

if(online){

onlineText.innerText = 'ONLINE';
onlineText.style.color = '#7CFC00';

deviceStatus.innerText = 'DEVICE ACTIVE';

}else{

onlineText.innerText = 'OFFLINE';
onlineText.style.color = '#ff3b3b';

deviceStatus.innerText = 'DEVICE DISCONNECTED';

}

}

/* =========================
REALTIME FIREBASE
========================= */

db.ref('solar_monitor').on('value',(snapshot)=>{

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

let active = 0;

setInterval(()=>{

nodes.forEach((node,index)=>{

if(index === active){

node.setAttribute('fill','#00ffe5');
node.setAttribute('r','9');

}else{

node.setAttribute('fill','#00ff88');
node.setAttribute('r','6');

}

});

active++;

if(active >= nodes.length){
active = 0;
}

},350);