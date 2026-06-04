/* =========================================
MQTT CONFIG
========================================= */

const broker =
"wss://broker.hivemq.com:8884/mqtt";

const topic =
"solar/jnge/hybrid";

/* =========================================
MQTT CONNECT
========================================= */

const client =
mqtt.connect(broker);

/* =========================================
DATA ARRAY
========================================= */

let powerData = [];
let labelData = [];

let energyDayData = [];
let energyMonthData = [];

let energyLabel = [];

/* =========================================
CHART POWER
========================================= */

const powerChart = new Chart(

document.getElementById(
"powerChart"
),

{
type:"line",

data:{

labels:labelData,

datasets:[{

label:"PV Power (W)",

data:powerData,

borderColor:"#00ffd5",

backgroundColor:
"rgba(0,255,200,0.15)",

fill:true,

tension:0.4

}]
},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

labels:{
color:"white"
}
}
},

scales:{

x:{
ticks:{
color:"white"
}
},

y:{
ticks:{
color:"white"
}
}
}
}
});

/* =========================================
CHART DAILY
========================================= */

const energyDayChart = new Chart(

document.getElementById(
"energyDayChart"
),

{
type:"bar",

data:{

labels:energyLabel,

datasets:[{

label:"Daily kWh",

data:energyDayData,

backgroundColor:
"rgba(0,255,120,0.6)"

}]
},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

labels:{
color:"white"
}
}
},

scales:{

x:{
ticks:{
color:"white"
}
},

y:{
ticks:{
color:"white"
}
}
}
}
});

/* =========================================
CHART MONTHLY
========================================= */

const energyMonthChart = new Chart(

document.getElementById(
"energyMonthChart"
),

{
type:"bar",

data:{

labels:energyLabel,

datasets:[{

label:"Monthly kWh",

data:energyMonthData,

backgroundColor:
"rgba(0,180,255,0.6)"

}]
},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

labels:{
color:"white"
}
}
},

scales:{

x:{
ticks:{
color:"white"
}
},

y:{
ticks:{
color:"white"
}
}
}
}
});

/* =========================================
HELPER
========================================= */

function setText(id,val){

document.getElementById(id)
.innerHTML = val;
}

function setFlow(state){

const flows = [

"pv_flow",
"split_flow",
"bat_flow",
"load_flow"

];

flows.forEach(id=>{

const el =
document.getElementById(id);

if(state){

el.style.display = "block";

}else{

el.style.display = "none";
}
});
}

/* =========================================
MQTT CONNECTED
========================================= */

client.on(
"connect",

()=>{

console.log(
"MQTT CONNECTED"
);

setText(
"network_status",
"ONLINE"
);

document
.getElementById(
"network_status"
)
.className =
"online";

client.subscribe(topic);

}
);

/* =========================================
MQTT ERROR
========================================= */

client.on(
"offline",

()=>{

setText(
"network_status",
"OFFLINE"
);

document
.getElementById(
"network_status"
)
.className =
"offline";

}
);

/* =========================================
MQTT MESSAGE
========================================= */

client.on(
"message",

(topic,message)=>{

const data =
JSON.parse(
message.toString()
);

/* =========================================
PV
========================================= */

setText(
"pv_v",
data.pv_v.toFixed(1)+" V"
);

setText(
"pv_i",
data.pv_i.toFixed(1)+" A"
);

setText(
"pv_p",
data.pv_p.toFixed(0)+" W"
);

/* CIRCLE */

setText(
"pv_v_circle",
data.pv_v.toFixed(0)+"V"
);

setText(
"pv_i_circle",
data.pv_i.toFixed(0)+"A"
);

setText(
"pv_p_circle",
data.pv_p.toFixed(0)+"W"
);

/* =========================================
MPPT
========================================= */

setText(
"charge_p",
data.charge_p.toFixed(0)+" W"
);

setText(
"mppt_eff",
data.mppt_eff.toFixed(0)+" %"
);

setText(
"mppt_power_circle",
data.charge_p.toFixed(0)+"W"
);

setText(
"mppt_eff_circle",
data.mppt_eff.toFixed(0)+"%"
);

/* =========================================
BATTERY
========================================= */

setText(
"bat_v",
data.bat_v.toFixed(1)+" V"
);

setText(
"bat_i",
data.bat_i.toFixed(1)+" A"
);

setText(
"soc",
data.soc.toFixed(0)+" %"
);

setText(
"bat_v_circle",
data.bat_v.toFixed(0)+"V"
);

setText(
"bat_i_circle",
data.bat_i.toFixed(0)+"A"
);

setText(
"soc_circle",
data.soc.toFixed(0)+"%"
);

document
.getElementById(
"soc_fill"
)
.style.width =
data.soc+"%";

/* BATTERY STATUS */

setText(
"battery_status",
data.battery_status
);

/* =========================================
ENERGY
========================================= */

setText(
"kwh_day",
data.kwh_day.toFixed(2)
);

setText(
"kwh_month",
data.kwh_month.toFixed(2)
);

setText(
"energy_day_circle",
data.kwh_day.toFixed(1)
);

/* =========================================
DEVICE
========================================= */

const deviceBox =
document.getElementById(
"device_box"
);

if(
data.device ==
"WORKING"
){

deviceBox.innerHTML =
"DEVICE WORKING";

deviceBox.style.border =
"4px solid #00ff88";

deviceBox.style.boxShadow =
"0 0 35px rgba(0,255,140,0.4)";

setFlow(true);

}
else{

deviceBox.innerHTML =
"DEVICE SHUTDOWN";

deviceBox.style.border =
"4px solid #ff4444";

deviceBox.style.boxShadow =
"0 0 35px rgba(255,0,0,0.35)";

setFlow(false);
}

/* =========================================
BATTERY FLOW DIRECTION
========================================= */

const batFlow =
document.getElementById(
"bat_flow"
);

if(
data.battery_status ==
"DISCHARGING"
){

batFlow.style.animationDirection =
"reverse";

}
else{

batFlow.style.animationDirection =
"normal";
}

/* =========================================
CHART UPDATE
========================================= */

const now =
new Date()
.toLocaleTimeString();

/* POWER */

labelData.push(now);

powerData.push(
data.pv_p
);

if(labelData.length > 20){

labelData.shift();
powerData.shift();
}

powerChart.update();

/* ENERGY */

energyLabel.push(now);

energyDayData.push(
data.kwh_day
);

energyMonthData.push(
data.kwh_month
);

if(energyLabel.length > 20){

energyLabel.shift();

energyDayData.shift();

energyMonthData.shift();
}

energyDayChart.update();

energyMonthChart.update();

}
);

/* =========================================
AUTO RECONNECT WATCHDOG
========================================= */

setInterval(()=>{

if(
!client.connected
){

location.reload();
}

},30000);