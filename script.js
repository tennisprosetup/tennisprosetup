// ---------- CONFIG: paste your published CSV URL here ----------
const PUBLISHED_CSV_URL = "YOUR_PUBLISHED_CSV_CSV_URL_HERE";
// ----------------------------------------------------------------

function createPlayerRow(item) {
  const player = item["Player"] || "";
  const photo = item["Photo URL"] || "";
  const country = item["Country"] || "";
  const racketBrand = item["Racket Brand"] || "";
  const racketModel = item["Racket Model"] || "";
  const stringBrand = item["String Brand"] || "";
  const stringModel = item["String Model"] || "";
  const shoeBrand = item["Shoe Brand"] || "";
  const shoeModel = item["Shoe Model"] || "";
  const notes = item["Notes"] || "";
  const slug = item["Slug"] || "";

  const tr = document.createElement("tr");

  // Player
  const tdPlayer = document.createElement("td");
  tdPlayer.setAttribute("data-label", "Player");
  tdPlayer.innerHTML = photo ? `<img class="player-thumb" src="${photo}" alt="${player}"> <strong>${player}</strong>` : `<strong>${player}</strong>`;
  tr.appendChild(tdPlayer);

  // Country
  const tdCountry = document.createElement("td");
  tdCountry.setAttribute("data-label", "Country");
  tdCountry.textContent = country;
  tr.appendChild(tdCountry);

  // Racket
  const tdRacket = document.createElement("td");
  tdRacket.setAttribute("data-label", "Racket");
  tdRacket.textContent = `${racketBrand} ${racketModel}`;
  tr.appendChild(tdRacket);

  // Strings
  const tdStrings = document.createElement("td");
  tdStrings.setAttribute("data-label", "Strings");
  tdStrings.textContent = `${stringBrand} ${stringModel}`;
  tr.appendChild(tdStrings);

  // Shoes
  const tdShoes = document.createElement("td");
  tdShoes.setAttribute("data-label", "Shoes");
  tdShoes.textContent = `${shoeBrand} ${shoeModel}`;
  tr.appendChild(tdShoes);

  // Notes / Buy link (optional)
  const tdNotes = document.createElement("td");
  tdNotes.setAttribute("data-label", "Notes");
  tdNotes.textContent = notes;
  tr.appendChild(tdNotes);

  return tr;
}

function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  rows.forEach(r => tbody.appendChild(createPlayerRow(r)));
}

function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      populateTable(rows);
      return;
    }
    const filtered = rows.filter(r => {
      const combined = `${r.Player} ${r["Racket Brand"]} ${r["Racket Model"]} ${r["String Brand"]} ${r["String Model"]} ${r["Shoe Brand"]} ${r["Shoe Model"]}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });
    populateTable(filtered);
  });
}

// Tabletop init
function init() {
  if (!PUBLISHED_CSV_URL || PUBLISHED_CSV_URL.includes("PASTE_YOUR")) {
    document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='7'>Add your Google Sheets published CSV URL to script.js configuration.</td></tr>";
    return;
  }

  Tabletop.init({
    key: PUBLISHED_CSV_URL,
    callback: function(data) {
      populateTable(data);
      setupSearch(data);
    },
    simpleSheet: true
  });
}

window.addEventListener("load", init);
