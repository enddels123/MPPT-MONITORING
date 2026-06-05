/* =========================================================
   ISOKUIKI SMART ENERGY
   FINAL FULL VERSION APP.JS
   Firebase + Auto Reconnect + Animated Node
   ========================================================= */

/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

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

/* =========================================================
   ELEMENT HELPER
   ========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   ELEMENTS
   ========================================================= */

/* STATUS */
const onlineStatus = $("onlineStatus");

/* PV */
const pvVoltage = $("pvVoltage");
const pvCurrent = $("pvCurrent");
const pvPower = $("pvPower");

/* MPPT */
const mpptCharge = $("mpptCharge");
const mpptEff = $("mpptEff");

/* BATTERY */
const batVoltage = $("batVoltage");
const batCurrent = $("batCurrent");
const batSoc = $("batSoc");

/* ENERGY */
const energyDaily = $("energyDaily");
const energyMonthly = $("energyMonthly");

/* SCADA */
const scadaPvPower = $("scadaPvPower");
const scadaPvVolt = $("scadaPvVolt");
const scadaPvAmp = $("scadaPvAmp");

const scadaMpptPower = $("scadaMpptPower");
const scadaMpptEff = $("scadaMpptEff");

const scadaBatSoc = $("scadaBatSoc");
const scadaBatVolt = $("scadaBatVolt");
const scadaBatAmp = $("scadaBatAmp");

const scadaLoadPower = $("scadaLoadPower");
const scadaLoadVolt = $("scadaLoadVolt");
const scadaLoadAmp = $("scadaLoadAmp");

/* GAUGE */
const pvGaugeValue = $("pvGaugeValue");
const pvGaugeVolt = $("pvGaugeVolt");
const pvGaugeAmp = $("pvGaugeAmp");

const batteryGaugeValue = $("batteryGaugeValue");
const effGaugeValue = $("effGaugeValue");

/* NODE */
const nodeMain = $("nodeMain");
const nodeLeft = $("nodeLeft");
const nodeRight = $("nodeRight");

/* =========================================================
   DEFAULT DATA
   ========================================================= */

let systemOnline = false;

let dataCache = {
  pv_voltage: 0,
  pv_current: 0,
  pv_power: 0,

  mppt_charge: 0,
  mppt_efficiency: 0,

  battery_voltage: 0,
  battery_current: 0,
  battery_soc: 0,

  load_voltage: 0,
  load_current: 0,
  load_power: 0,

  energy_daily: 0,
  energy_monthly: 0,

  timestamp: 0
};

/* =========================================================
   FORMAT
   ========================================================= */

function formatNumber(value, digit = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  return Number(value).toFixed(digit);
}

/* =========================================================
   ONLINE OFFLINE STATUS
   ========================================================= */

function setStatus(online) {

  if (online) {

    onlineStatus.innerText = "ONLINE";
    onlineStatus.style.color = "#7CFF00";
    onlineStatus.style.textShadow = "0 0 10px #7CFF00";

  } else {

    onlineStatus.innerText = "OFFLINE";
    onlineStatus.style.color = "#ff2b2b";
    onlineStatus.style.textShadow = "0 0 10px #ff0000";
  }
}

/* =========================================================
   UPDATE UI
   ========================================================= */

function updateUI(data) {

  /* =========================
     STATUS
     ========================= */

  const now = Date.now();
  const last = data.timestamp || 0;

  systemOnline = (now - last) < 20000;

  setStatus(systemOnline);

  /* =========================
     PV INFO
     ========================= */

  pvVoltage.innerText = formatNumber(data.pv_voltage) + "V";
  pvCurrent.innerText = formatNumber(data.pv_current) + "A";
  pvPower.innerText = formatNumber(data.pv_power) + "W";

  /* =========================
     MPPT INFO
     ========================= */

  mpptCharge.innerText = formatNumber(data.mppt_charge) + "W";
  mpptEff.innerText = formatNumber(data.mppt_efficiency) + "%";

  /* =========================
     BATTERY INFO
     ========================= */

  batVoltage.innerText = formatNumber(data.battery_voltage) + "V";
  batCurrent.innerText = formatNumber(data.battery_current) + "A";
  batSoc.innerText = formatNumber(data.battery_soc) + "%";

  /* =========================
     ENERGY
     ========================= */

  energyDaily.innerText = formatNumber(data.energy_daily, 2) + " kWh";
  energyMonthly.innerText = formatNumber(data.energy_monthly, 2) + " kWh";

  /* =========================
     SCADA PV
     ========================= */

  scadaPvPower.innerText = formatNumber(data.pv_power) + "W";
  scadaPvVolt.innerText = formatNumber(data.pv_voltage) + "V";
  scadaPvAmp.innerText = formatNumber(data.pv_current) + "A";

  /* =========================
     SCADA MPPT
     ========================= */

  scadaMpptPower.innerText = formatNumber(data.mppt_charge) + "W";
  scadaMpptEff.innerText = formatNumber(data.mppt_efficiency) + "%";

  /* =========================
     SCADA BATTERY
     ========================= */

  scadaBatSoc.innerText = formatNumber(data.battery_soc) + "%";
  scadaBatVolt.innerText = formatNumber(data.battery_voltage) + "V";
  scadaBatAmp.innerText = formatNumber(data.battery_current) + "A";

  /* =========================
     SCADA LOAD
     ========================= */

  scadaLoadPower.innerText = formatNumber(data.load_power) + "W";
  scadaLoadVolt.innerText = formatNumber(data.load_voltage) + "V";
  scadaLoadAmp.innerText = formatNumber(data.load_current) + "A";

  /* =========================
     GAUGE VALUE
     ========================= */

  pvGaugeValue.innerText = formatNumber(data.pv_power) + "W";
  pvGaugeVolt.innerText = formatNumber(data.pv_voltage) + "V";
  pvGaugeAmp.innerText = formatNumber(data.pv_current) + "A";

  batteryGaugeValue.innerText = formatNumber(data.battery_soc) + "%";

  effGaugeValue.innerText = formatNumber(data.mppt_efficiency) + "%";

  /* =========================
     NODE ANIMATION
     ========================= */

  animateNodes(data);
}

