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
   SAFE NUMBER
===================================================== */

function safe(v){

  if(isNaN(v))
    return 0;

  return Number(v);
}

/* =====================================================
   UPDATE TEXT
===================================================== */

function setText(id,val){

  const el =
  document.getElementById(id);

  if(el){

    el.innerHTML = val;
  }
}

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

  /* SVG LINE */

  document
  .querySelectorAll(
    ".flow-lines path"
  )
  .forEach(line=>{

    line.style.stroke =
    color;
  });

  /* NODE */

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
});