const client =
mqtt.connect(
"wss://broker.hivemq.com:8884/mqtt"
);

const topic =
"solar/jnge/hybrid";

/* =====================================================
   MQTT CONNECT
===================================================== */

client.on("connect",()=>{

  console.log(
    "MQTT CONNECTED"
  );

  client.subscribe(topic);
});

/* =====================================================
   SAFE VALUE
===================================================== */

function safe(v){

  if(isNaN(v))
    return 0;

  return Number(v);
}

/* =====================================================
   UPDATE ELEMENT
===================================================== */

function setText(id,val){

  const el =
  document.getElementById(id);

  if(el){

    el.innerHTML = val;
  }
}

/* =====================================================
   CHART
===================================================== */

const ctx =
document.getElementById(
  "powerChart"
).getContext("2d");

const labels = [];

const pvData = [];

const loadData = [];

const chart =
new Chart(ctx,{

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

/* =====================================================
   MQTT MESSAGE
===================================================== */

client.on(
"message",
(topic,message)=>{

  const data =
  JSON.parse(
    message.toString()
  );

  /* =================================================
     FLOW COLOR
  ================================================= */

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

  /* =================================================
     LINE COLOR
  ================================================= */

  document
  .querySelectorAll(
    ".flow-lines path"
  )
  .forEach(line=>{

    line.style.stroke =
    color;
  });

  /* =================================================
     NODE COLOR
  ================================================= */

  document
  .querySelectorAll(
    ".energy-node"
  )
  .forEach(dot=>{

    dot.style.background =
    color;

    dot.style.boxShadow =
    `0 0 12px ${color}`;
  });

  /* =================================================
     PV
  ================================================= */

  setText(
    "pv_v",
    safe(data.pv_v).toFixed(1)+" V"
  );

  setText(
    "pv_i",
    safe(data.pv_i).toFixed(1)+" A"
  );

  setText(
    "pv_p",
    safe(data.pv_p).toFixed(1)+" W"
  );

  /* CARD */

  setText(
    "pv_voltage_card",
    safe(data.pv_v).toFixed(1)+" V"
  );

  setText(
    "pv_current_card",
    safe(data.pv_i).toFixed(1)+" A"
  );

  setText(
    "pv_power_card",
    safe(data.pv_p).toFixed(1)+" W"
  );

  /* =================================================
     BATTERY
  ================================================= */

  setText(
    "bat_v",
    safe(data.bat_v).toFixed(1)+" V"
  );

  setText(
    "bat_i",
    safe(data.bat_i).toFixed(1)+" A"
  );

  setText(
    "bat_p",
    safe(data.bat_p).toFixed(1)+" W"
  );

  setText(
    "soc",
    safe(data.soc).toFixed(0)+" %"
  );

  /* CARD */

  setText(
    "bat_voltage_card",
    safe(data.bat_v).toFixed(1)+" V"
  );

  setText(
    "bat_current_card",
    safe(data.bat_i).toFixed(1)+" A"
  );

  setText(
    "soc_card",
    safe(data.soc).toFixed(0)+" %"
  );

  /* =================================================
     LOAD
  ================================================= */

  setText(
    "load_v",
    safe(data.load_v).toFixed(1)+" V"
  );

  setText(
    "load_i",
    safe(data.load_i).toFixed(1)+" A"
  );

  setText(
    "load_p",
    safe(data.load_p).toFixed(1)+" W"
  );

  /* =================================================
     MPPT
  ================================================= */

  setText(
    "mppt_v",
    safe(data.mppt_v).toFixed(1)+" V"
  );

  setText(
    "mppt_i",
    safe(data.mppt_i).toFixed(1)+" A"
  );

  setText(
    "mppt_p",
    safe(data.mppt_p).toFixed(1)+" W"
  );

  /* =================================================
     IDLE
  ================================================= */

  setText(
    "idle_v",
    safe(data.idle_v).toFixed(1)+" V"
  );

  setText(
    "idle_i",
    safe(data.idle_i).toFixed(1)+" A"
  );

  setText(
    "idle_p",
    safe(data.idle_p).toFixed(1)+" W"
  );

  /* =================================================
     ELECTRICITY STAT
  ================================================= */

  setText(
    "today_energy",
    safe(data.today_energy)
    .toFixed(2)+" kWh"
  );

  setText(
    "month_energy",
    safe(data.month_energy)
    .toFixed(2)+" kWh"
  );

  setText(
    "load_energy",
    safe(data.load_energy)
    .toFixed(2)+" kWh"
  );

  /* =================================================
     CHART
  ================================================= */

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