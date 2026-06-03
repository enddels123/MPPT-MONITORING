const client = mqtt.connect("wss://broker.hivemq.com:8000/mqtt");
const topic = "solar/jnge/hybrid";

let chart;

window.onload = () => {

  chart = new Chart(document.getElementById("chart"), {
    type:"line",
    data:{
      labels:[],
      datasets:[
        {
          label:"PV Power",
          data:[],
          borderColor:"#00ffcc",
          tension:0.4
        },
        {
          label:"Battery V",
          data:[],
          borderColor:"#00ff00",
          tension:0.4
        }
      ]
    }
  });
};

client.on("connect", () => {
  client.subscribe(topic);
});

client.on("message", (t,msg)=>{

  const d = JSON.parse(msg.toString());

  pv_v.innerText = d.pv_v;
  pv_i.innerText = d.pv_i;
  pv_p.innerText = d.pv_p;

  bat_v.innerText = d.bat_v;
  bat_i.innerText = d.bat_i;

  soc.innerText = d.soc;
  kwh_day.innerText = d.kwh_day;
  kwh_month.innerText = d.kwh_month;

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(d.pv_p);
  chart.data.datasets[1].data.push(d.bat_v);

  if(chart.data.labels.length>20){
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();

});