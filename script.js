const hours = Array.from({length: 24}, (_, i) => i);
const tbody = document.querySelector("#weekTable tbody");

// Create table
hours.forEach(hour => {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.textContent = `${hour}:00`;
  tr.appendChild(th);

  for (let i = 0; i < 7; i++) {
    const td = document.createElement("td");
    td.classList.add("droppable");
    td.dataset.hour = hour;
    td.dataset.day = i;

    // Pre-fill sleep (23:00-07:00)
    if (hour >= 23 || hour < 7) {
      td.textContent = "نوم";
      td.classList.add("sleep", "filled");
    } else {
      td.classList.add("empty");
    }

    // Drag events
    td.addEventListener("dragover", e => e.preventDefault());
    td.addEventListener("drop", e => {
      e.preventDefault();
      const activity = e.dataTransfer.getData("text");
      td.textContent = activity;
      td.classList.remove("empty");
      td.classList.add("filled");
      td.classList.remove("sleep"); // overwrite sleep if needed
    });

    // Click to remove
    td.addEventListener("click", () => {
      if (!td.classList.contains("sleep")) {
        td.textContent = "";
        td.classList.remove("filled");
        td.classList.add("empty");
      }
    });

    tr.appendChild(td);
  }
  tbody.appendChild(tr);
});

// Drag from sidebar
document.querySelectorAll("#activityList li").forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text", item.textContent);
  });
});

// Assessment system
const scoreEl = document.getElementById("score");
const alertEl = document.getElementById("alert");
document.getElementById("recalculate").addEventListener("click", assess);

function assess() {
  const cells = document.querySelectorAll("#weekTable td");
  let total = 24*7; // total slots in week
  let points = 0;
  let tvCount = 0;

  cells.forEach(td => {
    if (td.textContent === "نوم" || td.textContent === "تنظيف" || td.textContent === "دراسة") {
      points++;
    }
    if (td.textContent === "تلفاز") tvCount++;
  });

  // Deduct empty slots
  const emptyCells = document.querySelectorAll("#weekTable td.empty");
  points -= emptyCells.length;

  // Calculate %
  let percent = Math.max(Math.round((points/total)*100), 0);
  scoreEl.textContent = `النسبة: ${percent}%`;

  // TV alert
  if (tvCount > 14) { // more than 2 hours per day x 7 days = 14 slots
    alertEl.textContent = "تنبيه: وقت التلفاز كثير!";
  } else {
    alertEl.textContent = "";
  }
}
