const client =
mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
"solar/jnge/hybrid";

/* =====================================================
   MQTT CONNECT
===================================================== */

client.on('connect',()=>{

  console.log("MQTT Connected");

  client.subscribe(topic);

});

/* =====================================================
   CREATE CHART
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

        borderWidth:2,

        tension:0.4,

        fill:false
      }]
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
          },

          grid:{
            color:'#23304d'
          }
        },

        y:{

          ticks:{
            color:'white'
          },

          grid:{
            color:'#23304d'
          }
        }
      }
    }
  });
}

/* =====================================================
   CHART INIT
===================================================== */

const powerChart =
createChart(
'powerChart',
'PV Power',
'#00ff88',
'line'
);

const energyDayChart =
createChart(
'energyDayChart',
'Daily Energy',
'#00ffd5',
'bar'
);

const energyMonthChart =
createChart(
'energyMonthChart',
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
  chart.data.labels.length > 15
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

  /* =====================================================
     PV
  ===================================================== */

  document.getElementById(
  'pv_v'
  ).innerHTML =
  data.pv_v.toFixed(1)
  + " V";

  document.getElementById(
  'pv_i'
  ).innerHTML =
  data.pv_i.toFixed(2)
  + " A";

  document.getElementById(
  'pv_p'
  ).innerHTML =
  data.pv_p.toFixed(1)
  + " W";

  /* =====================================================
     BATTERY
  ===================================================== */

  document.getElementById(
  'bat_v'
  ).innerHTML =
  data.bat_v.toFixed(1)
  + " V";

  document.getElementById(
  'bat_i'
  ).innerHTML =
  data.bat_i.toFixed(2)
  + " A";

  document.getElementById(
  'soc'
  ).innerHTML =
  data.soc.toFixed(0)
  + " %";

  /* =====================================================
     SOC BAR
  ===================================================== */

  document.getElementById(
  'soc_fill'
  ).style.width =
  data.soc + "%";

  /* =====================================================
     BATTERY STATUS
  ===================================================== */

  let status =
  "STANDBY";

  if(data.bat_i > 0){

    status =
    "CHARGING";

  } else if(data.bat_i < 0){

    status =
    "DISCHARGING";
  }

  document.getElementById(
  'battery_status'
  ).innerHTML =
  status;

  /* =====================================================
     MPPT
  ===================================================== */

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

  /* =====================================================
     ENERGY
  ===================================================== */

  document.getElementById(
  'total_power'
  ).innerHTML =
  data.pv_p.toFixed(1)
  + " W";

  document.getElementById(
  'kwh_day'
  ).innerHTML =
  data.kwh_day.toFixed(3)
  + " kWh";

  document.getElementById(
  'kwh_month'
  ).innerHTML =
  data.kwh_month.toFixed(3)
  + " kWh";

  /* =====================================================
     CHART
  ===================================================== */

  const time =
  new Date()
  .toLocaleTimeString();

  updateChart(
  powerChart,
  time,
  data.pv_p
  );

  updateChart(
  energyDayChart,
  time,
  data.kwh_day
  );

  updateChart(
  energyMonthChart,
  time,
  data.kwh_month
  );

});