// ================= MQTT CONNECT (GITHUB PAGES SAFE) =================
const client = mqtt.connect("wss://broker.hivemq.com:8000/mqtt");

const topic = "solar/jnge/hybrid";

// ================= CHART STORAGE =================
let chart;

// ================= INIT =================
window.onload = function () {

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "PV Power (W)",
          data: [],
          borderColor: "#00ffcc",
          backgroundColor: "transparent",
          tension: 0.4
        },
        {
          label: "Battery Voltage (V)",
          data: [],
          borderColor: "#00ff00",
          backgroundColor: "transparent",
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      animation: false
    }
  });

  console.log("Dashboard Ready");
};

// ================= MQTT CONNECT =================
client.on("connect", () => {
  console.log("MQTT Connected");
  client.subscribe(topic);
});

// ================= MQTT MESSAGE =================
client.on("message", (t, msg) => {

  try {
    const d = JSON.parse(msg.toString());

    // ================= TEXT UPDATE =================
    setText("pv_v", d.pv_v);
    setText("pv_i", d.pv_i);
    setText("pv_p", d.pv_p);

    setText("bat_v", d.bat_v);
    setText("bat_i", d.bat_i);

    setText("kwh_day", d.kwh_day);
    setText("kwh_month", d.kwh_month);

    // ================= GAUGE UPDATE =================
    updateGauge("gauge1", d.pv_p, 200);
    updateGauge("gauge2", d.bat_v, 50);

    // ================= CHART UPDATE =================
    updateChart(d);

  } catch (e) {
    console.log("JSON Error:", e);
  }
});

// ================= HELPERS =================
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = (val ?? 0).toFixed ? val.toFixed(2) : val;
}

// ================= GAUGE UPDATE =================
function updateGauge(canvasId, value, max) {

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const chart = Chart.getChart(canvasId);

  if (!chart) return;

  chart.data.datasets[0].data = [value, max - value];
  chart.update();
}

// ================= CHART UPDATE =================
function updateChart(d) {

  const time = new Date().toLocaleTimeString();

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(d.pv_p || 0);
  chart.data.datasets[1].data.push(d.bat_v || 0);

  // limit 20 data point
  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}