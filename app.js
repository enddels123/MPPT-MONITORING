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
          borderColor:"#00ffcc"
        },
        {
          label:"Load Power",
          data:[],
          borderColor:"#ffcc00"
        }
      ]
    }
  });
};

client.on("connect", () => {
  client.subscribe(topic);
});

client.on("message", (t,msg)=>{

  try{

    const d = JSON.parse(msg.toString());

    pv_v.innerText = d.pv_v ?? 0;
    pv_i.innerText = d.pv_i ?? 0;
    pv_p.innerText = d.pv_p ?? 0;

    bat_v.innerText = d.bat_v ?? 0;
    bat_i.innerText = d.bat_i ?? 0;

    soc.innerText = d.soc ?? 0;
    load_p.innerText = d.load_p ?? 0;

    kwh_day.innerText = d.kwh_day ?? 0;
    kwh_month.innerText = d.kwh_month ?? 0;

    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(d.pv_p);
    chart.data.datasets[1].data.push(d.load_p);

    if(chart.data.labels.length > 20){
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
    }

    chart.update();

  } catch(e){
    console.log("MQTT ERROR", e);
  }

});