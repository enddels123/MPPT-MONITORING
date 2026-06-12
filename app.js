/*************************************************
 ISOKUIKI FINAL SCADA V2
 Compatible:
 - ESP32 Recovery
 - ESP32 Final
 - Firebase RTDB New Structure
*************************************************/

/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {

  apiKey: "AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
  authDomain: "isokuiki-scada.firebaseapp.com",
  databaseURL: "https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "isokuiki-scada",
  storageBucket: "isokuiki-scada.firebasestorage.app",
  messagingSenderId: "1078745557059",
  appId: "1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/* =========================================
   GAUGE
========================================= */

function createGauge(id,max){

  return new Chart(document.getElementById(id),{

    type:'doughnut',

    data:{
      datasets:[{
        data:[0,max],
        borderWidth:0,
        backgroundColor:[
          '#00ffe5',
          '#16304a'
        ]
      }]
    },

    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:'78%',
      plugins:{
        legend:{display:false},
        tooltip:{enabled:false}
      }
    }

  });

}

const gaugePV   = createGauge('gauge1',1000);
const gaugeBAT  = createGauge('gauge2',100);
const gaugeMPPT = createGauge('gauge3',100);

/* =========================================
   HISTORY
========================================= */

const historyChart = new Chart(

  document.getElementById('historyChart'),

  {

    type:'line',

    data:{

      labels:[],

      datasets:[

        {
          label:'Battery Voltage',
          data:[],
          tension:0.4
        },

        {
          label:'PV Power',
          data:[],
          tension:0.4
        }

      ]

    },

    options:{

      responsive:true,

      maintainAspectRatio:true

    }

  }

);

/* =========================================
   UTIL
========================================= */

function filterZero(v){

  if(isNaN(v)) return 0;

  if(v < 0) return 0;

  return v;

}

function updateText(id,val){

  const el=document.getElementById(id);

  if(el) el.innerHTML=val;

}

function setOnline(status){

  if(status){

    updateText("onlineText","ONLINE");

    document.getElementById("onlineText")
      .style.color="#7CFC00";

    updateText(
      "deviceStatus",
      "ESP32 + EW11 ACTIVE"
    );

  }else{

    updateText("onlineText","OFFLINE");

    document.getElementById("onlineText")
      .style.color="red";

    updateText(
      "deviceStatus",
      "NO DATA"
    );

  }

}

/* =========================================
   ENERGY FLOW
========================================= */

function updateFlow(pvPower,loadPower){

  const flowPV = document.getElementById("flowPV");
  const flowBAT = document.getElementById("flowBAT");

  if(flowPV){

    if(pvPower > 5){

      flowPV.classList.add("active");

    }else{

      flowPV.classList.remove("active");

    }

  }

  if(flowBAT){

    if(loadPower > 1){

      flowBAT.classList.add("active");

    }else{

      flowBAT.classList.remove("active");

    }

  }

}

/* =========================================
   REALTIME FIREBASE
========================================= */