/* =========================================================
   NODE ANIMATION
   ========================================================= */

let nodePosition = 0;

function animateNodes(data) {

  const power = Number(data.pv_power || 0);

  if (power <= 0) {

    nodeMain.style.opacity = 0.25;
    nodeLeft.style.opacity = 0.25;
    nodeRight.style.opacity = 0.25;

    return;
  }

  nodeMain.style.opacity = 1;
  nodeLeft.style.opacity = 1;
  nodeRight.style.opacity = 1;

  nodePosition += 1.5;

  if (nodePosition > 100) {
    nodePosition = 0;
  }

  /* MAIN LINE */
  nodeMain.style.offsetDistance = `${nodePosition}%`;

  /* LEFT */
  nodeLeft.style.offsetDistance = `${nodePosition}%`;

  /* RIGHT */
  nodeRight.style.offsetDistance = `${nodePosition}%`;
}

/* =========================================================
   FIREBASE LISTENER
   ========================================================= */

function startFirebaseListener() {

  db.ref("smartenergy").on(
    "value",

    (snapshot) => {

      const data = snapshot.val();

      if (!data) return;

      dataCache = {

        ...dataCache,
        ...data
      };

      updateUI(dataCache);
    },

    (error) => {

      console.log("Firebase Error:", error);

      setStatus(false);

      reconnectFirebase();
    }
  );
}

/* =========================================================
   RECONNECT FIREBASE
   ========================================================= */

function reconnectFirebase() {

  console.log("Reconnecting Firebase...");

  setTimeout(() => {

    try {

      firebase.database().goOnline();

      startFirebaseListener();

    } catch (e) {

      console.log(e);

      reconnectFirebase();
    }

  }, 5000);
}

/* =========================================================
   AUTO CHECK CONNECTION
   ========================================================= */

setInterval(() => {

  const now = Date.now();

  if ((now - dataCache.timestamp) > 20000) {

    setStatus(false);

  } else {

    setStatus(true);
  }

}, 5000);

/* =========================================================
   AUTO RECONNECT INTERNET
   ========================================================= */

window.addEventListener("online", () => {

  console.log("Internet Connected");

  firebase.database().goOnline();

  reconnectFirebase();
});

window.addEventListener("offline", () => {

  console.log("Internet Offline");

  setStatus(false);
});

/* =========================================================
   START
   ========================================================= */

startFirebaseListener();

/* =========================================================
   OPTIONAL DEMO MODE
   HAPUS BAGIAN INI JIKA SUDAH ADA DATA ESP32
   ========================================================= */

// setInterval(() => {

//   const fake = {
//     pv_voltage: 21 + Math.random() * 3,
//     pv_current: 4 + Math.random() * 2,
//     pv_power: 80 + Math.random() * 40,

//     mppt_charge: 75 + Math.random() * 30,
//     mppt_efficiency: 90 + Math.random() * 8,

//     battery_voltage: 12 + Math.random(),
//     battery_current: 5 + Math.random(),
//     battery_soc: 70 + Math.random() * 20,

//     load_voltage: 12,
//     load_current: 2 + Math.random(),
//     load_power: 20 + Math.random() * 20,

//     energy_daily: 1 + Math.random(),
//     energy_monthly: 25 + Math.random() * 5,

//     timestamp: Date.now()
//   };

//   updateUI(fake);

// }, 1000);