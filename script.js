const hours = Array.from({length: 24}, (_, i) => i);
const tbody = document.querySelector("#weekTable tbody");
const days = 7;
const sleepHours = [23,0,1,2,3,4,5,6];
const dailyScoresEl = document.getElementById("dailyScores");
const weeklyScoreEl = document.getElementById("weeklyScore");

// Load saved data from localStorage
let savedSchedule = JSON.parse(localStorage.getItem("weeklySchedule")) || {};

// Create table
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

    // Load from saved schedule
    const key = `${day}-${hour}`;
    if(savedSchedule[key]){
      td.textContent = savedSchedule[key];
      td.classList.add("filled");
      if(savedSchedule[key] === "نوم") td.classList.add("sleep");
    } else if(sleepHours.includes(hour)){
      td.textContent = "نوم";
      td.classList.add("sleep", "filled");
    } else {
      td.classList.add("empty");
    }

    // Drag & Drop
    td.addEventListener("dragover", e => e.preventDefault());
    td.addEventListener("drop", e => {
      e.preventDefault();
      const activity = e.dataTransfer.getData("text");
      const slot = parseInt(e.dataTransfer.getData("slot")) || 2;

      for(let s=0;s<slot;s++){
        const targetHour = hour + s;
        if(targetHour < 24){
          const key2 = `${day}-${targetHour}`;
          const td2 = document.querySelector(`td[data-day='${day}'][data-hour='${targetHour}']`);
          td2.textContent = activity;
          td2.classList.add("filled");
          td2.classList.remove("empty");
          if(activity === "نوم") td2.classList.add("sleep"); else td2.classList.remove("sleep");
          savedSchedule[key2] = activity;
        }
      }
      saveSchedule();
      calculateAssessment();
    });

    // Click to remove
    td.addEventListener("click", ()=>{
      if(!td.classList.contains("sleep")){
        td.textContent="";
        td.classList.remove("filled");
        td.classList.add("empty");
        const key = `${day}-${hour}`;
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
document.querySelectorAll("#activityList li").forEach(item => {
  item.addEventListener("dragstart", e=>{
    e.dataTransfer.setData("text", item.textContent);
    e.dataTransfer.setData("slot", item.dataset.slot);
  });
});

// Save schedule to localStorage
function saveSchedule(){
  localStorage.setItem("weeklySchedule", JSON.stringify(savedSchedule));
}

// Assessment
function calculateAssessment(){
  dailyScoresEl.innerHTML = "";
  let totalPoints = 0;
  let totalSlots = 0;

  for(let day=0; day<days; day++){
    let dayPoints = 0;
    let daySlots = 24;
    let tvCount = 0;
    let sleepCount = 0;
    let cleaningCount = 0;
    let studyCount = 0;

    for(let h=0; h<24; h++){
      const key = `${day}-${h}`;
      const val = savedSchedule[key] || (sleepHours.includes(h)?"نوم":"");
      if(val==="نوم") sleepCount++;
      if(val==="تنظيف") cleaningCount++;
      if(val==="دراسة") studyCount++;
      if(val==="تلفاز") tvCount++;
    }

    dayPoints = sleepCount + cleaningCount + studyCount;
    let dayPercent = Math.round((dayPoints/24)*100);
    totalPoints += dayPoints;
    totalSlots += 24;

    // Create daily score element
    const div = document.createElement("div");
    div.classList.add("daily-score");
    div.innerHTML = `اليوم ${day+1}: <span class="${dayPercent>=50?'green':'red'}">${dayPercent}%</span>`;
    if(tvCount>2) div.innerHTML += " ⚠️ وقت التلفاز كثير!";
    dailyScoresEl.appendChild(div);
  }

  // Weekly
  let weeklyPercent = Math.round((totalPoints/totalSlots)*100);
  weeklyScoreEl.textContent = `إجمالي الأسبوع: ${weeklyPercent}%`;
  weeklyScoreEl.className = weeklyPercent>=50?"green":"red";

  // Message
  if(weeklyPercent>=75){
    weeklyScoreEl.textContent += " 👍 رائع! أحسنت.";
  } else if(weeklyPercent>=50){
    weeklyScoreEl.textContent += " 🙂 جيد، يمكن التحسين.";
  } else{
    weeklyScoreEl.textContent += " ⚠️ انتبه! حاول تنظيم وقتك أفضل.";
  }
}

// Button update
document.getElementById("recalculate").addEventListener("click", calculateAssessment);

// Initial calculation
calculateAssessment();
