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

function populatePlayer(player) {
  if (!player) {
    document.getElementById("player-name").textContent = "Player not found";
    document.getElementById("player-gear").innerHTML = "<p>Unable to find player data.</p>";
    return;
  }

  const flag = player.Flag || "";
  document.getElementById("player-name").textContent = `${flag} ${player.Player || ""}`;

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
      <li><strong>Racket:</strong> <a href="gear.html?type=racket&name=${encodeURIComponent(player["Racket Model"])}">${player["Racket Brand"]} ${player["Racket Model"]}</a></li>
      <li><strong>Strings:</strong> <a href="gear.html?type=strings&name=${encodeURIComponent(player["String Model"])}">${player["String Brand"]} ${player["String Model"]}</a></li>
      <li><strong>Shoes:</strong> <a href="gear.html?type=shoes&name=${encodeURIComponent(player["Shoe Model"])}">${player["Shoe Brand"]} ${player["Shoe Model"]}</a></li>
      <li><strong>Notes:</strong> ${player.Notes || ""}</li>
    </ul>
  `;

  document.getElementById("player-gear").innerHTML = gearList;
}

async function init() {
  const slug = getQueryParam("player");
  try {
    const res = await fetch(PUBLISHED_CSV_URL);
    const text = await res.text();
    const data = csvToArray(text);

    const player = data.find(p => p.Slug === slug);
    populatePlayer(player);
  } catch (err) {
    console.error(err);
    document.getElementById("player-name").textContent = "Error loading player";
    document.getElementById("player-gear").textContent = err.message;
  }
}

window.addEventListener("load", init);
