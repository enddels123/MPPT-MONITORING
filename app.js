/* =========================================================
   MQTT CONFIG
========================================================= */

const topic = "solar/jnge/hybrid";

const client = mqtt.connect(
  "wss://broker.hivemq.com:8884/mqtt",
  {
    reconnectPeriod: 3000,
    connectTimeout: 10000,
    clean: true
  }
);

/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

  apiKey: "AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",

  authDomain:
  "isokuiki-scada.firebaseapp.com",

  databaseURL:
  "https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
  "isokuiki-scada",

  storageBucket:
  "isokuiki-scada.firebasestorage.app",

  messagingSenderId:
  "1078745557059",

  appId:
  "1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

/* INIT FIREBASE */

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/* =========================================================
   CHART GLOBAL STYLE
========================================================= */

Chart.defaults.color = "#ffffff";

Chart.defaults.borderColor =
"rgba(0,255,255,0.08)";

/* =========================================================
   MULTI GAUGE CREATOR
========================================================= */

function createGauge(id, color){

  return new Chart(
    document.getElementById(id),
    {
      type:'doughnut',

      data:{
        datasets:[{
          data:[0,100],
          backgroundColor:[
            color,
            '#112244'
          ],
          borderWidth:0,
          borderRadius:20
        }]
      },

      options:{

        responsive:true,

        maintainAspectRatio:false,

        cutout:'78%',

        plugins:{
          legend:{display:false},
          tooltip:{enabled:false}
        },

        animation:{
          duration:600
        }
      }
    }
  );
}

/* =========================================================
   GAUGES
========================================================= */

const pvGauge =
createGauge(
  'gaugePV',
  '#00ffe1'
);

const batteryGauge =
createGauge(
  'gaugeBattery',
  '#00ff88'
);

const mpptGauge =
createGauge(
  'gaugeMPPT',
  '#00aaff'
);

/* =========================================================
   LINE CHART
========================================================= */

function createLineChart(id,color,label){

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
          color + '22',

          borderWidth:3,

          fill:true,

          tension:0.4,

          pointRadius:0

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
              color:'#aaa',
              maxTicksLimit:5
            },
            grid:{
              color:'rgba(255,255,255,0.03)'
            }
          },

          y:{
            ticks:{
              color:'#aaa'
            },
            grid:{
              color:'rgba(255,255,255,0.03)'
            }
          }
        }
      }
    }
  );
}

/* =========================================================
   CHARTS
========================================================= */

const chartPV =
createLineChart(
  'chartPV',
  '#00ffe1',
  'PV Power'
);

const chartDay =
createLineChart(
  'chartDay',
  '#00ff88',
  'Daily kWh'
);

const chartMonth =
createLineChart(
  'chartMonth',
  '#00aaff',
  'Monthly kWh'
);

/* =========================================================
   FLOW NODE ANIMATION
========================================================= */

let flow1 = 0;
let flow2 = 0;
let flow3 = 0;

function animateFlow(){

  flow1 += 1.5;
  flow2 += 1.2;
  flow3 += 1.2;

  const n1 =
  document.getElementById("node1");

  const n2 =
  document.getElementById("node2");

  const n3 =
  document.getElementById("node3");

  /* PV -> MPPT */

  const y1 =
  120 + (flow1 % 120);

  n1.style.transform =
  `translate(-50%, ${y1}px)`;

  /* MPPT -> BATTERY */

  const x2 =
  -120 + (flow2 % 120);

  n2.style.transform =
  `translate(${x2}px,-50%)`;

  /* MPPT -> ENERGY */

  const x3 =
  flow3 % 120;

  n3.style.transform =
  `translate(${x3}px,-50%)`;

  requestAnimationFrame(
    animateFlow
  );
}

animateFlow();

/* =========================================================
   MQTT CONNECT
========================================================= */

client.on(
  "connect",
  ()=>{

    console.log("MQTT CONNECTED");

    client.subscribe(topic);

    document.getElementById(
      "onlineText"
    ).innerHTML = "ONLINE";

    document.getElementById(
      "onlineText"
    ).style.color = "#00ff88";
  }
);

