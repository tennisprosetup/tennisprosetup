const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

// Reuse same robust parse logic
function parseCSV(text) {
  if (!text) return [];
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let cur = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      if (ch === '\r' && next === '\n') i++;
    } else {
      cur += ch;
    }
  }
  if (cur !== "" || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function csvToObjects(csvText) {
  const table = parseCSV(csvText);
  if (!table.length) return [];
  const headers = table[0].map(h => h.trim());
  return table.slice(1).map(r => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = (r[i] !== undefined) ? r[i].trim() : "";
    }
    return obj;
  });
}

function createPlayerRow(item) {
  const player = item.Player || "";
  const slug = item.Slug || "";
  const flag = item.Flag || "";
  const racketModel = item["Racket Model"] || "";
  const stringModel = item["String Model"] || "";
  const shoeModel = item["Shoe Model"] || "";
  const notes = item.Notes || "";

  const tr = document.createElement("tr");

  const tdPlayer = document.createElement("td");
  tdPlayer.innerHTML = `${flag} <a href="player.html?player=${encodeURIComponent(slug)}"><strong>${player}</strong></a>`;
  tr.appendChild(tdPlayer);

  const tdRacket = document.createElement("td");
  tdRacket.innerHTML = `<a href="gear.html?type=racket&name=${encodeURIComponent(racketModel)}">${racketModel}</a>`;
  tr.appendChild(tdRacket);

  const tdStrings = document.createElement("td");
  tdStrings.innerHTML = `<a href="gear.html?type=strings&name=${encodeURIComponent(stringModel)}">${stringModel}</a>`;
  tr.appendChild(tdStrings);

  const tdShoes = document.createElement("td");
  tdShoes.innerHTML = `<a href="gear.html?type=shoes&name=${encodeURIComponent(shoeModel)}">${shoeModel}</a>`;
  tr.appendChild(tdShoes);

  const tdNotes = document.createElement("td");
  tdNotes.textContent = notes;
  tr.appendChild(tdNotes);

  return tr;
}

function populateTable(rows) {
  const tbody = document.querySelector("#gear-table tbody");
  tbody.innerHTML = "";
  if (!rows || rows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No data found</td></tr>";
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
      const combined = `${r.Player || ""} ${r["Racket Model"] || ""} ${r["String Model"] || ""} ${r["Shoe Model"] || ""}`.toLowerCase();
      return combined.indexOf(q) > -1;
    });
    populateTable(filtered);
  });
}

async function init() {
  const tbody = document.querySelector("#gear-table tbody");
  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    const data = csvToObjects(text);
    populateTable(data);
    setupSearch(data);
    console.log("index data loaded:", data.length, "rows");
  } catch (err) {
    console.error("script.js init error:", err);
    tbody.innerHTML = `<tr><td colspan='5'>Failed to load data: ${err.message}</td></tr>`;
  }
}

window.addEventListener("load", init);
