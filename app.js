const client =
mqtt.connect(
"wss://broker.hivemq.com:8884/mqtt"
);

const topic =
"solar/jnge/hybrid";

/* ================= MQTT ================= */

client.on("connect",()=>{

  console.log(
    "MQTT CONNECTED"
  );

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

        borderWidth:3,

        tension:0.4
      },

      {
        label:'Load Power',

        data:loadData,

        borderWidth:3,

        tension:0.4
      }
    ]
  },

  options:{

    responsive:true,

    maintainAspectRatio:false,

    plugins:{

      legend:{

        labels:{

          color:'white'
        }
      }
    },

    scales:{

      x:{

        ticks:{

          color:'white'
        }
      },

      y:{

        ticks:{

          color:'white'
        }
      }
    }
  }
});

/* ================= MQTT MESSAGE ================= */

client.on(
"message",
(topic,message)=>{

  const data =
  JSON.parse(
    message.toString()
  );

  /* ==================================================
     FLOW COLOR
  ================================================== */

  const pvPower =
  safe(data.pv_p);

  let color =
  "#00d9ff";

  if(pvPower > 200){

    color =
    "#00ff88";
  }

  if(pvPower > 500){

    color =
    "#ffee00";
  }

  if(pvPower > 800){

    color =
    "#ff5500";
  }

  document
  .querySelectorAll(
    ".flow-lines path"
  )
  .forEach(line=>{

    line.style.stroke =
    color;
  });

  document
  .querySelectorAll(
    ".energy-dot"
  )
  .forEach(dot=>{

    dot.style.background =
    color;

    dot.style.boxShadow =
    `0 0 15px ${color}`;
  });

  /* ==================================================
     PV
  ================================================== */

  document.getElementById(
    "pv_v"
  ).innerHTML =

  safe(data.pv_v)
  .toFixed(1)
  +" V";

  document.getElementById(
    "pv_i"
  ).innerHTML =

  safe(data.pv_i)
  .toFixed(1)
  +" A";

  document.getElementById(
    "pv_p"
  ).innerHTML =

  safe(data.pv_p)
  .toFixed(1)
  +" W";

  document.getElementById(
    "pv_power_card"
  ).innerHTML =

  safe(data.pv_p)
  .toFixed(1)
  +" W";

  /* ==================================================
     BATTERY
  ================================================== */

  document.getElementById(
    "bat_v"
  ).innerHTML =

  safe(data.bat_v)
  .toFixed(1)
  +" V";

  document.getElementById(
    "bat_i"
  ).innerHTML =

  safe(data.bat_i)
  .toFixed(1)
  +" A";

  document.getElementById(
    "charge_p"
  ).innerHTML =

  safe(data.charge_p)
  .toFixed(1)
  +" W";

  document.getElementById(
    "soc"
  ).innerHTML =

  safe(data.soc)
  .toFixed(0)
  +" %";

  /* ==================================================
     LOAD
  ================================================== */

  document.getElementById(
    "load_p"
  ).innerHTML =

  safe(data.load_p)
  .toFixed(1)
  +" W";

  /* ==================================================
     STATUS
  ================================================== */

  document.getElementById(
    "status"
  ).innerHTML =

  data.status;

  /* ==================================================
     MPPT
  ================================================== */

  document.getElementById(
    "mppt_v"
  ).innerHTML =

  safe(data.mppt_v)
  .toFixed(1)
  +" V";

  document.getElementById(
    "mppt_i"
  ).innerHTML =

  safe(data.mppt_i)
  .toFixed(1)
  +" A";

  document.getElementById(
    "mppt_p"
  ).innerHTML =

  safe(data.mppt_p)
  .toFixed(1)
  +" W";

  document.getElementById(
    "mppt_eff"
  ).innerHTML =

  safe(data.mppt_eff)
  .toFixed(1)
  +" %";

  /* ==================================================
     STATISTICS
  ================================================== */

  document.getElementById(
    "kwh_day"
  ).innerHTML =

  safe(data.kwh_day)
  .toFixed(2)
  +" kWh";

  document.getElementById(
    "kwh_month"
  ).innerHTML =

  safe(data.kwh_month)
  .toFixed(2)
  +" kWh";

  document.getElementById(
    "storage_prod"
  ).innerHTML =

  safe(data.storage_prod)
  .toFixed(2)
  +" kWh";

  document.getElementById(
    "charged"
  ).innerHTML =

  safe(data.charged)
  .toFixed(2)
  +" kWh";

  document.getElementById(
    "load_cons"
  ).innerHTML =

  safe(data.load_cons)
  .toFixed(2)
  +" kWh";

  /* ==================================================
     CHART
  ================================================== */

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