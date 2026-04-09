let data = JSON.parse(localStorage.getItem("therapyData") || "{}");

function save(){ localStorage.setItem("therapyData", JSON.stringify(data)); }

function addData(){
  let d = document.getElementById("tag").value;
  data[d] = {
    leuko: parseFloat(document.getElementById("leuko").value),
    hb: parseFloat(document.getElementById("hb").value),
    thr: parseFloat(document.getElementById("thr").value)
  };
  save();
  alert("Gespeichert");
}

function exportData(){
  let blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "therapie_daten.json";
  a.click();
}

function importData(event){
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.onload = function(e){
    data = JSON.parse(e.target.result);
    save();
    alert("Daten geladen");
  };
  reader.readAsText(file);
}

function draw(){
  let days=[...Array(72).keys()].map(x=>x+1);
  let leuk=[],hb=[],thr=[];

  days.forEach((d,i)=>{
    if(data[d]){
      leuk[i]=data[d].leuko/7*100;
      hb[i]=data[d].hb/14*100;
      thr[i]=data[d].thr/250*100;
    } else {
      leuk[i]=hb[i]=thr[i]=null;
    }
  });

  let canvas = document.getElementById("c");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,900,400);

  function drawLine(arr,color){
    ctx.beginPath();
    arr.forEach((v,i)=>{
      if(v==null) return;
      let x=i*12;
      let y=400 - v*3;
      if(i==0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    });
    ctx.strokeStyle=color;
    ctx.stroke();
  }

  drawLine(leuk,"blue");
  drawLine(hb,"green");
  drawLine(thr,"red");
}
