/* =========================
   MQTT CONFIG
========================= */

const broker =
"wss://broker.emqx.io:8084/mqtt";

const topic =
"isokuiki/smartenergy";

/* =========================
   MQTT CONNECT
========================= */

const client = mqtt.connect(
broker,
{
connectTimeout:4000,
reconnectPeriod:2000,
clean:true
}
);

/* =========================
   STATUS
========================= */

const onlineText =
document.getElementById(
"onlineText"
);

const deviceStatus =
document.getElementById(
"deviceStatus"
);

/* =========================
   MQTT CONNECTED
========================= */

client.on(
"connect",
()=>{

console.log(
"MQTT Connected"
);

onlineText.innerHTML =
"ONLINE";

onlineText.classList.remove(
"offline-status"
);

onlineText.classList.add(
"online-status"
);

deviceStatus.innerHTML =
"DEVICE ACTIVE";

client.subscribe(topic);

}
);

/* =========================
   MQTT OFFLINE
========================= */

client.on(
"offline",
()=>{

onlineText.innerHTML =
"OFFLINE";

onlineText.classList.remove(
"online-status"
);

onlineText.classList.add(
"offline-status"
);

deviceStatus.innerHTML =
"RECONNECTING...";

}
);

/* =========================
   MQTT RECONNECT
========================= */

client.on(
"reconnect",
()=>{

deviceStatus.innerHTML =
"RECONNECTING MQTT...";

}
);

/* =========================
   MQTT ERROR
========================= */

client.on(
"error",
()=>{

onlineText.innerHTML =
"OFFLINE";

onlineText.classList.remove(
"online-status"
);

onlineText.classList.add(
"offline-status"
);

deviceStatus.innerHTML =
"MQTT ERROR";

}
);

/* =========================
   DATA VARIABLE
========================= */

let pvVoltage = 0;
let pvCurrent = 0;
let pvPower = 0;

let batteryVoltage = 0;
let batteryCurrent = 0;
let batterySoc = 0;

let mpptEfficiency = 0;

let dailyEnergy = 0;
let monthlyEnergy = 0;

/* =========================
   MQTT RECEIVE
========================= */

client.on(
"message",
(topic,message)=>{

try{

const data =
JSON.parse(
message.toString()
);

/* =========================
   DATA
========================= */

pvVoltage =
data.pv_voltage || 0;

pvCurrent =
data.pv_current || 0;

pvPower =
data.pv_power || 0;

batteryVoltage =
data.battery_voltage || 0;

batteryCurrent =
data.battery_current || 0;

batterySoc =
data.battery_soc || 0;

mpptEfficiency =
data.mppt_efficiency || 0;

dailyEnergy =
data.daily_energy || 0;

monthlyEnergy =
data.monthly_energy || 0;

/* =========================
   UPDATE UI
========================= */

updateUI();

}catch(err){

console.log(err);

}

}
);

/* =========================
   UPDATE UI
========================= */

function updateUI(){

/* =========================
   PHOTOVOLTAIC
========================= */

setText(
"pvVoltage",
pvVoltage.toFixed(1)+"V"
);

setText(
"pvCurrent",
pvCurrent.toFixed(1)+"A"
);

setText(
"pvPower",
pvPower.toFixed(0)+"W"
);

/* =========================
   MPPT
========================= */

setText(
"mpptCharge",
pvPower.toFixed(0)+"W"
);

setText(
"mpptEff",
mpptEfficiency.toFixed(0)+"%"
);

/* =========================
   BATTERY
========================= */

setText(
"batVoltage",
batteryVoltage.toFixed(1)+"V"
);

setText(
"batCurrent",
batteryCurrent.toFixed(1)+"A"
);

setText(
"batSoc",
batterySoc.toFixed(0)+"%"
);

/* =========================
   ENERGY
========================= */

setText(
"dailyEnergy",
dailyEnergy.toFixed(2)+" kWh"
);

setText(
"monthlyEnergy",
monthlyEnergy.toFixed(2)+" kWh"
);

/* =========================
   SCADA
========================= */

setText(
"pvPowerScada",
pvPower.toFixed(0)+"W"
);

setText(
"pvVoltScada",
pvVoltage.toFixed(1)+
"V | "+
pvCurrent.toFixed(1)+"A"
);

setText(
"mpptPowerScada",
pvPower.toFixed(0)+"W"
);

setText(
"mpptEffScada",
mpptEfficiency.toFixed(0)+"%"
);

setText(
"batSocScada",
batterySoc.toFixed(0)+"%"
);

setText(
"batVoltScada",
batteryVoltage.toFixed(1)+
"V | "+
batteryCurrent.toFixed(1)+"A"
);

setText(
"loadPowerScada",
pvPower.toFixed(0)+"W"
);

setText(
"loadVoltScada",
pvVoltage.toFixed(1)+
"V | "+
pvCurrent.toFixed(1)+"A"
);

/* =========================
   GAUGE UPDATE
========================= */

updateGauge(
gaugePV,
pvPower,
5000
);

updateGauge(
gaugeBattery,
batterySoc,
100
);

updateGauge(
gaugeMppt,
mpptEfficiency,
100
);

}

