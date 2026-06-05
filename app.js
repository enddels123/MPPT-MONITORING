const client = mqtt.connect(
  "wss://broker.hivemq.com:8884/mqtt"
);

const topic = "solar/jnge/hybrid";

/* =========================
   FIREBASE
========================= */

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
  "isokuiki-scada.firebasestorage.app",

  messagingSenderId:
  "1078745557059",

  appId:
  "1:1078745557059:web:0f465f1a8a2ddf20dd8cf6"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/* =========================
   GAUGE TEXT
========================= */

const gaugeTextPlugin = {

  id:'gaugeText',

  afterDraw(chart){

    const meta =
    chart.getDatasetMeta(0);

    if(!meta.data.length) return;

    const x = meta.data[0].x;
    const y = meta.data[0].y;

    const value =
    chart.config.data.datasets[0].data[0];

    const ctx = chart.ctx;

    ctx.save();

    ctx.fillStyle='#ffffff';

    ctx.textAlign='center';

    ctx.font='bold 26px Orbitron';

    ctx.fillText(
      value + chart.options.unit,
      x,
      y + 10
    );

    ctx.restore();

  }

};

Chart.register(gaugeTextPlugin);

/* =========================
   CREATE GAUGE
========================= */

function createGauge(
  id,
  color,
  max,
  unit
){

  return new Chart(

    document.getElementById(id),

    {

      type:'doughnut',

      data:{
        datasets:[{

          data:[0,max],

          backgroundColor:[
            color,
            '#132544'
          ],

          borderWidth:0,

          borderRadius:10

        }]
      },

      options:{

        responsive:true,

        maintainAspectRatio:false,

        cutout:'78%',

        rotation:-90,

        circumference:180,

        unit:unit,

        plugins:{

          legend:{
            display:false
          },

          tooltip:{
            enabled:false
          }

        }

      }

    }

  );

}

/* =========================
   GAUGE
========================= */

const gauge1 =
createGauge(
  'gauge1',
  '#00ffe1',
  5000,
  'W'
);

const gauge2 =
createGauge(
  'gauge2',
  '#00ff88',
  100,
  '%'
);

const gauge3 =
createGauge(
  'gauge3',
  '#00aaff',
  100,
  '%'
);

/* =========================
   FLOW NODE
========================= */

let p1 = 0;
let p2 = 0;
let p3 = 0;

function animateFlow(){

  p1 = (p1 + 2) % 100;

  p2 = (p2 + 2) % 260;

  p3 = (p3 + 2) % 260;

  document
  .getElementById("n1")
  .setAttribute(
    "transform",
    `translate(200 ${140+p1})`
  );

  let x2,y2;

  if(p2 < 90){

    x2 = 200 - p2;
    y2 = 355;

  }else{

    x2 = 110;
    y2 = 355 + (p2 - 90);

  }

  document
  .getElementById("n2")
  .setAttribute(
    "transform",
    `translate(${x2} ${y2})`
  );

  let x3,y3;

  if(p3 < 90){

    x3 = 200 + p3;
    y3 = 355;

  }else{

    x3 = 290;
    y3 = 355 + (p3 - 90);

  }

  document
  .getElementById("n3")
  .setAttribute(
    "transform",
    `translate(${x3} ${y3})`
  );

  requestAnimationFrame(
    animateFlow
  );

}

animateFlow();

/* =========================
   MQTT CONNECT
========================= */

client.on('connect',()=>{

  client.subscribe(topic);

  const online =
  document.getElementById(
    'onlineText'
  );

  online.innerHTML='ONLINE';

  online.classList.remove(
    'offline-status'
  );

  online.classList.add(
    'online-status'
  );

  console.log(
    "MQTT CONNECTED"
  );

});

client.on('reconnect',()=>{

  console.log(
    "MQTT RECONNECT..."
  );

});

client.on('offline',()=>{

  const online =
  document.getElementById(
    'onlineText'
  );

  online.innerHTML='OFFLINE';

  online.classList.remove(
    'online-status'
  );

  online.classList.add(
    'offline-status'
  );

});

client.on('error',(err)=>{

  console.log(err);

});

/* =========================
   MQTT MESSAGE
========================= */

client.on(
  'message',
  (topic,message)=>{

    const d =
    JSON.parse(
      message.toString()
    );

    /* FIREBASE SAVE */

    db.ref('history').push({

      time:Date.now(),

      ...d

    });

    /* STATUS */

    document
    .getElementById(
      'deviceStatus'
    )
    .innerHTML =

    d.status === "WORKING"

    ? "DEVICE WORKING"

    : "DEVICE SHUTDOWN";

    /* DATA PANEL */

    document
    .getElementById('pvv')
    .innerHTML =
    d.pv_v + "V";

    document
    .getElementById('pvi')
    .innerHTML =
    d.pv_i + "A";

    document
    .getElementById('pvp')
    .innerHTML =
    d.pv_p + "W";

    document
    .getElementById('charge')
    .innerHTML =
    d.charge_p + "W";

    document
    .getElementById('eff')
    .innerHTML =
    d.mppt_eff + "%";

    document
    .getElementById('bv')
    .innerHTML =
    d.bat_v + "V";

    document
    .getElementById('bi')
    .innerHTML =
    d.bat_i + "A";

    document
    .getElementById('soc')
    .innerHTML =
    d.soc + "%";

    document
    .getElementById('day')
    .innerHTML =
    d.kwh_day + " kWh";

    document
    .getElementById('month')
    .innerHTML =
    d.kwh_month + " kWh";

    /* =========================
       SCADA
    ========================= */

    document
    .getElementById(
      'pvPowerScada'
    )
    .textContent =
    d.pv_p + "W";

    document
    .getElementById(
      'pvVoltScada'
    )
    .textContent =
    d.pv_v + "V | " +
    d.pv_i + "A";

    document
    .getElementById(
      'mpptPowerScada'
    )
    .textContent =
    d.charge_p + "W";

    document
    .getElementById(
      'mpptEffScada'
    )
    .textContent =
    d.mppt_eff + "%";

    document
    .getElementById(
      'batSocScada'
    )
    .textContent =
    d.soc + "%";

    document
    .getElementById(
      'batVoltScada'
    )
    .textContent =
    d.bat_v + "V | " +
    d.bat_i + "A";

    document
    .getElementById(
      'loadPowerScada'
    )
    .textContent =
    d.load_p + "W";

    document
    .getElementById(
      'loadVoltScada'
    )
    .textContent =
    d.load_v + "V | " +
    d.load_i + "A";

    /* =========================
       GAUGE
    ========================= */

    gauge1.data.datasets[0].data = [

      d.pv_p,

      Math.max(
        0,
        5000 - d.pv_p
      )

    ];

    gauge2.data.datasets[0].data = [

      d.soc,

      100 - d.soc

    ];

    gauge3.data.datasets[0].data = [

      d.mppt_eff,

      100 - d.mppt_eff

    ];

    gauge1.update();

    gauge2.update();

    gauge3.update();

  }

);