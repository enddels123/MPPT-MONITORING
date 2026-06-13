
// FIREBASE CONFIG

const firebaseConfig = {
  apiKey: "AIzaSyC7ctgLv34n6pwg9cQpcTN9qd77FbMGbOg",
  authDomain: "isokuiki-scada.firebaseapp.com",
  databaseURL: "https://isokuiki-scada-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "isokuiki-scada",
  storageBucket: "isokuiki-scada.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:test"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

function setText(id, value, unit = "") {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = Number(value).toFixed(2) + unit;
  }
}

function setGauge(id, value, max = 100) {

  const canvas = document.getElementById(id);

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0,0,w,h);

  ctx.beginPath();
  ctx.arc(w/2,h/2,60,Math.PI,0);
  ctx.lineWidth=12;
  ctx.strokeStyle="#13324d";
  ctx.stroke();

  const angle =
    Math.PI +
    (value/max)*Math.PI;

  ctx.beginPath();
  ctx.arc(
    w/2,
    h/2,
    60,
    Math.PI,
    angle
  );

  ctx.lineWidth=12;
  ctx.strokeStyle="#00ffff";
  ctx.stroke();

  ctx.font="20px Orbitron";
  ctx.fillStyle="#00ffff";
  ctx.textAlign="center";
  ctx.fillText(
    value.toFixed(0)+"%",
    w/2,
    h/2+10
  );
}

/* =========================
   REALTIME
========================= */

db.ref("/").on("value",(snap)=>{

  const d = snap.val();

  if(!d) return;

  /* SOLAR */

  setText("pvVoltage", d.solar?.voltage || 0,"V");
  setText("pvCurrent", d.solar?.current || 0,"A");
  setText("pvPower", d.solar?.power || 0,"W");

  /* BATTERY */

  setText("batVoltage", d.battery?.voltage || 0,"V");
  setText("batCurrent", d.battery?.current || 0,"A");
  setText("batPower", d.battery?.power || 0,"W");
  setText("batSoc", d.battery?.soc || 0,"%");

  /* LOAD */

  setText("loadVoltage", d.load?.voltage || 0,"V");
  setText("loadCurrent", d.load?.current || 0,"A");
  setText("loadPower", d.load?.power || 0,"W");

  /* MPPT */

  setText("mpptEff", d.mppt?.efficiency || 0,"%");

  /* ENERGY */

  setText("todayKwh", d.energy?.today_kwh || 0," kWh");
  setText("monthKwh", d.energy?.month_kwh || 0," kWh");
  setText("totalKwh", d.energy?.total_kwh || 0," kWh");

  /* INCOME */

  setText("todayRp", d.income?.today_rp || 0);
  setText("monthRp", d.income?.month_rp || 0);
  setText("totalRp", d.income?.total_rp || 0);

  /* SYSTEM */

  document.getElementById("statusText").innerHTML =
    d.system?.online ? "ONLINE" : "OFFLINE";

  setGauge(
    "socGauge",
    d.battery?.soc || 0,
    100
  );

  setGauge(
    "effGauge",
    d.mppt?.efficiency || 0,
    100
  );

});

