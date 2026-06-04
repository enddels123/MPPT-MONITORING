const client = mqtt.connect(
  "wss://broker.hivemq.com:8884/mqtt"
);

const topic =
"solar/jnge/hybrid";

client.on("connect",()=>{

  console.log("MQTT CONNECTED");

  client.subscribe(topic);
});

function safe(v){

  if(isNaN(v))
    return 0;

  return Number(v);
}

/* ================= CHART ================= */

const ctx =
document.getElementById("chart")
.getContext("2d");

const labels = [];

const pvData = [];

const loadData = [];

const chart = new Chart(ctx,{

  type:'line',

  data:{

    labels:labels,

    datasets:[

      {

        label:'PV Power',

        data:pvData,

        borderWidth:2
      },

      {

        label:'Load Power',

        data:loadData,

        borderWidth:2
      }
    ]
  },

  options:{

    responsive:true,

    maintainAspectRatio:false
  }
});

/* ================= MQTT ================= */

client.on("message",
(topic,message)=>{

  const data =
  JSON.parse(message.toString());

  /* ================= PV ================= */

  document.getElementById("pv_v")
  .innerHTML =
  safe(data.pv_v).toFixed(1)+" V";

  document.getElementById("pv_i")
  .innerHTML =
  safe(data.pv_i).toFixed(1)+" A";

  document.getElementById("pv_p")
  .innerHTML =
  safe(data.pv_p).toFixed(1)+" W";

  /* ================= BATTERY ================= */

  document.getElementById("bat_v")
  .innerHTML =
  safe(data.bat_v).toFixed(1)+" V";

  document.getElementById("bat_i")
  .innerHTML =
  safe(data.bat_i).toFixed(1)+" A";

  document.getElementById("soc")
  .innerHTML =
  safe(data.soc).toFixed(0)+" %";

  /* ================= LOAD ================= */

  document.getElementById("load_p")
  .innerHTML =
  safe(data.load_p).toFixed(1)+" W";

  /* ================= CHARGE ================= */

  document.getElementById("charge_p")
  .innerHTML =
  safe(data.charge_p).toFixed(1)+" W";

  /* ================= STATUS ================= */

  document.getElementById("status")
  .innerHTML =
  data.status || "IDLE";

  /* ================= STATISTICS ================= */

  document.getElementById("kwh_day")
  .innerHTML =
  safe(data.kwh_day).toFixed(2)
  +" kWh";

  document.getElementById("kwh_month")
  .innerHTML =
  safe(data.kwh_month).toFixed(2)
  +" kWh";

  document.getElementById("mppt_eff")
  .innerHTML =
  safe(data.mppt_eff).toFixed(1)
  +" %";

  /* ================= CHART ================= */

  const now =
  new Date()
  .toLocaleTimeString();

  labels.push(now);

  pvData.push(
    safe(data.pv_p)
  );

  loadData.push(
    safe(data.load_p)
  );

  if(labels.length > 20){

    labels.shift();

    pvData.shift();

    loadData.shift();
  }

  chart.update();
});