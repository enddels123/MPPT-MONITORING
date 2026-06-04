/* ================= MQTT ================= */

const client = mqtt.connect(
'wss://broker.hivemq.com:8884/mqtt'
);

const topic =
"solar/jnge/hybrid";

/* ================= CONNECT ================= */

client.on('connect', ()=>{

  console.log("MQTT Connected");

  client.subscribe(topic);

});

/* ================= CHART ================= */

const hourChart =
new Chart(
document.getElementById('hourChart'),
{
  type:'bar',

  data:{
    labels:[],

    datasets:[{
      label:'Hourly Power',

      data:[],

      backgroundColor:'#00ff88'
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

const dayChart =
new Chart(
document.getElementById('dayChart'),
{
  type:'line',

  data:{
    labels:[],

    datasets:[{
      label:'Daily kWh',

      data:[],

      borderColor:'#00ffd5',

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

const monthChart =
new Chart(
document.getElementById('monthChart'),
{
  type:'bar',

  data:{
    labels:[],

    datasets:[{
      label:'Monthly kWh',

      data:[],

      backgroundColor:'#00aaff'
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

/* ================= MQTT MESSAGE ================= */

client.on('message',
(topic,message)=>{

  const data =
  JSON.parse(message.toString());

  /* ================= TEXT ================= */

  document.getElementById('voltage')
  .innerHTML =
  data.bat_v.toFixed(1) + " V";

  document.getElementById('current')
  .innerHTML =
  data.bat_i.toFixed(1) + " A";

  document.getElementById('power')
  .innerHTML =
  data.load_p.toFixed(1) + " W";

  document.getElementById('battery')
  .innerHTML =
  data.soc.toFixed(0) + " %";

  document.getElementById('efficiency')
  .innerHTML =
  data.mppt_eff.toFixed(0) + " %";

  document.getElementById('daily')
  .innerHTML =
  data.kwh_day.toFixed(2) + " kWh";

  document.getElementById('status')
  .innerHTML =
  data.status;

  /* ================= LOAD BAR ================= */

  let load =
  Math.min(
  (data.load_p / 2000) * 100,
  100
  );

  document.getElementById('progress')
  .style.width =
  load + "%";

  document.getElementById('loadPercent')
  .innerHTML =
  load.toFixed(0) + "%";

  /* ================= CHART ================= */

  const time =
  new Date()
  .toLocaleTimeString();

  /* HOURLY */

  hourChart.data.labels.push(time);

  hourChart.data.datasets[0]
  .data.push(data.load_p);

  if(hourChart.data.labels.length > 10){

    hourChart.data.labels.shift();

    hourChart.data.datasets[0]
    .data.shift();
  }

  hourChart.update();

  /* DAILY */

  dayChart.data.labels.push(time);

  dayChart.data.datasets[0]
  .data.push(data.kwh_day);

  if(dayChart.data.labels.length > 10){

    dayChart.data.labels.shift();

    dayChart.data.datasets[0]
    .data.shift();
  }

  dayChart.update();

  /* MONTHLY */

  monthChart.data.labels.push(time);

  monthChart.data.datasets[0]
  .data.push(data.kwh_month);

  if(monthChart.data.labels.length > 10){

    monthChart.data.labels.shift();

    monthChart.data.datasets[0]
    .data.shift();
  }

  monthChart.update();

});