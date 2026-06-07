
import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getDatabase,
  ref,
  onValue

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

  apiKey:
  "AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",

  authDomain:
  "isokuiki-scada.firebaseapp.com",

  databaseURL:
  "https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
  "isokuiki-scada",

  storageBucket:
  "isokuiki-scada.appspot.com",

  messagingSenderId:
  "123456789",

  appId:
  "1:123456789:web:123456"

};

/* =========================================
   INIT FIREBASE
========================================= */

const app =
initializeApp(firebaseConfig);

const database =
getDatabase(app);

/* =========================================
   CHART DATA
========================================= */

const pvData = [];

const batteryData = [];

const labels = [];

/* =========================================
   PV CHART
========================================= */

const pvChart = new Chart(

  document.getElementById(
    "pvChart"
  ),

  {

    type:"line",

    data:{

      labels:labels,

      datasets:[{

        label:"PV Power",

        data:pvData,

        borderWidth:3,

        tension:0.4,

        fill:false

      }]

    },

    options:{

      responsive:true,

      maintainAspectRatio:false,

      scales:{

        y:{

          beginAtZero:true

        }

      }

    }

  }

);

/* =========================================
   BATTERY CHART
========================================= */

const batteryChart = new Chart(

  document.getElementById(
    "batteryChart"
  ),

  {

    type:"line",

    data:{

      labels:labels,

      datasets:[{

        label:"Battery Voltage",

        data:batteryData,

        borderWidth:3,

        tension:0.4,

        fill:false

      }]

    },

    options:{

      responsive:true,

      maintainAspectRatio:false,

      scales:{

        y:{

          beginAtZero:false

        }

      }

    }

  }

);

/* =========================================
   FORMAT NUMBER
========================================= */

function safeValue(val){

  if(
    val == null ||
    isNaN(val)
  ){

    return 0;

  }

  return val;
}

/* =========================================
   UPDATE TEXT
========================================= */

function setText(id, value){

  const el =
  document.getElementById(id);

  if(el){

    el.innerText = value;

  }

}

/* =========================================
   FIREBASE REALTIME
========================================= */

onValue(

  ref(database, "/solar_monitor"),

  (snapshot)=>{

    const data =
    snapshot.val();

    if(!data){

      console.log(
        "NO DATA"
      );

      return;

    }

    /* =========================
       SAFE DATA
    ========================= */

    const pvVoltage =
    safeValue(
      data.pv_voltage
    );

    const pvCurrent =
    safeValue(
      data.pv_current
    );

    const pvPower =
    safeValue(
      data.pv_power
    );

    const batteryVoltage =
    safeValue(
      data.battery_voltage
    );

    const batteryCurrent =
    safeValue(
      data.battery_current
    );

    const batteryPower =
    safeValue(
      data.battery_power
    );

    const batterySOC =
    safeValue(
      data.battery_soc
    );

    const loadVoltage =
    safeValue(
      data.load_voltage
    );

    const loadCurrent =
    safeValue(
      data.load_current
    );

    const loadPower =
    safeValue(
      data.load_power
    );

    const mpptEfficiency =
    safeValue(
      data.mppt_efficiency
    );

    /* =========================
       PV
    ========================= */

    setText(

      "pvVoltage",

      pvVoltage.toFixed(1)
      + " V"

    );

    setText(

      "pvCurrent",

      pvCurrent.toFixed(1)
      + " A"

    );

    setText(

      "pvPower",

      pvPower.toFixed(0)
      + " W"

    );

    /* =========================
       BATTERY
    ========================= */

    setText(

      "batteryVoltage",

      batteryVoltage.toFixed(1)
      + " V"

    );

    setText(

      "batteryCurrent",

      batteryCurrent.toFixed(1)
      + " A"

    );

    setText(

      "batteryPower",

      batteryPower.toFixed(0)
      + " W"

    );

    setText(

      "batterySOC",

      batterySOC.toFixed(0)
      + " %"

    );

    /* =========================
       LOAD
    ========================= */

    setText(

      "loadVoltage",

      loadVoltage.toFixed(1)
      + " V"

    );

    setText(

      "loadCurrent",

      loadCurrent.toFixed(1)
      + " A"

    );

    setText(

      "loadPower",

      loadPower.toFixed(0)
      + " W"

    );

    /* =========================
       MPPT
    ========================= */

    setText(

      "mpptEfficiency",

      mpptEfficiency.toFixed(0)
      + " %"

    );

    /* =========================
       NODE FLOW
    ========================= */

    setText(

      "solarNode",

      pvPower.toFixed(0)
      + "W"

    );

    setText(

      "mpptNode",

      mpptEfficiency.toFixed(0)
      + "%"

    );

    setText(

      "batteryNode",

      batterySOC.toFixed(0)
      + "%"

    );

    setText(

      "loadNode",

      loadPower.toFixed(0)
      + "W"

    );

    /* =========================
       STATUS
    ========================= */

    const status =
    document.getElementById(
      "systemStatus"
    );

    if(status){

      if(data.online == 1){

        status.innerText =
        "ONLINE";

        status.style.background =
        "#16a34a";

      }else{

        status.innerText =
        "OFFLINE";

        status.style.background =
        "#dc2626";

      }

    }

    /* =========================
       REALTIME CHART
    ========================= */

    const now =
    new Date()
    .toLocaleTimeString();

    labels.push(now);

    pvData.push(pvPower);

    batteryData.push(
      batteryVoltage
    );

    /*
       LIMIT HISTORY
    */

    if(labels.length > 20){

      labels.shift();

      pvData.shift();

      batteryData.shift();

    }

    pvChart.update();

    batteryChart.update();

    console.log(
      "Realtime Update OK"
    );

  }

);

