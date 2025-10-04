const hours = Array.from({length: 24}, (_, i) => i);
const tbody = document.querySelector("#weekTable tbody");
const days = 7;
const sleepHours = [23,0,1,2,3,4,5,6];
const dailyScoresEl = document.getElementById("dailyScores");
const weeklyScoreEl = document.getElementById("weeklyScore");

let savedSchedule = JSON.parse(localStorage.getItem("weeklySchedule")) || {};

// Build table
hours.forEach(hour => {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.textContent = `${hour}:00`;
  tr.appendChild(th);

  for (let day=0; day<days; day++){
    const td = document.createElement("td");
    td.dataset.hour = hour;
    td.dataset.day = day;
    td.classList.add("droppable");

    const key = `${day}-${hour}`;
    if(savedSchedule[key]){
      td.textContent = savedSchedule[key];
      td.classList.add("filled");
      if(savedSchedule[key] === "نوم") td.classList.add("sleep");
    } else if(sleepHours.includes(hour)){
      td.textContent = "نوم";
      td.classList.add("sleep","filled");
    } else {
      td.classList.add("empty");
    }

    td.addEventListener("dragover", e=>e.preventDefault());
    td.addEventListener("drop", e=>{
      e.preventDefault();
      const activity = e.dataTransfer.getData("text");
      td.textContent = activity;
      td.classList.add("filled");
      td.classList.remove("empty");
      if(activity==="نوم") td.classList.add("sleep"); else td.classList.remove("sleep");
      savedSchedule[key] = activity;
      saveSchedule();
      calculateAssessment();
    });

    td.addEventListener("click", ()=>{
      if(!td.classList.contains("sleep")){
        td.textContent="";
        td.classList.remove("filled");
        td.classList.add("empty");
        delete savedSchedule[key];
        saveSchedule();
        calculateAssessment();
      }
    });

    tr.appendChild(td);
  }
  tbody.appendChild(tr);
});

// Drag from sidebar
document.querySelectorAll("#activityList li").forEach(item=>{
  item.addEventListener("dragstart", e=>{
    e.dataTransfer.setData("text", item.textContent);
  });
});

function saveSchedule(){
  localStorage.setItem("weeklySchedule", JSON.stringify(savedSchedule));
}

function calculateAssessment(){
  dailyScoresEl.innerHTML="";
  const dailyExtraScoresEl = document.getElementById("dailyExtraScores");
  dailyExtraScoresEl.innerHTML="";

  let totalSleepPoints=0, totalSleepSlots=0, totalExtraPoints=0, totalExtraSlots=0;
  const workingActivities = ["تنظيف","دراسة"];
  const negativeActivities = ["تلفاز","استرخاء"];

  for(let day=0; day<days; day++){
    let sleepPoints=0, extraPoints=0, extraSlots=0;
    let tvCount=0, chillingCount=0;

    for(let h=0; h<24; h++){
      const key=`${day}-${h}`;
      const val = savedSchedule[key] || (sleepHours.includes(h)?"نوم":"");

      if(val==="نوم") sleepPoints++;

      if(!sleepHours.includes(h)){
        extraSlots++;
        if(workingActivities.includes(val)) extraPoints+=2;
        else if(val && val!=="") extraPoints+=1;
        if(val==="تلفاز") tvCount++;
        if(val==="استرخاء") chillingCount++;
      }
    }

    const sleepPercent = Math.round((sleepPoints/8)*100);
    totalSleepPoints+=sleepPoints;
    totalSleepSlots+=8;

    const sleepDiv=document.createElement("div");
    sleepDiv.classList.add("daily-score");
    sleepDiv.innerHTML=`اليوم ${day+1} (نوم): <span class="${sleepPercent>=50?'green':'red'}">${sleepPercent}%</span>`;
    dailyScoresEl.appendChild(sleepDiv);

    let extraPercent=Math.round((extraPoints/(extraSlots*2))*100);
    if(tvCount>2) extraPercent-=10;
    if(chillingCount>2) extraPercent-=10;
    extraPercent=Math.max(extraPercent,0);
    totalExtraPoints+=extraPoints;
    totalExtraSlots+=extraSlots*2;

    const extraDiv=document.createElement("div");
    extraDiv.classList.add("daily-score");
    extraDiv.innerHTML=`اليوم ${day+1} (نشاطات): <span class="${extraPercent>=50?'green':'red'}">${extraPercent}%</span>`;
    if(extraPercent>=75) extraDiv.innerHTML+=" 👍 ممتاز! وقتك مستغل جيدًا.";
    else if(extraPercent>=50) extraDiv.innerHTML+=" 🙂 جيد، يمكن التحسين.";
    else extraDiv.innerHTML+=" ⚠️ انتبه! حاول تنظيم وقتك.";
    dailyExtraScoresEl.appendChild(extraDiv);
  }

  const weeklySleepPercent=Math.round((totalSleepPoints/totalSleepSlots)*100);
  weeklyScoreEl.textContent=`إجمالي النوم: ${weeklySleepPercent}%`;
  weeklyScoreEl.className=weeklySleepPercent>=50?"green":"red";

  const weeklyExtraPercent=Math.round((totalExtraPoints/totalExtraSlots)*100);
  const weeklyExtraEl=document.getElementById("weeklyExtraScore");
  weeklyExtraEl.textContent=`إجمالي النشاطات الأخرى: ${weeklyExtraPercent}%`;
  weeklyExtraEl.className=weeklyExtraPercent>=50?"green":"red";
}

document.getElementById("recalculate").addEventListener("click", calculateAssessment);
calculateAssessment();

// Export PDF/Image
document.getElementById("exportPDF").addEventListener("click", async ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'pt', 'a4');
  const table=document.getElementById("weekTable");

  await html2canvas(table).then(canvas=>{
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 800;
    const imgHeight = canvas.height*imgWidth/canvas.width;
    doc.addImage(imgData,'PNG',20,20,imgWidth,imgHeight);
    doc.save('جدول_الأسبوع.pdf');
  });
});

document.getElementById("exportImage").addEventListener("click", ()=>{
  const table=document.getElementById("weekTable");
  html2canvas(table).then(canvas=>{
    const link=document.createElement('a');
    link.download='جدول_الأسبوع.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
  });
});
