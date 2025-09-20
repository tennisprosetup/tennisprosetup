const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7DFk4fntK4y3XLB44CyfCukb0ha4iJ5_rArSf0F401aVb6s0qRssuA6bCwEJW9sRN-J-qOYa8YChw/pub?output=csv";

function populatePlayer(data, slug) {
  const player = data.find(p => p.Slug === slug);
  if (!player) {
    document.getElementById("player-content").innerHTML = "<p>Player not found.</p>";
    return;
  }

  document.getElementById("player-content").innerHTML = `
    <h1>${player.Player}</h1>
    <img src="${player["Photo URL"]}" alt="${player.Player}" class="player-photo">
    <p><strong>Country:</strong> ${player.Country}</p>
    <p><strong>Racket:</strong> ${player["Racket Brand"]} ${player["Racket Model"]}</p>
    <p><strong>Strings:</strong> ${player["String Brand"]} ${player["String Model"]}</p>
    <p><strong>Shoes:</strong> ${player["Shoe Brand"]} ${player["Shoe Model"]}</p>
    <p><strong>Notes:</strong> ${player.Notes}</p>
  `;
}

function initPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("player");
  if (!slug) return;

  Tabletop.init({
    key: PUBLISHED_CSV_URL,
    callback: function(data) {
      populatePlayer(data, slug);
    },
    simpleSheet: true
  });
}

window.addEventListener("load", initPlayer);
