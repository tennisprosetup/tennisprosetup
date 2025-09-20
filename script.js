const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

function createPlayerRow(item) {
  try {
    const player = item.Player || "";
    const photo = item["Photo URL"] || "";
    const country = item.Country || "";
    const racket = `${item["Racket Brand"] || ""} ${item["Racket Model"] || ""}`;
    const strings = `${item["String Brand"] || ""} ${item["String Model"] || ""}`;
    const shoes = `${item["Shoe Brand"] || ""} ${item["Shoe Model"] || ""}`;
    const notes = item.Notes || "";
    const slug = item.Slug || "";

    const tr = document.createElement("tr");

    const tdPlayer = document.createElement("td");
    tdPlayer.innerHTML = photo ? `<img class="player-thumb" src="${photo}" alt="${player}"> <a href="player.html?player=${slug}"><strong>${player}</strong></a>` : `<a href="player.html?player=${slug}"><strong>${player}</strong></a>`;
    tr.appendChild(tdPlayer);

    const tdCountry = document.createElement("td");
    tdCountry.textContent = country;
    tr.appendChild(tdCountry);

    const tdRacket = document.createElement("td");
    tdRacket.textContent = racket;
    tr.appendChild(tdRacket);

    const tdStrings = document.createElement("td");
    tdStrings.textContent = strings;
    tr.appendChild(tdStrings);

    const tdShoes = document.createElement("td");
    tdShoes.textContent = shoes;
    tr.appendChild(tdShoes);

    const tdNotes = document.createElement("td");
    tdNotes.textContent = notes;
    tr.appendChild(tdNotes);

    return tr;
  } catch (err) {
    console.error("Error creating table row:", err, item);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6">Error rendering row for player: ${item.Player || "Unknown"}</td>`;
    return tr;
  }
}

function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  if (!rows || rows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>No data found in the spreadsheet.</td></tr>";
    console.warn("No rows found to populate table.");
    return;
  }
  rows.forEach(r => tbody.appendChild(createPlayerRow(r)));
}

function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return populateTable(rows);

    const filtered = rows.filter(r => {
      const combined = `${r.Player || ""} ${r.Country || ""} ${r["Racket Brand"] || ""} ${r["Racket Model"] || ""} ${r["String Brand"] || ""} ${r["String Model"] || ""} ${r["Shoe Brand"] || ""} ${r["Shoe Model"] || ""}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });

    if (filtered.length === 0) {
      console.warn("Search returned 0 results for query:", q);
    }

    populateTable(filtered);
  });
}

function init() {
  if (!PUBLISHED_CSV_URL || PUBLISHED_CSV_URL.includes("PASTE_YOUR")) {
    document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='6'>Add your Google Sheets CSV URL to script.js</td></tr>";
    console.error("CSV URL missing in script.js.");
    return;
  }

  try {
    Tabletop.init({
      key: PUBLISHED_CSV_URL,
      callback: function(data, tabletop) {
        if (!data || data.length === 0) {
          console.error("No data returned from Tabletop. Check CSV URL and headers.");
          document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='6'>Failed to load data from spreadsheet.</td></tr>";
          return;
        }
        console.log("Data loaded successfully:", data);
        populateTable(data);
        setupSearch(data);
      },
      simpleSheet: true,
      debug: true
    });
  } catch (err) {
    console.error("Error initializing Tabletop:", err);
    document.querySelector("#gear-table tbody").innerHTML = "<tr><td colspan='6'>Failed to load spreadsheet.</td></tr>";
  }
}

window.addEventListener("load", init);
