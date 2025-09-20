// ---------- CONFIG: paste your published CSV URL here ----------
const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";
// ----------------------------------------------------------------

function createPlayerRow(item) {
  const player = item["Player"] || "";
  const gear = item["Gear Type"] || "";
  const model = item["Model"] || "";
  const specs = item["Specs"] || "";
  const link = item["Affiliate Link"] || "";
  const photo = item["Photo URL"] || "";

  const tr = document.createElement("tr");

  const tdPlayer = document.createElement("td");
  tdPlayer.setAttribute("data-label","Player");
  tdPlayer.innerHTML = photo ? `<img class="player-thumb" src="${photo}" alt="${player}"> <strong>${player}</strong>` : `<strong>${player}</strong>`;
  tr.appendChild(tdPlayer);

  const tdGear = document.createElement("td");
  tdGear.setAttribute("data-label","Gear");
  tdGear.textContent = gear;
  tr.appendChild(tdGear);

  const tdModel = document.createElement("td");
  tdModel.setAttribute("data-label","Model");
  tdModel.textContent = model;
  tr.appendChild(tdModel);

  const tdSpecs = document.createElement("td");
  tdSpecs.setAttribute("data-label","Specs");
  tdSpecs.textContent = specs;
  tr.appendChild(tdSpecs);

  const tdBuy = document.createElement("td");
  tdBuy.setAttribute("data-label","Buy");
  tdBuy.innerHTML = link ? `<a class="buy-btn" href="${link}" target="_blank" rel="noopener noreferrer">Buy</a>` : "—";
  tr.appendChild(tdBuy);

  return tr;
}

function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  rows.forEach(r => tbody.appendChild(createPlayerRow(r)));
}

function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = rows.filter(r => (`${r.Player} ${r.Model} ${r["Gear Type"]} ${r.Specs}`.toLowerCase().includes(q)));
    populateTable(filtered);
  });
}

function init() {
  fetch(PUBLISHED_CSV_URL)
    .then(res => res.text())
    .then(csvText => {
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",").map(h => h.trim());
      const data = lines.map(line => {
        const values = line.split(",");
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || "" }), {});
      });
      populateTable(data);
      setupSearch(data);
    })
    .catch(err => console.error("CSV fetch error:", err));
}

window.addEventListener("load", init);
