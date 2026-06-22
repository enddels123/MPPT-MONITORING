const db = firebase.database();

const mobile =
window.innerWidth < 768;

const NODE_SPEED =
mobile ? 3500 : 1800;

function setValue(id,val,unit=''){
    const e=document.getElementById(id);
    if(e){
        e.innerHTML=
        Number(val).toFixed(2)+unit;
    }
}

function updateNode(power){

    const node =
    document.getElementById("flowNode");

    if(!node) return;

    if(power > 5){

        node.style.display="block";

        node.classList.remove("flow");

        void node.offsetWidth;

        node.style.animationDuration =
        NODE_SPEED+"ms";

        node.classList.add("flow");

    }else{

        node.style.display="none";
    }
}

db.ref("/").on("value",(snap)=>{

    const d=snap.val();

    if(!d) return;

    setValue("pvVoltage",
    d.solar?.voltage||0,"V");

    setValue("pvCurrent",
    d.solar?.current||0,"A");

    setValue("pvPower",
    d.solar?.power||0,"W");

    setValue("batVoltage",
    d.battery?.voltage||0,"V");

    setValue("batCurrent",
    d.battery?.current||0,"A");

    setValue("batPower",
    d.battery?.power||0,"W");

    setValue("batSoc",
    d.battery?.soc||0,"%");

    setValue("loadVoltage",
    d.load?.voltage||0,"V");

    setValue("loadCurrent",
    d.load?.current||0,"A");

    setValue("loadPower",
    d.load?.power||0,"W");

    setValue("mpptEff",
    d.mppt?.efficiency||0,"%");

    setValue("todayKwh",
    d.energy?.today_kwh||0);

    setValue("monthKwh",
    d.energy?.month_kwh||0);

    setValue("totalKwh",
    d.energy?.total_kwh||0);

    setValue("todayRp",
    d.income?.today_rp||0);

    setValue("monthRp",
    d.income?.month_rp||0);

    setValue("totalRp",
    d.income?.total_rp||0);

    document.getElementById(
    "statusText").innerHTML=
    d.system?.online ?
    "ONLINE" :
    "OFFLINE";

    updateNode(
    d.load?.power||0);

    if(window.socGauge){

        socGauge.data.datasets[0]
        .data[0]=
        d.battery?.soc||0;

        socGauge.update();
    }

    if(window.effGauge){

        effGauge.data.datasets[0]
        .data[0]=
        d.mppt?.efficiency||0;

        effGauge.update();
    }

});