/* =========================
   SET TEXT
========================= */

function setText(id,value){

const el =
document.getElementById(id);

if(el){

el.innerHTML = value;

}

}

/* =========================
   GAUGE FUNCTION
========================= */

function createGauge(
canvasId,
value,
max,
label
){

return new Chart(
document.getElementById(canvasId),
{

type:"doughnut",

data:{
datasets:[{
data:[
value,
max-value
],
backgroundColor:[
"#00ffe5",
"#102b63"
],
borderWidth:0,
circumference:180,
rotation:270,
cutout:"75%"
}]
},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{
display:false
},

tooltip:{
enabled:false
}

}

},

plugins:[{

id:"gaugeText",

beforeDraw(chart){

const width =
chart.width;

const height =
chart.height;

const ctx =
chart.ctx;

ctx.restore();

ctx.font =
"bold 34px Orbitron";

ctx.fillStyle =
"#ffffff";

ctx.textAlign =
"center";

ctx.fillText(
label,
width/2,
height-20
);

ctx.save();

}

}]

}

);

}

/* =========================
   UPDATE GAUGE
========================= */

function updateGauge(
chart,
value,
max
){

chart.data.datasets[0].data = [
value,
max-value
];

chart.options.plugins.gaugeTextLabel =
value;

chart.config._config.plugins[0]
.beforeDraw = function(chart){

const width =
chart.width;

const height =
chart.height;

const ctx =
chart.ctx;

ctx.restore();

ctx.font =
"bold 34px Orbitron";

ctx.fillStyle =
"#ffffff";

ctx.textAlign =
"center";

ctx.fillText(
Math.round(value)+
(chart === gaugePV ? "W" : "%"),
width/2,
height-20
);

ctx.save();

};

chart.update();

}

/* =========================
   CREATE GAUGE
========================= */

const gaugePV =
createGauge(
"gauge1",
0,
5000,
"0W"
);

const gaugeBattery =
createGauge(
"gauge2",
0,
100,
"0%"
);

const gaugeMppt =
createGauge(
"gauge3",
0,
100,
"0%"
);

/* =========================
   FLOW NODE ANIMATION
========================= */

let p1 = 0;
let p2 = 0;
let p3 = 0;

function animateFlow(){

/* =========================
   PV -> MPPT
========================= */

p1 += 2;

if(p1 > 75){

p1 = 0;

}

document
.getElementById("n1")
.setAttribute(
"cy",
105 + p1
);

/* =========================
   MPPT -> BATTERY
========================= */

p2 += 2;

if(p2 > 150){

p2 = 0;

}

let x2,y2;

if(p2 <= 50){

x2 = 170 - p2;
y2 = 255;

}else{

x2 = 120;
y2 = 255 + (p2 - 50);

}

document
.getElementById("n2")
.setAttribute(
"cx",
x2
);

document
.getElementById("n2")
.setAttribute(
"cy",
y2
);

/* =========================
   MPPT -> LOAD
========================= */

p3 += 2;

if(p3 > 150){

p3 = 0;

}

let x3,y3;

if(p3 <= 50){

x3 = 170 + p3;
y3 = 255;

}else{

x3 = 220;
y3 = 255 + (p3 - 50);

}

document
.getElementById("n3")
.setAttribute(
"cx",
x3
);

document
.getElementById("n3")
.setAttribute(
"cy",
y3
);

requestAnimationFrame(
animateFlow
);

}

/* =========================
   START ANIMATION
========================= */

animateFlow();