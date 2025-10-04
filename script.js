const hours = Array.from({length: 24}, (_, i) => i + ":00");
const tbody = document.querySelector("#weekTable tbody");

// Fill the table with hours
hours.forEach(hour => {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.textContent = hour;
  tr.appendChild(th);

  for (let i = 0; i < 7; i++) {
    const td = document.createElement("td");
    td.classList.add("droppable");
    td.addEventListener("dragover", e => e.preventDefault());
    td.addEventListener("drop", e => {
      e.preventDefault();
      const activity = e.dataTransfer.getData("text");
      td.textContent = activity;
      td.classList.add("filled");
    });
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
});

// Drag events for activity list
const items = document.querySelectorAll("#activityList li");
items.forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text", item.textContent);
  });
});
