const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

// Convert CSV text to array of objects
function csvToArray(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines.shift().split(",");
  return lines.map(line => {
    const values = line.split(",");
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i]?.trim() || "";
      return obj;
    }, {});
  });
}

// Create a table row for a player
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

    // Player column with photo and link
    const tdPlayer = document.createElement("td");
    tdPlayer.innerHTML = photo
      ? `<img class="player-thumb" src="${photo}" alt="${player}"> <a href="player.html?player=${slug}"><strong>${player}</strong></a>`
      : `<a href="player.html?player=${slug}"><strong>${player}</strong></a>`;
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
  } catch (err) {
    console.error("Error creating table row:", err, item);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6">Error rendering row for player: ${item.Player || "Unknown"}</td>`;
    return tr;
  }
}

// Populate the table
function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  if (!rows || rows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>No data found in the spreadsheet.</td></tr>";
    console.warn("CSV returned 0 rows");
    return;
  }
  rows.forEach(r => tbody.appendChild(createPlayerRow(r)));
}

// Set up search
function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return populateTable(rows);

    const filtered = rows.filter(r => {
      const combined = `${r.Player || ""} ${r.Country || ""} ${r["Racket Brand"] || ""} ${r["Racket Model"] || ""} ${r["String Brand"] || ""} ${r["String Model"] || ""} ${r["Shoe Brand"] || ""} ${r["Shoe Model"] || ""}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });

    if (filtered.length === 0) console.warn("Search returned 0 results for query:", q);

    populateTable(filtered);
  });
}

// Initialize site
async function init() {
  const tbody = document.querySelector("#gear-table tbody");
  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error("Failed to fetch CSV from Google Sheets");
    const text = await res.text();
    const data = csvToArray(text);

    console.log("CSV data loaded:", data);
    populateTable(data);
    setupSearch(data);
  } catch (err) {
    console.error("Error loading CSV:", err);
    tbody.innerHTML = `<tr><td colspan='6'>Failed to load data: ${err.message}</td></tr>`;
  }
}

window.addEventListener("load", init);
