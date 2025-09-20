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
  const player = item.Player || "";
  const slug = item.Slug || "";
  const flag = item.Flag || "";
  const racket = item["Racket Model"] || "";
  const strings = item["String Model"] || "";
  const shoes = item["Shoe Model"] || "";
  const notes = item.Notes || "";

  const tr = document.createElement("tr");

  // Player cell with flag emoji
  const tdPlayer = document.createElement("td");
  tdPlayer.setAttribute("data-label", "Player");
  tdPlayer.innerHTML = `${flag} <a href="player.html?player=${slug}"><strong>${player}</strong></a>`;
  tr.appendChild(tdPlayer);

  // Racket (clickable)
  const tdRacket = document.createElement("td");
  tdRacket.setAttribute("data-label", "Racket");
  tdRacket.innerHTML = `<a href="gear.html?type=racket&name=${encodeURIComponent(racket)}">${racket}</a>`;
  tr.appendChild(tdRacket);

  // Strings (clickable)
  const tdStrings = document.createElement("td");
  tdStrings.setAttribute("data-label", "Strings");
  tdStrings.innerHTML = `<a href="gear.html?type=strings&name=${encodeURIComponent(strings)}">${strings}</a>`;
  tr.appendChild(tdStrings);

  // Shoes (clickable)
  const tdShoes = document.createElement("td");
  tdShoes.setAttribute("data-label", "Shoes");
  tdShoes.innerHTML = `<a href="gear.html?type=shoes&name=${encodeURIComponent(shoes)}">${shoes}</a>`;
  tr.appendChild(tdShoes);

  // Notes
  const tdNotes = document.createElement("td");
  tdNotes.setAttribute("data-label", "Notes");
  tdNotes.textContent = notes;
  tr.appendChild(tdNotes);

  return tr;
}

// Populate table
function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  if (!rows || rows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No data found</td></tr>";
    return;
  }
  rows.forEach(r => tbody.appendChild(createPlayerRow(r)));
}

// Search filter
function setupSearch(rows) {
  const input = document.getElementById("search");
  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return populateTable(rows);

    const filtered = rows.filter(r => {
      const combined = `${r.Player} ${r["Racket Model"]} ${r["String Model"]} ${r["Shoe Model"]}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });

    populateTable(filtered);
  });
}

// Init
async function init() {
  const tbody = document.querySelector("#gear-table tbody");
  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error("Failed to fetch CSV");
    const text = await res.text();
    const data = csvToArray(text);

    populateTable(data);
    setupSearch(data);
  } catch (err) {
    console.error("Error loading CSV:", err);
    tbody.innerHTML = `<tr><td colspan='5'>Failed to load data: ${err.message}</td></tr>`;
  }
}

window.addEventListener("load", init);
