/*************************************************
 ISOKUIKI INDUSTRIAL SCADA
 APP.JS FINAL V1
*************************************************/


/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {

  apiKey:"AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",

  authDomain:"isokuiki-scada.firebaseapp.com",

  databaseURL:"https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:"isokuiki-scada",

  storageBucket:"isokuiki-scada.firebasestorage.app",

  messagingSenderId:"1078745557059",

  appId:"1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();


/* =========================================
   UTIL
========================================= */

function val(v){

  if(v == null) return 0;

  v = parseFloat(v);

  if(isNaN(v)) return 0;

  if(v < 0) return 0;

  return v;
}

function setText(id,text){

  const el=document.getElementById(id);

  if(el) el.innerHTML=text;
}


/* =========================================
   STATUS
========================================= */

function setOnline(status){

  const online=document.getElementById("onlineText");

  if(!online) return;

  if(status){

    online.innerHTML="ONLINE";
    online.style.color="#00ff66";

    setText(
      "deviceStatus",
      "ESP32 + FIREBASE ACTIVE"
    );

  }else{

    online.innerHTML="OFFLINE";
    online.style.color="red";

    setText(
      "deviceStatus",
      "NO DATA"
    );

  }

}


/* =========================================
   GAUGE
========================================= */

function createGauge(id,max){

  return new Chart(
    document.getElementById(id),
    {

      type:'doughnut',

      data:{
        datasets:[{
          data:[0,max],
          borderWidth:0
        }]
      },

      options:{

        responsive:true,

        maintainAspectRatio:false,

        cutout:'82%',

        plugins:{
          legend:{display:false},
          tooltip:{enabled:false}
        }

      }

    }
  );

}

const gaugePV =
createGauge("gaugePV",1000);

const gaugeBAT =
createGauge("gaugeBAT",100);

const gaugeLOAD =
createGauge("gaugeLOAD",500);

const gaugeEFF =
createGauge("gaugeEFF",100);


/* =========================================
   REALTIME CHART
========================================= */

const realtimeChart = new Chart(

  document.getElementById("realtimeChart"),

  {

    type:'line',

    data:{

      labels:[],

      datasets:[

      {
        label:"PV Power",
        data:[],
        tension:0.3
      },

      {
        label:"Battery Voltage",
        data:[],
        tension:0.3
      },

      {
        label:"Load Power",
        data:[],
        tension:0.3
      }

      ]

    },

    options:{

      responsive:true

    }

  }

);


/* =========================================
   ENERGY CHART
========================================= */

const energyChart = new Chart(

  document.getElementById("energyChart"),

  {

    type:'bar',

    data:{

      labels:[
        "Today",
        "Month",
        "Total"
      ],

      datasets:[{

        label:"Energy kWh",

        data:[0,0,0]

      }]

    },

    options:{

      responsive:true

    }

  }

);


/* =========================================
   SOLAR
========================================= */

db.ref("solar")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  const voltage=val(d.voltage);
  const current=val(d.current);
  const power=val(d.power);

  setText(
    "pvPower",
    power.toFixed(0)+" W"
  );

  setText(
    "pvVoltage",
    voltage.toFixed(1)+" V"
  );

  setText(
    "pvCurrent",
    current.toFixed(2)+" A"
  );

  setText(
    "pvPowerScada",
    power.toFixed(0)+" W"
  );

  setText(
    "pvInfoScada",
    voltage.toFixed(1)
    +"V | "+
    current.toFixed(2)+"A"
  );

  gaugePV.data.datasets[0].data=[
    power,
    Math.max(0,1000-power)
  ];

  gaugePV.update();

});


/* =========================================
   BATTERY
========================================= */

db.ref("battery")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  const voltage=val(d.voltage);
  const current=val(d.current);
  const power=val(d.power);
  const soc=val(d.soc);

  setText(
    "batterySoc",
    soc.toFixed(0)+"%"
  );

  setText(
    "batteryVoltage",
    voltage.toFixed(2)+" V"
  );

  setText(
    "batteryCurrent",
    current.toFixed(2)+" A"
  );

  setText(
    "batterySocScada",
    soc.toFixed(0)+"%"
  );

  setText(
    "batteryInfoScada",
    voltage.toFixed(2)
    +"V | "+
    current.toFixed(2)+"A"
  );

  gaugeBAT.data.datasets[0].data=[
    soc,
    Math.max(0,100-soc)
  ];

  gaugeBAT.update();

});


