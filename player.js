const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

// Convert CSV to array of objects
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

// Get query string parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Populate player page
function populatePlayer(player) {
  if (!player) {
    document.getElementById("player-name").textContent = "Player not found";
    document.getElementById("player-gear").innerHTML = "<p>Unable to find player data.</p>";
    return;
  }

  document.getElementById("player-name").textContent = player.Player || "";
  if (player["Photo URL"]) {
    const img = document.createElement("img");
    img.src = player["Photo URL"];
    img.alt = player.Player;
    img.className = "player-photo";
    document.getElementById("player-photo").appendChild(img);
  }

  const gearList = `
    <ul>
      <li><strong>Country:</strong> ${player.Country || ""}</li>
      <li><strong>Racket:</strong> ${player["Racket Brand"] || ""} ${player["Racket Model"] || ""}</li>
      <li><strong>Strings:</strong> ${player["String Brand"] || ""} ${player["String Model"] || ""}</li>
      <li><strong>Shoes:</strong> ${player["Shoe Brand"] || ""} ${player["Shoe Model"] || ""}</li>
      <li><strong>Notes:</strong> ${player.Notes || ""}</li>
    </ul>
  `;
  document.getElementById("player-gear").innerHTML = gearList;
}

// Initialize
async function init() {
  const slug = getQueryParam("player");
  if (!slug) {
    document.getElementById("player-name").textContent = "No player specified";
    return;
  }

  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    if (!res.ok) throw new Error("Failed to fetch CSV from Google Sheets");
    const text = await res.text();
    const data = csvToArray(text);

    const player = data.find(p => p.Slug === slug);
    if (!player) console.warn("Player not found for slug:", slug);

    populatePlayer(player);
  } catch (err) {
    console.error("Error loading CSV:", err);
    document.getElementById("player-gear").innerHTML = `<p>Failed to load data: ${err.message}</p>`;
  }
}

window.addEventListener("load", init);
