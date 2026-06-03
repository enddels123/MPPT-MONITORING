const client = mqtt.connect("wss://broker.hivemq.com:8000/mqtt");

// topic sama dengan ESP32 kamu
const topic = "solar/jnge/hybrid";

client.on("connect", () => {
  console.log("MQTT Connected");
  client.subscribe(topic);
});

client.on("message", (t, msg) => {

  const d = JSON.parse(msg.toString());

  document.getElementById("pv_v").innerText = d.pv_v;
  document.getElementById("pv_i").innerText = d.pv_i;
  document.getElementById("pv_p").innerText = d.pv_p;

  document.getElementById("bat_v").innerText = d.bat_v;
  document.getElementById("bat_i").innerText = d.bat_i;

  document.getElementById("kwh_day").innerText = d.kwh_day;
  document.getElementById("kwh_month").innerText = d.kwh_month;
});