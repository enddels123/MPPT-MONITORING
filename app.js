/* =========================================================
MQTT
========================================================= */

const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
'solar/jnge/hybrid';

/* =========================================================
DOM
========================================================= */

const network =
document.getElementById(
'network'
);

const deviceStatus =
document.getElementById(
'deviceStatus'
);

const socFill =
document.getElementById(
'soc_fill'
);

/* =========================================================
ONLINE
========================================================= */

client.on('connect',()=>{

network.innerHTML='ONLINE';

network.className='online';

client.subscribe(topic);

});

/* =========================================================
OFFLINE
========================================================= */

client.on('offline',()=>{

network.innerHTML='OFFLINE';

network.className='offline';

});

/* =========================================================
MESSAGE
========================================================= */

client.on('message',
(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* =========================================================
DEVICE STATUS
========================================================= */

if(d.flow_active){

deviceStatus.innerHTML=
'DEVICE WORKING';

deviceStatus.style.borderColor=
'#00ff99';

deviceStatus.style.boxShadow=
'0 0 20px #00ff99';

}else{

deviceStatus.innerHTML=
'DEVICE SHUTDOWN';

deviceStatus.style.borderColor=
'#ff4444';

deviceStatus.style.boxShadow=
'0 0 20px #ff4444';
}

/* =========================================================
PV
========================================================= */

setValue(
'pv_v',
d.pv_v.toFixed(1)+' V'
);

setValue(
'pv_i',
d.pv_i.toFixed(1)+' A'
);

setValue(
'pv_p',
d.pv_p.toFixed(1)+' W'
);

/* =========================================================
MPPT
========================================================= */

setValue(
'charge_p',
d.charge_p.toFixed(1)+' W'
);

setValue(
'mppt_eff',
d.mppt_eff.toFixed(1)+' %'
);

/* =========================================================
BATTERY
========================================================= */

setValue(
'bat_v',
d.bat_v.toFixed(1)+' V'
);

setValue(
'bat_i',
d.bat_i.toFixed(1)+' A'
);

setValue(
'soc',
d.soc.toFixed(0)+' %'
);

socFill.style.width=
d.soc+'%';

/* =========================================================
ENERGY
========================================================= */

setValue(
'kwh_day',
d.kwh_day.toFixed(2)+' kWh'
);

setValue(
'kwh_month',
d.kwh_month.toFixed(2)+' kWh'
);

/* =========================================================
FLOW ACTIVE
========================================================= */

const dots =
document.querySelectorAll(
'.flow-dot'
);

dots.forEach(dot=>{

if(d.flow_active){

dot.style.opacity=1;

}else{

dot.style.opacity=.2;
}
});

/* =========================================================
UPDATE CHART
========================================================= */

updateCharts(d);

});

/* =========================================================
SET VALUE
========================================================= */

function setValue(id,val){

document
.getElementById(id)
.innerHTML=val;
}

/* =========================================================
CHART POWER
========================================================= */

const powerChart =
new Chart(

document.getElementById(
'powerChart'
),

{

type:'line',

data:{

labels:[],

datasets:[{

label:'PV Power',

data:[],

borderColor:'#00ffd5',

backgroundColor:
'rgba(0,255,213,.15)',

fill:true,

tension:.4,

borderWidth:2

}]
},

options:chartOptions('W')

});

/* =========================================================
DAY CHART
========================================================= */

const dayChart =
new Chart(

document.getElementById(
'dayChart'
),

{

type:'bar',

data:{

labels:['DAY'],

datasets:[{

label:'Daily kWh',

data:[0],

backgroundColor:'#00ff88'

}]
},

options:chartOptions('kWh')

});

/* =========================================================
MONTH CHART
========================================================= */

const monthChart =
new Chart(

document.getElementById(
'monthChart'
),

{

type:'bar',

data:{

labels:['MONTH'],

datasets:[{

label:'Monthly kWh',

data:[0],

backgroundColor:'#00aaff'

}]
},

options:chartOptions('kWh')

});

/* =========================================================
CHART OPTIONS
========================================================= */

function chartOptions(unit){

return{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

labels:{

color:'#fff',

font:{
family:'Orbitron'
}
}
}
},

scales:{

x:{

ticks:{
color:'#fff'
},

grid:{
color:'rgba(255,255,255,.05)'
}
},

y:{

ticks:{
color:'#fff'
},

grid:{
color:'rgba(255,255,255,.05)'
}
}
}
}
}

/* =========================================================
UPDATE CHART
========================================================= */

function updateCharts(d){

const now =
new Date();

const time =
now.getHours()+
':' +
now.getMinutes();

/* POWER */

powerChart.data.labels.push(time);

powerChart.data.datasets[0]
.data.push(d.pv_p);

if(
powerChart.data.labels.length
>20
){

powerChart.data.labels.shift();

powerChart.data.datasets[0]
.data.shift();
}

powerChart.update();

/* DAY */

dayChart.data.datasets[0]
.data[0]=d.kwh_day;

dayChart.update();

/* MONTH */

monthChart.data.datasets[0]
.data[0]=d.kwh_month;

monthChart.update();
}