/* =========================================
   LOAD
========================================= */

db.ref("load")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  const voltage=val(d.voltage);
  const current=val(d.current);
  const power=val(d.power);

  setText(
    "loadPower",
    power.toFixed(0)+" W"
  );

  setText(
    "loadVoltage",
    voltage.toFixed(1)+" V"
  );

  setText(
    "loadCurrent",
    current.toFixed(2)+" A"
  );

  setText(
    "loadPowerScada",
    power.toFixed(0)+" W"
  );

  setText(
    "loadInfoScada",
    voltage.toFixed(1)
    +"V | "+
    current.toFixed(2)+"A"
  );

  gaugeLOAD.data.datasets[0].data=[
    power,
    Math.max(0,500-power)
  ];

  gaugeLOAD.update();

});


/* =========================================
   MPPT
========================================= */

db.ref("mppt")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  const eff=val(d.efficiency);

  setText(
    "mpptEff",
    eff.toFixed(0)+"%"
  );

  setText(
    "mpptEffScada",
    eff.toFixed(0)+"%"
  );

  gaugeEFF.data.datasets[0].data=[
    eff,
    Math.max(0,100-eff)
  ];

  gaugeEFF.update();

});


/* =========================================
   ENERGY
========================================= */

db.ref("energy")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  const today=
  val(d.today_kwh);

  const month=
  val(d.month_kwh);

  const total=
  val(d.total_kwh);

  setText(
    "todayEnergy",
    today.toFixed(2)+" kWh"
  );

  setText(
    "monthEnergy",
    month.toFixed(2)+" kWh"
  );

  setText(
    "totalEnergy",
    total.toFixed(2)+" kWh"
  );

  energyChart.data.datasets[0].data=[
    today,
    month,
    total
  ];

  energyChart.update();

});


/* =========================================
   INCOME
========================================= */

db.ref("income")
.on("value",(snap)=>{

  if(!snap.exists()) return;

  const d=snap.val();

  setText(
    "todayIncome",
    "Rp "+
    val(d.today_rp).toFixed(0)
  );

  setText(
    "monthIncome",
    "Rp "+
    val(d.month_rp).toFixed(0)
  );

  setText(
    "totalIncome",
    "Rp "+
    val(d.total_rp).toFixed(0)
  );

});


/* =========================================
   SYSTEM
========================================= */

db.ref("system")
.on("value",(snap)=>{

  if(!snap.exists()){

    setOnline(false);
    return;
  }

  setOnline(true);

  const d=snap.val();

  setText(
    "wifiRSSI",
    d.wifi_rssi+" dBm"
  );

  setText(
    "systemHealth",
    d.health
  );

});


/* =========================================
   HISTORY REALTIME
========================================= */

setInterval(()=>{

  const now=
  new Date().toLocaleTimeString();

  const pv=
  parseFloat(
    document.getElementById("pvPower")
      ?.innerText
      ?.replace(" W","")
  ) || 0;

  const bat=
  parseFloat(
    document.getElementById("batteryVoltage")
      ?.innerText
      ?.replace(" V","")
  ) || 0;

  const load=
  parseFloat(
    document.getElementById("loadPower")
      ?.innerText
      ?.replace(" W","")
  ) || 0;

  realtimeChart.data.labels.push(now);

  realtimeChart.data.datasets[0].data.push(pv);

  realtimeChart.data.datasets[1].data.push(bat);

  realtimeChart.data.datasets[2].data.push(load);

  if(
    realtimeChart.data.labels.length > 30
  ){

    realtimeChart.data.labels.shift();

    realtimeChart.data.datasets[0].data.shift();

    realtimeChart.data.datasets[1].data.shift();

    realtimeChart.data.datasets[2].data.shift();

  }

  realtimeChart.update();

},3000);