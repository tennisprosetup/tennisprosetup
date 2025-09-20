const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

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
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(cur); cur = "";
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      row.push(cur); rows.push(row); row = []; cur = ""; if (ch === '\r' && next === '\n') i++;
    } else {
      cur += ch;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function csvToObjects(csvText) {
  const table = parseCSV(csvText);
  if (!table.length) return [];
  const headers = table[0].map(h => h.trim());
  return table.slice(1).map(r => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) obj[headers[i]] = (r[i] !== undefined) ? r[i].trim() : "";
    return obj;
  });
}

function getQueryParam(name) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

function getGearKey(type) {
  switch ((type || "").toLowerCase()) {
    case "racket": return "Racket Model";
    case "strings": return "String Model";
    case "shoes": return "Shoe Model";
    default: return null;
  }
}

async function init() {
  const type = getQueryParam("type");
  const rawName = getQueryParam("name");
  if (!type || !rawName) {
    document.getElementById("gear-title").textContent = "Gear not specified";
    return;
  }
  const name = decodeURIComponent(rawName);

  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    const data = csvToObjects(text);

    const gearKey = getGearKey(type);
    if (!gearKey) {
      document.getElementById("gear-title").textContent = `Unknown gear type: ${type}`;
      return;
    }

    const users = data.filter(p => (p[gearKey] || "").trim() === name.trim());

    document.getElementById("gear-title").textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${name}`;
    const list = document.getElementById("players-list");
    list.innerHTML = "";

    if (!users.length) {
      list.innerHTML = "<li>No players use this gear yet.</li>";
      return;
    }

    users.forEach(p => {
      const li = document.createElement("li");
      const flag = p.Flag ? `${p.Flag} ` : "";
      li.innerHTML = `<a href="player.html?player=${encodeURIComponent(p.Slug)}">${flag}${p.Player}</a> ${p.Country ? `(${p.Country})` : ""}`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("gear.js init error:", err);
    document.getElementById("gear-title").textContent = "Error loading gear";
    document.getElementById("players-list").textContent = err.message;
  }
}

window.addEventListener("load", init);
