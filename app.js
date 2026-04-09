let data = JSON.parse(localStorage.getItem("therapyFinal") || "{}");

function save(){ localStorage.setItem("therapyFinal", JSON.stringify(data)); }

function addData(){
  let d=tag.value;
  if(!d) return;
  data[d]={leuko:+leuko.value,hb:+hb.value,thr:+thr.value,crp:+crp.value};
  save();
  ["tag","leuko","hb","thr","crp"].forEach(id=>document.getElementById(id).value="");
  renderList();
}

function renderList(){
  let keys=Object.keys(data).sort((a,b)=>a-b);
  list.innerHTML=keys.map(k=>"Tag "+k+": "+JSON.stringify(data[k])).join("<br>");
}

function draw(){

  let days=[...Array(72).keys()].map(x=>x+1);
  let leuk=[],hb=[],thr=[],anc=[];

  days.forEach((d,i)=>{
    if(data[d]){
      leuk[i]=data[d].leuko/7*100;
      hb[i]=data[d].hb/14*100;
      thr[i]=data[d].thr/250*100;
    } else leuk[i]=hb[i]=thr[i]=null;
  });

  function interp(a){
    let last=null;
    for(let i=0;i<a.length;i++){
      if(a[i]!=null){
        if(last!=null){
          let step=(a[i]-a[last])/(i-last);
          for(let j=last;j<i;j++) a[j]=a[last]+step*(j-last);
        }
        last=i;
      }
    }
    return a;
  }

  leuk=interp(leuk);
  hb=interp(hb);
  thr=interp(thr);

  let last=leuk.findIndex(x=>x===null)-1;
  if(last<0) last=7;

  let leukProg=[...leuk];
  let hbProg=[...hb];
  let thrProg=[...thr];

  for(let i=last+1;i<72;i++){
    let d=i-last;
    leukProg[i]=leuk[last]*(1-0.8*Math.exp(-d/5));
    thrProg[i]=thr[last]*(1-0.7*Math.exp(-d/6));
    hbProg[i]=hb[last]*(1-0.2*Math.exp(-d/10));
  }

  anc=leukProg.map(x=>x?x*0.7:null);

  let ctx=c.getContext("2d");
  ctx.clearRect(0,0,900,450);

  // grid
  ctx.strokeStyle="#ccc";
  for(let y=0;y<=120;y+=20){
    let py=400-y*3;
    ctx.beginPath();ctx.moveTo(50,py);ctx.lineTo(850,py);ctx.stroke();
    ctx.fillText(y+"%",5,py);
  }

  ctx.strokeStyle="black";
  ctx.beginPath();ctx.moveTo(50,0);ctx.lineTo(50,400);ctx.lineTo(850,400);ctx.stroke();

  function drawLine(arr,color,dash=false){
    ctx.beginPath();
    if(dash) ctx.setLineDash([5,5]);
    arr.forEach((v,i)=>{
      if(v==null) return;
      let x=50+i*11;
      let y=400-v*3;
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    });
    ctx.strokeStyle=color;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // real
  drawLine(leuk.slice(0,last+1),"blue");
  drawLine(hb.slice(0,last+1),"green");
  drawLine(thr.slice(0,last+1),"red");

  // prognose gestrichelt
  drawLine(leukProg.slice(last),"blue",true);
  drawLine(hbProg.slice(last),"green",true);
  drawLine(thrProg.slice(last),"red",true);

  drawLine(anc,"black",true);

  let minANC=Math.min(...anc.filter(x=>x));
  status.innerHTML=minANC<10?"🔴 kritisch":minANC<50?"🟡 vorsicht":"🟢 stabil";
}

renderList();
