const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt',
{
reconnectPeriod:2000,
connectTimeout:5000
});

const topic =
"solar/jnge/hybrid";

/* NETWORK */

const network =
document.getElementById(
'network_status'
);

/* MQTT */

client.on('connect',()=>{

network.innerHTML =
"ONLINE";

network.className =
"online";

client.subscribe(topic);
});

client.on('offline',()=>{

network.innerHTML =
"OFFLINE";

network.className =
"offline";
});

/* CHART */

function createChart(
canvas,
label,
color,
type='line'
){

return new Chart(
document.getElementById(canvas),
{

type:type,

data:{
labels:[],
datasets:[{
label:label,
data:[],
borderColor:color,
backgroundColor:color,
borderWidth:2,
tension:0.4
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}
});
}

const powerChart =
createChart(
'powerChart',
'PV Power',
'#00ff88'
);

const energyDayChart =
createChart(
'energyDayChart',
'Daily Energy',
'#00ffd5',
'bar'
);

const energyMonthChart =
createChart(
'energyMonthChart',
'Monthly Energy',
'#00aaff',
'bar'
);

function updateChart(
chart,
label,
value
){

chart.data.labels.push(label);

chart.data.datasets[0]
.data.push(value);

if(chart.data.labels.length>20){

chart.data.labels.shift();

chart.data.datasets[0]
.data.shift();
}

chart.update();
}

/* MQTT MESSAGE */

client.on(
'message',
(topic,message)=>{

const data =
JSON.parse(
message.toString()
);

/* LOCAL STORAGE */

localStorage.setItem(
"solarData",
JSON.stringify(data)
);

/* ALARM */

const alarm =
document.getElementById(
'alarm_box'
);

if(data.soc < 20){

alarm.style.display =
"block";

} else {

alarm.style.display =
"none";
}

/* DEVICE */

document.getElementById(
'device_box'
).innerHTML =

"DEVICE " +
data.device;

/* FLOW */

const pvFlow =
document.getElementById(
'pv_flow'
);

const batFlow =
document.getElementById(
'bat_flow'
);

const loadFlow =
document.getElementById(
'load_flow'
);

if(data.device=="SHUTDOWN"){

pvFlow.style.display="none";
batFlow.style.display="none";
loadFlow.style.display="none";

} else {

pvFlow.style.display="block";
batFlow.style.display="block";
loadFlow.style.display="block";
}

if(
data.battery_status==
"DISCHARGING"
){

batFlow.style.animationDirection =
"reverse";

} else {

batFlow.style.animationDirection =
"normal";
}

/* UPDATE */

document.getElementById('pv_v')
.innerHTML =
data.pv_v.toFixed(1)+" V";

document.getElementById('pv_i')
.innerHTML =
data.pv_i.toFixed(2)+" A";

document.getElementById('pv_p')
.innerHTML =
data.pv_p.toFixed(1)+" W";

document.getElementById('bat_v')
.innerHTML =
data.bat_v.toFixed(1)+" V";

document.getElementById('bat_i')
.innerHTML =
data.bat_i.toFixed(2)+" A";

document.getElementById('soc')
.innerHTML =
data.soc.toFixed(0)+" %";

document.getElementById('charge_p')
.innerHTML =
data.charge_p.toFixed(1)+" W";

document.getElementById('mppt_eff')
.innerHTML =
data.mppt_eff.toFixed(0)+" %";

document.getElementById('kwh_day')
.innerHTML =
data.kwh_day.toFixed(3)+" kWh";

document.getElementById('kwh_month')
.innerHTML =
data.kwh_month.toFixed(3)+" kWh";

document.getElementById('total_power')
.innerHTML =
data.pv_p.toFixed(1)+" W";

document.getElementById(
'battery_status'
).innerHTML =
data.battery_status;

document.getElementById(
'soc_fill'
).style.width =
data.soc + "%";

const time =
new Date()
.toLocaleTimeString();

updateChart(
powerChart,
time,
data.pv_p
);

updateChart(
energyDayChart,
time,
data.kwh_day
);

updateChart(
energyMonthChart,
time,
data.kwh_month
);
});