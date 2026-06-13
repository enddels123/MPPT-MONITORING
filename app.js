/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

  apiKey: "AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",

  authDomain:
    "isokuiki-scada.firebaseapp.com",

  databaseURL:
    "https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "isokuiki-scada"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/* =========================================
   SHORTCUT
========================================= */

const $ = (id) =>
  document.getElementById(id);

function setText(id, value) {

  const el = $(id);

  if (el)
    el.innerHTML = value;

}

function num(v, d = 1) {

  return Number(v || 0)
    .toFixed(d);

}

/* =========================================
   ONLINE STATUS
========================================= */

let lastFirebaseUpdate =
  Date.now();

setInterval(() => {

  const diff =
    Date.now() -
    lastFirebaseUpdate;

  if (diff > 15000) {

    setText(
      "onlineText",
      "OFFLINE"
    );

    $("onlineText").style.color =
      "#ff3b3b";

    setText(
      "deviceStatus",
      "NO DATA"
    );

  } else {

    setText(
      "onlineText",
      "ONLINE"
    );

    $("onlineText").style.color =
      "#7CFC00";

    setText(
      "deviceStatus",
      "DEVICE ACTIVE"
    );

  }

}, 2000);

/* =========================================
   CHART TEXT PLUGIN
========================================= */

const gaugeText = {

  id: 'gaugeText',

  beforeDraw(chart) {

    const {
      width,
      height,
      ctx
    } = chart;

    ctx.restore();

    const value =
      chart.data.datasets[0]
      .data[0];

    ctx.font =
      'bold 22px Orbitron';

    ctx.fillStyle =
      '#00ffe5';

    ctx.textAlign =
      'center';

    ctx.fillText(
      Math.round(value),
      width / 2,
      height / 1.25
    );

    ctx.save();

  }

};

Chart.register(gaugeText);

/* =========================================
   CREATE GAUGE
========================================= */

function createGauge(
  id,
  max,
  color
) {

  return new Chart(
    $(id),
    {

      type: 'doughnut',

      data: {

        datasets: [{

          data: [0, max],

          backgroundColor: [

            color,

            'rgba(255,255,255,.08)'

          ],

          borderWidth: 0

        }]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        rotation: -90,

        circumference: 180,

        cutout: '78%',

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            enabled: false
          }

        }

      }

    }

  );

}

/* =========================================
   INIT GAUGE
========================================= */

const gaugePV =
  createGauge(
    'gauge1',
    5000,
    '#00ffe5'
  );

const gaugeSOC =
  createGauge(
    'gauge2',
    100,
    '#7CFC00'
  );

const gaugeEFF =
  createGauge(
    'gauge3',
    100,
    '#36a3ff'
  );

/* =========================================
   UPDATE GAUGE
========================================= */

function updateGauge(
  chart,
  value,
  max
) {

  chart.data.datasets[0].data = [

    value,

    Math.max(
      max - value,
      0
    )

  ];

  chart.update(
    'none'
  );

}

/* =========================================
   UPDATE UI
========================================= */

