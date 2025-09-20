// ---------- CONFIG: paste your published CSV URL here ----------
const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";
// ----------------------------------------------------------------

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function populatePlayer(playerData) {
  document.getElementById("player-name").textContent = playerData.Player;
  document.getElementById("player-rank").textContent = `Rank: ${playerData.Rank}`;
  const img = document.getElementById("player-photo");
  img.src = playerData["Photo URL"];
  img.alt = playerData.Player;

  const tbody = document.querySelector("#player-table tbody");
  tbody.innerHTML = "";

  const tr = document.createElement("tr");
  const cols = ["Gear Type", "Model", "Specs", "Affiliate Link"];
  cols.forEach(col => {
    const td = document.createElement("td");
    if (col === "Affiliate Link" && playerData[col]) {
      td.innerHTML = `<a class="buy-btn" href="${playerData[col]}" target="_blank" rel="noopener noreferrer">Buy</a>`;
    } else if (col !== "Affiliate Link") {
      td.textContent = playerData[col] || "";
    }
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

function init() {
  const slug = getQueryParam("player");
  if (!slug) return;

  fetch(PUBLISHED_CSV_URL)
    .then(res => res.text())
    .then(csvText => {
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",").map(h => h.trim());
      const data = lines.map(line => {
        const values = line.split(",");
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || "" }), {});
      });

      const playerRow = data.find(r => r.Slug === slug);
      if (playerRow) populatePlayer(playerRow);
      else console.error("Player not found:", slug);
    })
    .catch(err => console.error("CSV fetch error:", err));
}

window.addEventListener("load", init);
