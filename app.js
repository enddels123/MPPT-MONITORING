const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
'solar/jnge/hybrid';

/* =========================================
MQTT
========================================= */

client.on('connect', ()=>{

console.log('MQTT Connected');

client.subscribe(topic);

document
.getElementById(
'network_status'
)
.innerHTML='ONLINE';

document
.getElementById(
'network_status'
)
.className='online';
});

/* ========================================= */

client.on('message',
(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* =========================================
TEXT DATA
========================================= */

setText('pv_v',
d.pv_v.toFixed(1)+' V');

setText('pv_i',
d.pv_i.toFixed(1)+' A');

setText('pv_p',
d.pv_p.toFixed(1)+' W');

setText('bat_v',
d.bat_v.toFixed(1)+' V');

setText('bat_i',
d.bat_i.toFixed(1)+' A');

setText('soc',
d.soc.toFixed(0)+' %');

setText('charge_p',
d.charge_p.toFixed(1)+' W');

setText('mppt_eff',
d.mppt_eff.toFixed(1)+' %');

setText('kwh_day',
d.kwh_day.toFixed(2));

setText('kwh_month',
d.kwh_month.toFixed(2));

setText('battery_status',
d.status);

/* =========================================
SCADA CIRCLE
========================================= */

setText('pv_v_circle',
d.pv_v.toFixed(0)+'V');

setText('pv_i_circle',
d.pv_i.toFixed(0)+'A');

setText('pv_p_circle',
d.pv_p.toFixed(0)+'W');

setText('bat_v_circle',
d.bat_v.toFixed(0)+'V');

setText('bat_i_circle',
d.bat_i.toFixed(0)+'A');

setText('soc_circle',
d.soc.toFixed(0)+'%');

setText('mppt_power_circle',
d.charge_p.toFixed(0)+'W');

setText('mppt_eff_circle',
d.mppt_eff.toFixed(0)+'%');

setText('energy_day_circle',
d.kwh_day.toFixed(1));

/* =========================================
SOC BAR
========================================= */

document
.getElementById(
'soc_fill'
)
.style.width=
d.soc+'%';

/* =========================================
DEVICE STATUS
========================================= */

const box =
document.getElementById(
'device_box'
);

if(d.pv_p > 5){

box.innerHTML =
'DEVICE WORKING';

box.style.borderColor =
'#00ff88';

}else{

box.innerHTML =
'DEVICE SHUTDOWN';

box.style.borderColor =
'#ff4444';
}

/* =========================================
CHART
========================================= */

updateCharts(d);

});

/* ========================================= */

function setText(id,val){

document
.getElementById(id)
.innerHTML=val;
}

/* =========================================
CHART
========================================= */

const powerCtx =
document
.getElementById(
'powerChart'
);

const powerChart =
new Chart(powerCtx,{

type:'line',

data:{
labels:[],
datasets:[{
label:'PV Power',
data:[],
borderColor:'#00ffd5',
borderWidth:2,
tension:0.4
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'white'
}
}
},
scales:{
x:{
ticks:{
color:'white'
}
},
y:{
ticks:{
color:'white'
}
}
}
}
});

/* ========================================= */

const dayCtx =
document
.getElementById(
'energyDayChart'
);

const dayChart =
new Chart(dayCtx,{

type:'bar',

data:{
labels:['DAY'],
datasets:[{
label:'Daily kWh',
data:[0],
backgroundColor:'#00aa66'
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'white'
}
}
},
scales:{
x:{
ticks:{
color:'white'
}
},
y:{
ticks:{
color:'white'
}
}
}
}
});

/* ========================================= */

const monthCtx =
document
.getElementById(
'energyMonthChart'
);

const monthChart =
new Chart(monthCtx,{

type:'bar',

data:{
labels:['MONTH'],
datasets:[{
label:'Monthly kWh',
data:[0],
backgroundColor:'#0088cc'
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'white'
}
}
},
scales:{
x:{
ticks:{
color:'white'
}
},
y:{
ticks:{
color:'white'
}
}
}
}
});

/* ========================================= */

function updateCharts(d){

const now =
new Date();

const time =
now.getHours()+
':'+
now.getMinutes();

/* POWER */

powerChart
.data
.labels
.push(time);

powerChart
.data
.datasets[0]
.data
.push(d.pv_p);

if(
powerChart.data.labels.length
> 20
){

powerChart
.data
.labels
.shift();

powerChart
.data
.datasets[0]
.data
.shift();
}

powerChart.update();

/* DAY */

dayChart
.data
.datasets[0]
.data[0]
=
d.kwh_day;

dayChart.update();

/* MONTH */

monthChart
.data
.datasets[0]
.data[0]
=
d.kwh_month;

monthChart.update();
}