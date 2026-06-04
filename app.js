const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
'solar/jnge/hybrid';

client.on('connect',()=>{

document.getElementById(
'network'
).innerHTML='ONLINE';

client.subscribe(topic);

});

/* =====================================
UPDATE
===================================== */

function setText(id,val){

document.getElementById(id)
.innerHTML = val;
}

client.on('message',
(topic,message)=>{

const d =
JSON.parse(
message.toString()
);

/* STATUS */

if(d.flow_active){

setText(
'deviceStatus',
'DEVICE WORKING'
);

}else{

setText(
'deviceStatus',
'DEVICE SHUTDOWN'
);
}

/* PV */

setText(
'pvv',
d.pv_v.toFixed(1)+'V'
);

setText(
'pvi',
d.pv_i.toFixed(1)+'A'
);

setText(
'pvp',
d.pv_p.toFixed(1)+'W'
);

/* MPPT */

setText(
'cpp',
d.charge_p.toFixed(1)+'W'
);

setText(
'mpe',
d.mppt_eff.toFixed(1)+'%'
);

/* BAT */

setText(
'bvv',
d.bat_v.toFixed(1)+'V'
);

setText(
'bii',
d.bat_i.toFixed(1)+'A'
);

setText(
'socc',
d.soc.toFixed(0)+'%'
);

/* ENERGY */

setText(
'dayy',
d.kwh_day.toFixed(2)
+' kWh'
);

setText(
'monthh',
d.kwh_month.toFixed(2)
+' kWh'
);

/* SOC */

document.getElementById(
'socfill'
).style.width =
d.soc + '%';

});