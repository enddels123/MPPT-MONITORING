/*************************************************
 ISOKUIKI FINAL SCADA
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
   UPDATE
========================================= */

function updateText(id,val){

  const el = document.getElementById(id);

  if(el){

    el.innerHTML = val;

  }

}


/* =========================================
   ONLINE STATUS
========================================= */

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
   FILTER
========================================= */

function filterZero(v){

  if(v < 0)
    return 0;

  return v;

}


/* =========================================
   REALTIME
========================================= */

db.ref("solar_monitor")
.on("value",(snapshot)=>{

  if(snapshot.exists()){

    setOnline(true);

    const d = snapshot.val();


    let pvVoltage =
      filterZero(
        parseFloat(d.pv_voltage || 0)
      );

    let pvCurrent =
      filterZero(
        parseFloat(d.pv_current || 0)
      );

    let pvPower =
      filterZero(
        parseFloat(d.pv_power || 0)
      );

    let batteryVoltage =
      filterZero(
        parseFloat(d.battery_voltage || 0)
      );

    let batteryCurrent =
      filterZero(
        parseFloat(d.battery_current || 0)
      );

    let batterySOC =
      filterZero(
        parseFloat(d.battery_soc || 0)
      );

    let loadVoltage =
      filterZero(
        parseFloat(d.load_voltage || 0)
      );

    let loadCurrent =
      filterZero(
        parseFloat(d.load_current || 0)
      );

    let loadPower =
      filterZero(
        parseFloat(d.load_power || 0)
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
       MPPT
    ===================================== */

    let mpptEff = 0;

    if(pvPower > 0){

      mpptEff =
        (loadPower / pvPower) * 100;

      if(mpptEff > 100)
        mpptEff = 98;

    }


    /* =====================================
       PANEL
    ===================================== */

    updateText(
      "pvPower",
      pvPower.toFixed(0)+"W"
    );

    updateText(
      "pvVoltage",
      pvVoltage.toFixed(1)+"V"
    );

    updateText(
      "pvCurrent",
      pvCurrent.toFixed(1)+"A"
    );



    updateText(
      "batSoc",
      batterySOC.toFixed(0)+"%"
    );

    updateText(
      "batVoltage",
      batteryVoltage.toFixed(2)+"V"
    );

    updateText(
      "batCurrent",
      batteryCurrent.toFixed(2)+"A"
    );



    updateText(
      "mpptEff",
      mpptEff.toFixed(0)+"%"
    );

    updateText(
      "mpptCharge",
      loadPower.toFixed(0)+"W"
    );


    /* =====================================
       SCADA
    ===================================== */

    updateText(
      "pvPowerScada",
      pvPower.toFixed(0)+"W"
    );

    updateText(
      "pvVoltScada",
      pvVoltage.toFixed(1)
      +"V | "+
      pvCurrent.toFixed(1)+"A"
    );



    updateText(
      "mpptPowerScada",
      loadPower.toFixed(0)+"W"
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
      batteryVoltage.toFixed(2)
      +"V | "+
      batteryCurrent.toFixed(2)+"A"
    );



    updateText(
      "loadPowerScada",
      loadPower.toFixed(0)+"W"
    );

    updateText(
      "loadVoltScada",
      loadVoltage.toFixed(1)
      +"V | "+
      loadCurrent.toFixed(1)+"A"
    );


    /* =====================================
       GAUGE
    ===================================== */

    gaugePV.data.datasets[0].data = [
      pvPower,
      1000-pvPower
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

    if(historyChart.data.labels.length > 20){

      historyChart.data.labels.shift();

      historyChart.data.datasets[0]
      .data.shift();

      historyChart.data.datasets[1]
      .data.shift();

    }

    historyChart.update();

  }

  else{

    setOnline(false);

  }

});