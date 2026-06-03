const client = mqtt.connect(
"wss://broker.hivemq.com:8884/mqtt"
);

const topic = "solar/jnge/hybrid";

client.on("connect", ()=>{

  console.log("MQTT CONNECT");

  client.subscribe(topic);
});

const ctx = document
.getElementById("chart")
.getContext("2d");

const labels = [];

const pvData = [];

const loadData = [];

const batData = [];

const chart = new Chart(ctx, {

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
      },

      {
        label:'Battery Voltage',
        data:batData,
        borderWidth:2
      }
    ]
  },

  options:{
    responsive:true
  }
});

function updateArrow(id,power){

  const arrow = document.getElementById(id);

  if(power < 20){

    arrow.className = "arrow green";

    arrow.style.animationDuration = "2s";

  }
  else if(power < 100){

    arrow.className = "arrow yellow";

    arrow.style.animationDuration = "1s";

  }
  else{

    arrow.className = "arrow red";

    arrow.style.animationDuration = "0.4s";
  }
}

client.on("message",(topic,message)=>{

  const data = JSON.parse(
    message.toString()
  );

  // PV
  document.getElementById("pv_v")
  .innerHTML = data.pv_v.toFixed(1)+" V";

  document.getElementById("pv_i")
  .innerHTML = data.pv_i.toFixed(1)+" A";

  document.getElementById("pv_p")
  .innerHTML = data.pv_p.toFixed(1)+" W";

  // BATTERY
  document.getElementById("bat_v")
  .innerHTML = data.bat_v.toFixed(1)+" V";

  document.getElementById("bat_i")
  .innerHTML = data.bat_i.toFixed(1)+" A";

  document.getElementById("soc")
  .innerHTML = data.soc.toFixed(1)+" %";

  // MPPT
  document.getElementById("charge_p")
  .innerHTML = data.charge_p.toFixed(1)+" W";

  document.getElementById("mppt_eff")
  .innerHTML = data.mppt_eff.toFixed(1)+" %";

  document.getElementById("eff2")
  .innerHTML = data.mppt_eff.toFixed(1)+" %";

  // LOAD
  document.getElementById("load_p")
  .innerHTML = data.load_p.toFixed(1)+" W";

  document.getElementById("status")
  .innerHTML = data.status;

  // ENERGY
  document.getElementById("kwh_day")
  .innerHTML = data.kwh_day.toFixed(2);

  document.getElementById("kwh_month")
  .innerHTML = data.kwh_month.toFixed(2);

  // ANIMATION
  updateArrow("arrow1", data.pv_p);

  updateArrow("arrow2", data.charge_p);

  updateArrow("arrow3", data.load_p);

  // CHART
  const now = new Date()
  .toLocaleTimeString();

  labels.push(now);

  pvData.push(data.pv_p);

  loadData.push(data.load_p);

  batData.push(data.bat_v);

  if(labels.length > 30){

    labels.shift();

    pvData.shift();

    loadData.shift();

    batData.shift();
  }

  chart.update();
});