/* =========================================================
APP.JS TERBARU FINAL
ISOKUIKI SMART ENERGY
========================================================= */

/* =========================================================
FIREBASE IMPORT
========================================================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
onValue,
goOnline,
goOffline
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

/* =========================================================
INITIALIZE
========================================================= */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

/* =========================================================
DATABASE PATH
========================================================= */

const monitoringRef = ref(db, "monitoring");

/* =========================================================
HELPER
========================================================= */

function setText(id, value){

const el = document.getElementById(id);

if(el){

el.innerText = value;

}

}

/* =========================================================
ONLINE STATUS
========================================================= */

function setOnlineStatus(isOnline){

const statusEl = document.getElementById("statusText");

if(!statusEl) return;

if(isOnline){

statusEl.innerText = "ONLINE";

statusEl.classList.remove("offline");

statusEl.classList.add("online");

}else{

statusEl.innerText = "OFFLINE";

statusEl.classList.remove("online");

statusEl.classList.add("offline");

}

}

/* =========================================================
FORMAT NUMBER
========================================================= */

function formatNumber(value){

return Number(value || 0).toFixed(1);

}

/* =========================================================
UPDATE ALL UI
========================================================= */

function updateUI(data){

/* =========================
PV
========================= */

const pvVoltage = formatNumber(data.pvVoltage);
const pvCurrent = formatNumber(data.pvCurrent);
const pvPower   = formatNumber(data.pvPower);

/* =========================
BATTERY
========================= */

const batVoltage = formatNumber(data.batteryVoltage);
const batCurrent = formatNumber(data.batteryCurrent);
const batterySOC = formatNumber(data.batterySOC);

/* =========================
MPPT
========================= */

const mpptEfficiency = formatNumber(data.mpptEfficiency);
const mpptPower      = formatNumber(data.mpptPower || data.pvPower);

/* =========================
LOAD
========================= */

const loadVoltage = formatNumber(data.loadVoltage || data.batteryVoltage);

const loadCurrent = formatNumber(data.loadCurrent || 0);

const loadPower = formatNumber(data.loadPower || 0);

/* =========================
ENERGY
========================= */

const dailyEnergy =
formatNumber(data.dailyEnergy || 0);

const monthlyEnergy =
formatNumber(data.monthlyEnergy || 0);

/* =========================================================
TOP DATA
========================================================= */

setText("pvVoltageText", pvVoltage + "V");
setText("pvCurrentText", pvCurrent + "A");
setText("pvPowerText", pvPower + "W");

setText("batVoltageText", batVoltage + "V");
setText("batCurrentText", batCurrent + "A");

setText("socText", batterySOC + "%");

setText("mpptPowerText", mpptPower + "W");
setText("mpptEffText", mpptEfficiency + "%");

setText("dailyEnergy", dailyEnergy + " kWh");
setText("monthlyEnergy", monthlyEnergy + " kWh");

/* =========================================================
GAUGE
========================================================= */

setText("pvGaugePower", pvPower + "W");
setText("pvGaugeVolt", pvVoltage + "V");
setText("pvGaugeAmp", pvCurrent + "A");

setText("socGauge", batterySOC + "%");

setText("effGauge", mpptEfficiency + "%");

/* =========================================================
SCADA
========================================================= */

setText("pvScadaPower", pvPower + "W");

setText(
"pvScadaVA",
pvVoltage + "V | " + pvCurrent + "A"
);

setText("mpptScadaPower", mpptPower + "W");

setText(
"mpptScadaEff",
mpptEfficiency + "%"
);

setText("batScadaSoc", batterySOC + "%");

setText(
"batScadaVA",
batVoltage + "V | " + batCurrent + "A"
);

setText("loadScadaPower", loadPower + "W");

setText(
"loadScadaVA",
loadVoltage + "V | " + loadCurrent + "A"
);

}

/* =========================================================
FIREBASE REALTIME LISTENER
========================================================= */

onValue(

monitoringRef,

(snapshot)=>{

setOnlineStatus(true);

const data = snapshot.val() || {};

updateUI(data);

},

(error)=>{

console.error("Firebase Error:", error);

setOnlineStatus(false);

}

);

/* =========================================================
AUTO RECONNECT
========================================================= */

window.addEventListener("online", ()=>{

console.log("Internet Connected");

goOnline(db);

setOnlineStatus(true);

});

window.addEventListener("offline", ()=>{

console.log("Internet Disconnected");

goOffline(db);

setOnlineStatus(false);

});

/* =========================================================
KEEP CONNECTION ALIVE
========================================================= */

setInterval(()=>{

if(navigator.onLine){

goOnline(db);

}

}, 15000);

/* =========================================================
PAGE VISIBILITY RECONNECT
========================================================= */

document.addEventListener("visibilitychange", ()=>{

if(document.visibilityState === "visible"){

goOnline(db);

}

});

/* =========================================================
STARTUP
========================================================= */

console.log("ISOKUIKI SMART ENERGY READY");