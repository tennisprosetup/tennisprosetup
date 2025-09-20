const PUBLISHED_CSV_URL = "YOUR_PUBLISHED_CSV_CSV_URL_HERE";

function createPlayerRow(item) {
  const player = item.Player || "";
  const photo = item["Photo URL"] || "";
  const country = item.Country || "";
  const racket = `${item["Racket Brand"] || ""} ${item["Racket Model"] || ""}`;
  const strings = `${item["String Brand"] || ""} ${item["String Model"] || ""}`;
  const shoes = `${item["Shoe Brand"] || ""} ${item["Shoe Model"] || ""}`;
  const notes = item.Notes || "";
  const slug = item.Slug || "";

  const tr = document.createElement("tr");

  // Player
  const tdPlayer = document.createElement("td");
  tdPlayer.innerHTML = photo ? `<img class="player-thumb" src="${photo}" alt="${player}"> <a href="player.html?player=${slug}"><strong>${player}</strong></a>` : `<a href="player.html?player=${slug}"><strong>${player}</strong></a>`;
  tr.appendChild(tdPlayer);

  // Country
  const tdCountry = document.createElement("td");
  tdCountry.textContent = country;
  tr.appendChild(tdCountry);

  // Racket
  const tdRacket = document.createElement("td");
  tdRacket.textContent = racket;
  tr.appendChild(tdRacket);

  // Strings
  const tdStrings = document.createElement("td");
  tdStrings.textContent = strings;
  tr.appendChild(tdStrings);

  // Shoes
  const tdShoes = document.createElement("td");
  tdShoes.textContent = shoes;
  tr.appendChild(tdShoes);

  // Notes
  const tdNotes = document.createElement("td");
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
  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return populateTable(rows);

    const filtered = rows.filter(r => {
      const combined = `${r.Player} ${r.Country} ${r["Racket Brand"]} ${r["Racket Model"]} ${r["String Brand"]} ${r["String Model"]} ${r["Shoe Brand"]} ${r["Shoe Model"]}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });
    populateTable(filtered);
  });
}

function init() {
  if (!PUBLISHED_CSV_URL || PUBLISHED_CSV_URL.includes("PASTE_YOUR")) {
    document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='6'>Add your Google Sheets CSV URL to script.js</td></tr>";
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
