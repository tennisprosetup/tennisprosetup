const PUBLISHED_CSV_URL = "PASTE_YOUR_PUBLISHED_CSV_URL_HERE";

// Helper: get query param
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Populate table for the player
function populatePlayer(playerData) {
  document.getElementById("player-name").textContent = playerData.Player;
  document.getElementById("player-rank").textContent = `Rank: ${playerData.Rank}`;
  const img = document.getElementById("player-photo");
  img.src = playerData["Photo URL"];
  img.alt = playerData.Player;

  const tbody = document.querySelector("#player-table tbody");
  tbody.innerHTML = "";

  // Currently one row per player (expandable to multiple gear items later)
  const tr = document.createElement("tr");

  const tdGear = document.createElement("td");
  tdGear.textContent = playerData["Gear Type"];
  tr.appendChild(tdGear);

  const tdModel = document.createElement("td");
  tdModel.textContent = playerData.Model;
  tr.appendChild(tdModel);

  const tdSpecs = document.createElement("td");
  tdSpecs.textContent = playerData.Specs;
  tr.appendChild(tdSpecs);

  const tdBuy = document.createElement("td");
  if (playerData["Affiliate Link"] && playerData["Affiliate Link"].trim().length) {
    tdBuy.innerHTML = `<a class="buy-btn" href="${playerData["Affiliate Link"]}" target="_blank" rel="noopener noreferrer">Buy</a>`;
  } else {
    tdBuy.textContent = "—";
  }
  tr.appendChild(tdBuy);

  tbody.appendChild(tr);
}

// Init
window.addEventListener("load", () => {
  const slug = getQueryParam("player");
  if (!slug) {
    document.querySelector("#player-table tbody").innerHTML = "<tr><td colspan='4'>No player selected.</td></tr>";
    return;
  }

  Tabletop.init({
    key: PUBLISHED_CSV_URL,
    simpleSheet: true,
    callback: function(data) {
      // Find player row by slug (create slug column in your sheet: novak-djokovic, etc.)
      const playerRow = data.find(row => {
        return (row.Slug || row.slug) === slug;
      });
      if (!playerRow) {
        document.querySelector("#player-table tbody").innerHTML = "<tr><td colspan='4'>Player not found.</td></tr>";
        return;
      }
      populatePlayer(playerRow);
    }
  });
});
