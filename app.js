const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
'solar/jnge/hybrid';

/* ========================================= */

client.on('connect',()=>{

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

const d=
JSON.parse(
message.toString()
);

/* ========================================= */

setText(
'device_box',
d.pv_p>5
?
'DEVICE WORKING'
:
'DEVICE SHUTDOWN'
);

/* ========================================= */

updateCharts(d);

});

/* ========================================= */

function setText(id,val){

document
.getElementById(id)
.innerHTML=val;
}

/* ========================================= */

const powerChart=
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
borderWidth:2,
tension:0.4
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}
}
);

/* ========================================= */

const dayChart=
new Chart(
document.getElementById(
'energyDayChart'
),
{
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
maintainAspectRatio:false
}
}
);

/* ========================================= */

const monthChart=
new Chart(
document.getElementById(
'energyMonthChart'
),
{
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
maintainAspectRatio:false
}
}
);

/* ========================================= */

function updateCharts(d){

const now=
new Date();

const time=
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
>20
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