db.ref("/")
.on("value",(snapshot)=>{

  if(!snapshot.exists()){

    setOnline(false);

    return;

  }

  const root = snapshot.val() || {};

  const solar   = root.solar || {};
  const battery = root.battery || {};
  const load    = root.load || {};
  const mppt    = root.mppt || {};
  const system  = root.system || {};

  setOnline(system.online === 1);

  /* =====================================
     SOLAR
  ===================================== */

  let pvVoltage =
    filterZero(
      parseFloat(solar.voltage || 0)
    );

  let pvCurrent =
    filterZero(
      parseFloat(solar.current || 0)
    );

  let pvPower =
    filterZero(
      parseFloat(solar.power || 0)
    );

  /* =====================================
     BATTERY
  ===================================== */

  let batteryVoltage =
    filterZero(
      parseFloat(battery.voltage || 0)
    );

  let batteryCurrent =
    filterZero(
      parseFloat(battery.current || 0)
    );

  let batteryPower =
    filterZero(
      parseFloat(battery.power || 0)
    );

  let batterySOC =
    filterZero(
      parseFloat(battery.soc || 0)
    );

  /* =====================================
     LOAD
  ===================================== */

  let loadVoltage =
    filterZero(
      parseFloat(load.voltage || 0)
    );

  let loadCurrent =
    filterZero(
      parseFloat(load.current || 0)
    );

  let loadPower =
    filterZero(
      parseFloat(load.power || 0)
    );

  /* =====================================
     MPPT
  ===================================== */

  let mpptEff =
    filterZero(
      parseFloat(mppt.efficiency || 0)
    );

  /* =====================================
     FILTER MALAM
  ===================================== */

  if(pvVoltage < 5){

    pvVoltage = 0;
    pvCurrent = 0;
    pvPower   = 0;

  }

  /* =====================================
     AUTO MPPT CALC
  ===================================== */

  if(mpptEff <= 0){

    if(pvPower > 1){

      mpptEff =
        (batteryPower / pvPower) * 100;

      if(mpptEff > 98)
        mpptEff = 98;

    }

  }

  /* =====================================
     PANEL
  ===================================== */

  updateText("pvPower",pvPower.toFixed(0)+"W");
  updateText("pvVoltage",pvVoltage.toFixed(1)+"V");
  updateText("pvCurrent",pvCurrent.toFixed(1)+"A");

  updateText("batSoc",batterySOC.toFixed(0)+"%");
  updateText("batVoltage",batteryVoltage.toFixed(2)+"V");
  updateText("batCurrent",batteryCurrent.toFixed(2)+"A");

  updateText("mpptEff",mpptEff.toFixed(0)+"%");
  updateText("mpptCharge",batteryPower.toFixed(0)+"W");

  /* =====================================
     SCADA
  ===================================== */

  updateText("pvPowerScada",pvPower.toFixed(0)+"W");

  updateText(
    "pvVoltScada",
    pvVoltage.toFixed(1)+"V | "+
    pvCurrent.toFixed(1)+"A"
  );

  updateText(
    "mpptPowerScada",
    batteryPower.toFixed(0)+"W"
  );

  updateText(
    "mpptEffScada",
    mpptEff.toFixed(0)+"%"
  );

  updateText(
    "batSocScada",
    batterySOC.toFixed(0)+"%"
  );

  updateText(
    "batVoltScada",
    batteryVoltage.toFixed(2)+"V | "+
    batteryCurrent.toFixed(2)+"A"
  );

  updateText(
    "loadPowerScada",
    loadPower.toFixed(0)+"W"
  );

  updateText(
    "loadVoltScada",
    loadVoltage.toFixed(1)+"V | "+
    loadCurrent.toFixed(2)+"A"
  );

  /* =====================================
     FLOW
  ===================================== */

  updateFlow(
    pvPower,
    loadPower
  );

  /* =====================================
     GAUGE
  ===================================== */

  let pvGaugeValue = pvPower;

  if(pvGaugeValue > 1000)
    pvGaugeValue = 1000;

  gaugePV.data.datasets[0].data = [
    pvGaugeValue,
    1000-pvGaugeValue
  ];

  gaugePV.update();

  gaugeBAT.data.datasets[0].data = [
    batterySOC,
    100-batterySOC
  ];

  gaugeBAT.update();

  gaugeMPPT.data.datasets[0].data = [
    mpptEff,
    100-mpptEff
  ];

  gaugeMPPT.update();

  /* =====================================
     HISTORY
  ===================================== */

  const now =
    new Date().toLocaleTimeString();

  historyChart.data.labels.push(now);

  historyChart.data.datasets[0]
    .data.push(batteryVoltage);

  historyChart.data.datasets[1]
    .data.push(pvPower);

  if(historyChart.data.labels.length > 30){

    historyChart.data.labels.shift();

    historyChart.data.datasets[0]
      .data.shift();

    historyChart.data.datasets[1]
      .data.shift();

  }

  historyChart.update();

});