/* =========================================================
   MQTT RECONNECT
========================================================= */

client.on(
  "reconnect",
  ()=>{

    console.log("MQTT RECONNECTING");
  }
);

client.on(
  "offline",
  ()=>{

    document.getElementById(
      "onlineText"
    ).innerHTML = "OFFLINE";

    document.getElementById(
      "onlineText"
    ).style.color = "#ff4444";
  }
);

/* =========================================================
   UPDATE UI
========================================================= */

client.on(
  "message",
  (topic,message)=>{

    const d =
    JSON.parse(
      message.toString()
    );

    /* =====================================================
       SAVE FIREBASE HISTORY
    ===================================================== */

    db.ref("history").push({

      time:Date.now(),

      pv_v:d.pv_v,
      pv_i:d.pv_i,
      pv_p:d.pv_p,

      bat_v:d.bat_v,
      bat_i:d.bat_i,

      soc:d.soc,

      mppt_eff:d.mppt_eff,

      kwh_day:d.kwh_day,
      kwh_month:d.kwh_month,

      status:d.status
    });

    /* =====================================================
       DEVICE STATUS
    ===================================================== */

    const device =
    document.getElementById(
      "deviceStatus"
    );

    if(
      d.status === "CHARGING"
    ){

      device.innerHTML =
      "DEVICE WORKING";

      device.style.borderColor =
      "#00ff88";

    } else {

      device.innerHTML =
      "DEVICE SHUTDOWN";

      device.style.borderColor =
      "#ff4444";
    }

    /* =====================================================
       TEXT DATA
    ===================================================== */

    const set = (id,val)=>
    document.getElementById(id)
    .innerHTML = val;

    set("pvv", d.pv_v+" V");
    set("pvi", d.pv_i+" A");
    set("pvp", d.pv_p+" W");

    set("charge", d.charge_p+" W");
    set("eff", d.mppt_eff+" %");

    set("bv", d.bat_v+" V");
    set("bi", d.bat_i+" A");
    set("soc", d.soc+" %");

    set("day", d.kwh_day.toFixed(2));
    set("month", d.kwh_month.toFixed(2));

    /* =====================================================
       SCADA CIRCLE DATA
    ===================================================== */

    set("pvVolt", d.pv_v+"V");
    set("pvAmp", d.pv_i+"A");
    set("pvPower", d.pv_p+"W");

    set("mpptW", d.charge_p+"W");
    set("mpptEff", d.mppt_eff+"%");

    set("batVolt", d.bat_v+"V");
    set("batAmp", d.bat_i+"A");
    set("batSoc", d.soc+"%");

    set("kwhDay", d.kwh_day.toFixed(2));
    set("kwhMonth", d.kwh_month.toFixed(2));

    /* =====================================================
       GAUGE UPDATE
    ===================================================== */

    pvGauge.data.datasets[0].data = [
      d.pv_p,
      Math.max(1,5000-d.pv_p)
    ];

    batteryGauge.data.datasets[0].data = [
      d.soc,
      100-d.soc
    ];

    mpptGauge.data.datasets[0].data = [
      d.mppt_eff,
      100-d.mppt_eff
    ];

    pvGauge.update();
    batteryGauge.update();
    mpptGauge.update();

    /* =====================================================
       CHART UPDATE
    ===================================================== */

    const now =
    new Date()
    .toLocaleTimeString();

    function pushChart(
      chart,
      value
    ){

      chart.data.labels.push(now);

      chart.data.datasets[0]
      .data.push(value);

      if(
        chart.data.labels.length > 20
      ){

        chart.data.labels.shift();

        chart.data.datasets[0]
        .data.shift();
      }

      chart.update();
    }

    pushChart(
      chartPV,
      d.pv_p
    );

    pushChart(
      chartDay,
      d.kwh_day
    );

    pushChart(
      chartMonth,
      d.kwh_month
    );
  }
);