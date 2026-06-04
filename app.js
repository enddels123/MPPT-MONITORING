const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
"solar/jnge/hybrid";

/* =====================================================
   CONNECT
===================================================== */

client.on('connect',()=>{

  console.log("MQTT Connected");

  client.subscribe(topic);

});

/* =====================================================
   CHART CONFIG
===================================================== */

function createChart(
canvas,
label,
color,
type='line'
){

  return new Chart(
  document.getElementById(canvas),
  {

    type:type,

    data:{

      labels:[],

      datasets:[{

        label:label,

        data:[],

        borderColor:color,

        backgroundColor:color,

        tension:0.4
      }]
    },

    options:{

      responsive:true,

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
}

/* =====================================================
   CHART
===================================================== */

const hourChart =
createChart(
'hourChart',
'Load Power',
'#00ff88',
'bar'
);

const dayChart =
createChart(
'dayChart',
'Daily Energy',
'#00ffd5'
);

const monthChart =
createChart(
'monthChart',
'Monthly Energy',
'#00aaff',
'bar'
);

/* =====================================================
   UPDATE CHART
===================================================== */

function updateChart(
chart,
label,
value
){

  chart.data.labels.push(label);

  chart.data.datasets[0]
  .data.push(value);

  if(
  chart.data.labels.length > 10
  ){

    chart.data.labels.shift();

    chart.data.datasets[0]
    .data.shift();
  }

  chart.update();
}

/* =====================================================
   MQTT MESSAGE
===================================================== */

client.on(
'message',
(topic,message)=>{

  const data =
  JSON.parse(
  message.toString()
  );

  /* PV */

  document.getElementById(
  'pv_v'
  ).innerHTML =
  data.pv_v.toFixed(1)
  + " V";

  document.getElementById(
  'pv_i'
  ).innerHTML =
  data.pv_i.toFixed(1)
  + " A";

  document.getElementById(
  'pv_p'
  ).innerHTML =
  data.pv_p.toFixed(1)
  + " W";

  /* BATTERY */

  document.getElementById(
  'bat_v'
  ).innerHTML =
  data.bat_v.toFixed(1)
  + " V";

  document.getElementById(
  'bat_i'
  ).innerHTML =
  data.bat_i.toFixed(1)
  + " A";

  document.getElementById(
  'soc'
  ).innerHTML =
  data.soc.toFixed(0)
  + " %";

  /* MPPT */

  document.getElementById(
  'charge_p'
  ).innerHTML =
  data.charge_p.toFixed(1)
  + " W";

  document.getElementById(
  'mppt_eff'
  ).innerHTML =
  data.mppt_eff.toFixed(0)
  + " %";

  /* LOAD */

  document.getElementById(
  'load_p'
  ).innerHTML =
  data.load_p.toFixed(1)
  + " W";

  document.getElementById(
  'kwh_day'
  ).innerHTML =
  data.kwh_day.toFixed(2)
  + " kWh";

  document.getElementById(
  'kwh_month'
  ).innerHTML =
  data.kwh_month.toFixed(2)
  + " kWh";

  /* STATUS */

  let batteryStatus =
  "IDLE";

  if(data.bat_i > 0){

    batteryStatus =
    "CHARGING";

  } else if(data.bat_i < 0){

    batteryStatus =
    "DISCHARGING";
  }

  document.getElementById(
  'battery_status'
  ).innerHTML =
  batteryStatus;

  /* SOC BAR */

  document.getElementById(
  'soc_fill'
  ).style.width =
  data.soc + "%";

  /* CHART */

  const time =
  new Date()
  .toLocaleTimeString();

  updateChart(
  hourChart,
  time,
  data.load_p
  );

  updateChart(
  dayChart,
  time,
  data.kwh_day
  );

  updateChart(
  monthChart,
  time,
  data.kwh_month
  );

});