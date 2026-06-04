```javascript
const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
'solar/jnge/hybrid';

const network =
document.getElementById(
'network'
);

const deviceStatus =
document.getElementById(
'deviceStatus'
);

client.on('connect',()=>{

network.innerHTML='ONLINE';

network.className='online';

client.subscribe(topic);

});

client.on('offline',()=>{

network.innerHTML='OFFLINE';

network.className='offline';

});

function setValue(id,val){

document.getElementById(id)
.innerHTML=val;
}

client.on('message',
(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* STATUS */

if(d.flow_active){

deviceStatus.innerHTML=
'DEVICE WORKING';

}else{

deviceStatus.innerHTML=
'DEVICE SHUTDOWN';
}

/* PV */

setValue('pv_v',
d.pv_v.toFixed(1)+'V');

setValue('pv_i',
d.pv_i.toFixed(1)+'A');

setValue('pv_p',
d.pv_p.toFixed(1)+'W');

setValue('pvv',
d.pv_v.toFixed(1)+'V');

setValue('pvi',
d.pv_i.toFixed(1)+'A');

setValue('pvp',
d.pv_p.toFixed(1)+'W');

/* MPPT */

setValue('charge_p',
d.charge_p.toFixed(1)+'W');

setValue('mppt_eff',
d.mppt_eff.toFixed(1)+'%');

setValue('cpp',
d.charge_p.toFixed(1)+'W');

setValue('mpe',
d.mppt_eff.toFixed(1)+'%');

/* BAT */

setValue('bat_v',
d.bat_v.toFixed(1)+'V');

setValue('bat_i',
d.bat_i.toFixed(1)+'A');

setValue('soc',
d.soc.toFixed(0)+'%');

setValue('bvv',
d.bat_v.toFixed(1)+'V');

setValue('bii',
d.bat_i.toFixed(1)+'A');

setValue('socc',
d.soc.toFixed(0)+'%');

/* ENERGY */

setValue('kwh_day',
d.kwh_day.toFixed(2));

setValue('kwh_month',
d.kwh_month.toFixed(2));

setValue('dayy',
d.kwh_day.toFixed(2)+' kWh');

setValue('monthh',
d.kwh_month.toFixed(2)+' kWh');

/* SOC */

document.getElementById(
'soc_fill'
).style.width =
d.soc + '%';

/* CHART */

updateCharts(d);

});

/* ======================================
CHART
====================================== */

function createChart(
id,
label,
color
){

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

backgroundColor:
color+'22',

fill:true,

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
ticks:{
color:'#fff'
}
},

y:{
ticks:{
color:'#fff'
}
}
}
}
});
}

const powerChart =
createChart(
'powerChart',
'PV Power',
'#00ffe1'
);

const dayChart =
createChart(
'dayChart',
'Daily kWh',
'#00ff88'
);

const monthChart =
createChart(
'monthChart',
'Monthly kWh',
'#00aaff'
);

function updateCharts(d){

const time =
new Date()
.toLocaleTimeString();

addData(
powerChart,
time,
d.pv_p
);

addData(
dayChart,
time,
d.kwh_day
);

addData(
monthChart,
time,
d.kwh_month
);
}

function addData(
chart,
label,
data
){

chart.data.labels.push(label);

chart.data.datasets[0]
.data.push(data);

if(
chart.data.labels.length > 10
){

chart.data.labels.shift();

chart.data.datasets[0]
.data.shift();
}

chart.update();
}
```
