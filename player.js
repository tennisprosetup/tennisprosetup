// ---------- CONFIG: put your published CSV URL here ----------
const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";
// ----------------------------------------------------------------

// Robust CSV parser that handles quoted fields and escaped quotes
function parseCSV(text) {
  if (!text) return [];
  // Remove BOM if present
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
        // escaped quote
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

  // push last
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
  const dataRows = table.slice(1);
  return dataRows.map(r => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = (r[i] !== undefined) ? r[i].trim() : "";
    }
    return obj;
  });
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function updateSEOForPlayer(player) {
  if (!player) return;

  const name = player.Player || "Player";
  const title = `${name} Tennis Gear — Racket, Strings & Shoes`;
  document.title = title;

  const descText = `What gear does ${name} use? See their ${player["Racket Brand"] || ""} ${player["Racket Model"] || ""}, ${player["String Brand"] || ""} ${player["String Model"] || ""}, and ${player["Shoe Brand"] || ""} ${player["Shoe Model"] || ""}.`;
  let meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", descText);
  } else {
    meta = document.createElement("meta");
    meta.name = "description";
    meta.content = descText;
    document.head.appendChild(meta);
  }

  // Sub-heading intro
  const introEl = document.getElementById("player-intro");
  if (introEl) {
    introEl.textContent = `Curious about what gear ${name} uses? Below is a complete breakdown of the racket, strings, shoes and more.`;
  }
}

function renderPlayer(player) {
  const nameEl = document.getElementById("player-name");
  const photoWrap = document.getElementById("player-photo");
  const gearWrap = document.getElementById("player-gear");

  if (!player) {
    if (nameEl) nameEl.textContent = "Player not found";
    if (gearWrap) gearWrap.innerHTML = "<p>We couldn't find that player in the database.</p>";
    return;
  }

  const flag = player.Flag || "";
  if (nameEl) nameEl.textContent = `${flag} ${player.Player || ""}`;

  if (photoWrap) {
    photoWrap.innerHTML = "";
    if (player["Photo URL"]) {
      const img = document.createElement("img");
      img.src = player["Photo URL"];
      img.alt = player.Player || "";
      img.style.maxWidth = "200px";
      img.style.borderRadius = "8px";
      photoWrap.appendChild(img);
    }
  }

  if (gearWrap) {
    const racketBrand = player["Racket Brand"] || "";
    const racketModel = player["Racket Model"] || "";
    const stringBrand = player["String Brand"] || "";
    const stringModel = player["String Model"] || "";
    const shoeBrand = player["Shoe Brand"] || "";
    const shoeModel = player["Shoe Model"] || "";
    const country = player.Country || "";
    const notes = player.Notes || "";

    const html = `
      <ul style="list-style:none;padding:0">
        <li><strong>Country:</strong> ${country}</li>
        <li><strong>Racket:</strong> <a href="gear.html?type=racket&name=${encodeURIComponent(racketModel)}">${racketBrand} ${racketModel}</a></li>
        <li><strong>Strings:</strong> <a href="gear.html?type=strings&name=${encodeURIComponent(stringModel)}">${stringBrand} ${stringModel}</a></li>
        <li><strong>Shoes:</strong> <a href="gear.html?type=shoes&name=${encodeURIComponent(shoeModel)}">${shoeBrand} ${shoeModel}</a></li>
        <li><strong>Notes:</strong> ${notes}</li>
      </ul>
    `;
    gearWrap.innerHTML = html;
  }
}

async function init() {
  const slug = getQueryParam("player");
  if (!slug) {
    document.getElementById("player-name").textContent = "No player specified";
    document.getElementById("player-gear").innerHTML = "<p>Please select a player from the list.</p>";
    return;
  }

  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
    const text = await res.text();
    const data = csvToObjects(text);

    // Normalize slug matching
    const normalized = slug.trim();
    const player = data.find(p => (p.Slug || "").trim() === normalized);

    renderPlayer(player);
    updateSEOForPlayer(player);

  } catch (err) {
    console.error("player.js init error:", err);
    document.getElementById("player-name").textContent = "Error loading player";
    document.getElementById("player-gear").textContent = err.message || String(err);
  }
}

window.addEventListener("load", init);