function updateUI(data) {

  const solar =
    data.solar || {};

  const battery =
    data.battery || {};

  const load =
    data.load || {};

  const mppt =
    data.mppt || {};

  const energy =
    data.energy || {};

  const income =
    data.income || {};

  const system =
    data.system || {};

  /* PV */

  setText(
    "pvVoltage",
    num(solar.voltage) + "V"
  );

  setText(
    "pvCurrent",
    num(solar.current) + "A"
  );

  setText(
    "pvPower",
    num(solar.power) + "W"
  );

  /* MPPT */

  setText(
    "mpptCharge",
    num(mppt.charge_power) + "W"
  );

  setText(
    "mpptEff",
    num(mppt.efficiency) + "%"
  );

  /* BATTERY */

  setText(
    "batVoltage",
    num(battery.voltage) + "V"
  );

  setText(
    "batCurrent",
    num(battery.current) + "A"
  );

  setText(
    "batSoc",
    num(battery.soc) + "%"
  );

  /* SCADA */

  setText(
    "pvPowerScada",
    num(solar.power, 0) + "W"
  );

  setText(
    "pvVoltScada",

    num(solar.voltage) +
    "V | " +

    num(solar.current) +
    "A"

  );

  setText(
    "mpptPowerScada",
    num(mppt.charge_power, 0) + "W"
  );

  setText(
    "mpptEffScada",
    num(mppt.efficiency, 0) + "%"
  );

  setText(
    "batSocScada",
    num(battery.soc, 0) + "%"
  );

  setText(
    "batVoltScada",

    num(battery.voltage) +
    "V | " +

    num(battery.current) +
    "A"

  );

  setText(
    "loadPowerScada",
    num(load.power, 0) + "W"
  );

  setText(
    "loadVoltScada",

    num(load.voltage) +
    "V | " +

    num(load.current) +
    "A"

  );

  /* ENERGY */

  setText(
    "todayKwh",
    num(
      energy.today_kwh,
      3
    ) + " kWh"
  );

  setText(
    "monthKwh",
    num(
      energy.month_kwh,
      3
    ) + " kWh"
  );

  setText(
    "totalKwh",
    num(
      energy.total_kwh,
      3
    ) + " kWh"
  );

  /* INCOME */

  setText(
    "todayRp",

    "Rp " +

    Number(
      income.today_rp || 0
    ).toLocaleString()

  );

  setText(
    "monthRp",

    "Rp " +

    Number(
      income.month_rp || 0
    ).toLocaleString()

  );

  setText(
    "totalRp",

    "Rp " +

    Number(
      income.total_rp || 0
    ).toLocaleString()

  );

  /* SYSTEM */

  setText(
    "wifiRssi",
    system.wifi_rssi || 0
  );

  setText(
    "healthStatus",
    system.health || "NORMAL"
  );

  setText(
    "lastUpdate",
    system.last_update || 0
  );

  /* GAUGE */

  updateGauge(

    gaugePV,

    Math.min(
      solar.power || 0,
      5000
    ),

    5000

  );

  updateGauge(

    gaugeSOC,

    Math.min(
      battery.soc || 0,
      100
    ),

    100

  );

  updateGauge(

    gaugeEFF,

    Math.min(
      mppt.efficiency || 0,
      100
    ),

    100

  );

}

/* =========================================
   FIREBASE LISTENER
========================================= */

db.ref("/")
.on(

  "value",

  (snapshot) => {

    const data =
      snapshot.val();

    if (!data)
      return;

    lastFirebaseUpdate =
      Date.now();

    updateUI(data);

  }

);

/* =========================================
   SCADA FLOW NODE
========================================= */

const svg =
  document.getElementById(
    "scadaSvg"
  );

function createNode(color) {

  const node =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

  node.setAttribute(
    "r",
    7
  );

  node.setAttribute(
    "fill",
    color
  );

  node.style.filter =
    "drop-shadow(0 0 10px " +
    color +
    ")";

  svg.appendChild(node);

  return node;

}

const node1 =
  createNode("#00ffe5");

const node2 =
  createNode("#7CFC00");

const node3 =
  createNode("#36a3ff");

/* =========================================
   PATH
========================================= */

const path = [

  {x:170,y:90},
  {x:170,y:110},
  {x:170,y:130},
  {x:170,y:150},
  {x:170,y:170},
  {x:170,y:190},
  {x:170,y:210},

  {x:170,y:250},

  {x:150,y:250},
  {x:130,y:250},

  {x:120,y:280},
  {x:120,y:320},
  {x:120,y:360},

  {x:190,y:250},
  {x:210,y:250},

  {x:220,y:280},
  {x:220,y:320},
  {x:220,y:360}

];

let i1 = 0;
let i2 = 5;
let i3 = 10;

/* =========================================
   FLOW ANIMATION
========================================= */

function animateFlow() {

  node1.setAttribute(
    "cx",
    path[i1].x
  );

  node1.setAttribute(
    "cy",
    path[i1].y
  );

  node2.setAttribute(
    "cx",
    path[i2].x
  );

  node2.setAttribute(
    "cy",
    path[i2].y
  );

  node3.setAttribute(
    "cx",
    path[i3].x
  );

  node3.setAttribute(
    "cy",
    path[i3].y
  );

  i1 =
    (i1 + 1) %
    path.length;

  i2 =
    (i2 + 1) %
    path.length;

  i3 =
    (i3 + 1) %
    path.length;

}

animateFlow();

const speed =
  window.innerWidth < 768
    ? 280
    : 180;

setInterval(
  animateFlow,
  speed
);