const client = mqtt.connect(
  "wss://broker.hivemq.com:8884/mqtt"
);

const topic = "solar/jnge/hybrid";

// ================= MQTT =================

client.on("connect", () => {

  console.log("MQTT CONNECTED");

  client.subscribe(topic);
});

client.on("reconnect", () => {

  console.log("MQTT RECONNECT");
});

client.on("error", (err) => {

  console.log("MQTT ERROR", err);
});

// ================= CHART =================

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
        label:'PV Power (W)',
        data:pvData,
        borderWidth:2,
        tension:0.3
      },

      {
        label:'Load Power (W)',
        data:loadData,
        borderWidth:2,
        tension:0.3
      },

      {
        label:'Battery Voltage (V)',
        data:batData,
        borderWidth:2,
        tension:0.3
      }
    ]
  },

  options:{

    responsive:true,

    maintainAspectRatio:false,

    animation:false,

    plugins:{

      legend:{
        labels:{
          color:'#00ffd5'
        }
      }
    },

    scales:{

      x:{
        ticks:{
          color:'#00ffd5'
        }
      },

      y:{
        ticks:{
          color:'#00ffd5'
        }
      }
    }
  }
});

// ================= SAFE NUMBER =================

function safe(v){

  if(isNaN(v))
    return 0;

  return Number(v);
}

// ================= ARROW =================

function updateArrow(id,power){

  const arrow = document.getElementById(id);

  power = safe(power);

  // LOW POWER
  if(power < 20){

    arrow.className = "arrow green";

    arrow.style.animationDuration = "2s";
  }

  // MEDIUM
  else if(power < 100){

    arrow.className = "arrow yellow";

    arrow.style.animationDuration = "1s";
  }

  // HIGH
  else{

    arrow.className = "arrow red";

    arrow.style.animationDuration = "0.4s";
  }
}

// ================= MQTT MESSAGE =================

client.on("message",(topic,message)=>{

  try{

    const data = JSON.parse(
      message.toString()
    );

    // ================= PV =================

    document.getElementById("pv_v")
    .innerHTML =
      safe(data.pv_v).toFixed(1)+" V";

    document.getElementById("pv_i")
    .innerHTML =
      safe(data.pv_i).toFixed(2)+" A";

    document.getElementById("pv_p")
    .innerHTML =
      safe(data.pv_p).toFixed(1)+" W";

    // ================= BATTERY =================

    document.getElementById("bat_v")
    .innerHTML =
      safe(data.bat_v).toFixed(1)+" V";

    document.getElementById("bat_i")
    .innerHTML =
      safe(data.bat_i).toFixed(2)+" A";

    document.getElementById("soc")
    .innerHTML =
      safe(data.soc).toFixed(1)+" %";

    // ================= MPPT =================

    document.getElementById("charge_p")
    .innerHTML =
      safe(data.charge_p).toFixed(1)+" W";

    document.getElementById("mppt_eff")
    .innerHTML =
      safe(data.mppt_eff).toFixed(1)+" %";

    document.getElementById("mppt_eff2")
    .innerHTML =
      safe(data.mppt_eff).toFixed(1)+" %";

    // ================= LOAD =================

    document.getElementById("load_p")
    .innerHTML =
      safe(data.load_p).toFixed(1)+" W";

    document.getElementById("status")
    .innerHTML =
      data.status || "IDLE";

    // ================= ENERGY =================

    document.getElementById("kwh_day")
    .innerHTML =
      safe(data.kwh_day).toFixed(2)+" kWh";

    document.getElementById("kwh_month")
    .innerHTML =
      safe(data.kwh_month).toFixed(2)+" kWh";

    // ================= ARROW =================

    updateArrow(
      "arrow1",
      data.pv_p
    );

    updateArrow(
      "arrow2",
      data.charge_p
    );

    updateArrow(
      "arrow3",
      data.load_p
    );

    // ================= CHART =================

    const now = new Date()
    .toLocaleTimeString();

    labels.push(now);

    pvData.push(
      safe(data.pv_p)
    );

    loadData.push(
      safe(data.load_p)
    );

    batData.push(
      safe(data.bat_v)
    );

    // LIMIT DATA
    if(labels.length > 30){

      labels.shift();

      pvData.shift();

      loadData.shift();

      batData.shift();
    }

    chart.update();

  }catch(err){

    console.log("JSON ERROR",err);
  }
});