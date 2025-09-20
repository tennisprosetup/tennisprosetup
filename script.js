// ---------- CONFIG: paste your published CSV URL here ----------
const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";
// ----------------------------------------------------------------

function createPlayerRow(item) {
  // Sanitize values (basic)
  const player = item["Player"] || "";
  const gear = item["Gear Type"] || item["Gear"] || item["GearType"] || item["Gear_Type"] || item["GearType"] || "";
  const model = item["Model"] || "";
  const specs = item["Specs"] || "";
  const link = item["Affiliate Link"] || item["Affiliate_Link"] || item["Affiliate"] || "";
  const photo = item["Photo URL"] || item["Photo"] || "";

  const tr = document.createElement("tr");

  // Player cell (with thumb)
  const tdPlayer = document.createElement("td");
  tdPlayer.setAttribute("data-label","Player");
  const playerHTML = photo ? `<img class="player-thumb" src="${photo}" alt="${player}"> <strong>${player}</strong>` : `<strong>${player}</strong>`;
  tdPlayer.innerHTML = playerHTML;
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
  if (link && link.trim().length) {
    tdBuy.innerHTML = `<a class="buy-btn" href="${link}" target="_blank" rel="noopener noreferrer">Buy</a>`;
  } else {
    tdBuy.textContent = "—";
  }
  tr.appendChild(tdBuy);

  return tr;
}

function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  // Clear
  tbody.innerHTML = "";
  rows.forEach(r => {
    tbody.appendChild(createPlayerRow(r));
  });
}

// Basic search filter
function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      populateTable(rows);
      return;
    }
    const filtered = rows.filter(r => {
      const combined = `${r.Player} ${r["Model"] || ""} ${r["Gear Type"] || ""} ${r.Specs || ""}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });
    populateTable(filtered);
  });
}

// Use Tabletop to fetch the sheet as simpleSheet
function init() {
  if (!PUBLISHED_CSV_URL || PUBLISHED_CSV_URL.includes("PASTE_YOUR")) {
    document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='5'>Add your Google Sheets published CSV URL to script.js configuration.</td></tr>";
    return;
  }

  // Tabletop accepts spreadsheet key or full URL. It can work with CSV if published.
  Tabletop.init({
    key: PUBLISHED_CSV_URL,
    callback: function(data) {
      // data will be an array of objects
      populateTable(data);
      setupSearch(data);
    },
    simpleSheet: true
  });
}

// start
window.addEventListener("load", init);
