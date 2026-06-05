const firebaseConfig = {
apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
authDomain:"isokuiki-scada.firebaseapp.com",
databaseURL:"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"isokuiki-scada"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const $ = (id) => document.getElementById(id);

function setText(id, value){
const el = $(id);
if(el) el.innerText = value;
}

function num(v, d = 1){
return Number(v || 0).toFixed(d);
}

/* =========================
GAUGE CONFIG
========================= */

function gaugeConfig(label, max){

return {
type:'doughnut',

data:{
labels:[label,'Empty'],
datasets:[{
data:[0,max],
borderWidth:0
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
rotation:-90,
circumference:180,

plugins:{
legend:{
display:false
}
}
}
};

}

/* =========================
CREATE GAUGE
========================= */

const gauge1 = new Chart(
document.getElementById('gauge1'),
gaugeConfig('PV', 5000)
);

const gauge2 = new Chart(
document.getElementById('gauge2'),
gaugeConfig('SOC', 100)
);

const gauge3 = new Chart(
document.getElementById('gauge3'),
gaugeConfig('EFF', 100)
);

/* =========================
UPDATE GAUGE
========================= */

function updateGauge(chart, val, max){

chart.data.datasets[0].data = [
val,
Math.max(max - val, 0)
];

chart.update();

}

/* =========================
UPDATE UI
========================= */

function updateUI(data){

/* =========================
PV
========================= */

setText('pvVoltage', num(data.pv_v) + 'V');
setText('pvCurrent', num(data.pv_i) + 'A');
setText('pvPower', num(data.pv_p) + 'W');

/* =========================
MPPT
========================= */

setText('mpptCharge', num(data.charge_p) + 'W');
setText('mpptEff', num(data.mppt_eff) + '%');

/* =========================
BATTERY
========================= */

setText('batVoltage', num(data.bat_v) + 'V');
setText('batCurrent', num(data.bat_i) + 'A');
setText('batSoc', num(data.soc) + '%');

/* =========================
ENERGY
========================= */

setText('dailyEnergy', num(data.kwh_day,2) + ' kWh');
setText('monthlyEnergy', num(data.kwh_month,2) + ' kWh');

/* =========================
SCADA
========================= */

setText('pvPowerScada', num(data.pv_p,0) + 'W');

setText(
'pvVoltScada',
num(data.pv_v) + 'V | ' +
num(data.pv_i) + 'A'
);

setText(
'mpptPowerScada',
num(data.charge_p,0) + 'W'
);

setText(
'mpptEffScada',
num(data.mppt_eff,0) + '%'
);

setText(
'batSocScada',
num(data.soc,0) + '%'
);

setText(
'batVoltScada',
num(data.bat_v) + 'V | ' +
num(data.bat_i) + 'A'
);

setText(
'loadPowerScada',
num(data.load_p,0) + 'W'
);

setText(
'loadVoltScada',
num(data.load_v) + 'V | ' +
num(data.load_i) + 'A'
);

/* =========================
GAUGE UPDATE
========================= */

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

/* =========================
ONLINE STATUS
========================= */

const online =
(Date.now() - (data.timestamp || 0)) < 15000;

const onlineText = $('onlineText');
const deviceStatus = $('deviceStatus');

onlineText.innerText =
online ? 'ONLINE' : 'OFFLINE';

onlineText.style.color =
online ? '#7CFC00' : '#ff4d4d';

deviceStatus.innerText =
online ?
'DEVICE ACTIVE' :
'DEVICE DISCONNECTED';

}

/* =========================
FIREBASE REALTIME
========================= */

db.ref('solar_monitor').on('value', (snapshot)=>{

const data = snapshot.val();

if(data){
updateUI(data);
}

});

/* =========================
FLOW NODE ANIMATION
========================= */

let pos = 0;

setInterval(()=>{

const nodes = [
document.getElementById('n1'),
document.getElementById('n2'),
document.getElementById('n3')
];

nodes.forEach((n,i)=>{

if(i === pos){

n.setAttribute('fill','#00ffe5');
n.setAttribute('r','7');

}else{

n.setAttribute('fill','#00ff88');
n.setAttribute('r','5');

}

});

pos++;

if(pos >= nodes.length){
pos = 0;
}

},500);