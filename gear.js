const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

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

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Build gear key mapping
function getGearKey(type, name) {
  switch(type.toLowerCase()) {
    case "racket": return "Racket Model";
    case "strings": return "String Model";
    case "shoes": return "Shoe Model";
    default: return "";
  }
}

async function init() {
  const type = getQueryParam("type");
  const name = getQueryParam("name");
  if (!type || !name) {
    document.getElementById("gear-title").textContent = "Gear not specified";
    return;
  }

  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    const text = await res.text();
    const data = csvToArray(text);

    const gearKey = getGearKey(type, name);
    const playersUsing = data.filter(p => p[gearKey] === name);

    document.getElementById("gear-title").textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${name}`;

    const listEl = document.getElementById("players-list");
    if (playersUsing.length === 0) {
      listEl.innerHTML = "<li>No players use this gear yet.</li>";
      return;
    }

    playersUsing.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="player.html?player=${p.Slug}">${p.Player}</a> (${p.Country})`;
      listEl.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("gear-title").textContent = "Error loading gear";
    document.getElementById("players-list").textContent = err.message;
  }
}

window.addEventListener("load", init);
