let map = L.map('map').setView([20.5937, 78.9629], 5);
let destinations = JSON.parse(localStorage.getItem("trip")) || [];
let markers = [];
let polyline;

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Load stored data
updateUI();

// Add destination
function addDestination() {
  const place = document.getElementById("place").value;
  if (!place) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return alert("Place not found");

      destinations.push({
        name: place,
        lat: data[0].lat,
        lon: data[0].lon
      });

      localStorage.setItem("trip", JSON.stringify(destinations));
      document.getElementById("place").value = "";
      updateUI();
    });
}

// Update UI
function updateUI() {
  document.getElementById("destinationList").innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  destinations.forEach((d, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${i + 1}. ${d.name}
      <button onclick="removeDestination(${i})">❌</button>
    `;
    document.getElementById("destinationList").appendChild(li);

    let marker = L.marker([d.lat, d.lon]).addTo(map);
    markers.push(marker);
  });

  drawRoute();
}

// Remove destination
function removeDestination(index) {
  destinations.splice(index, 1);
  localStorage.setItem("trip", JSON.stringify(destinations));
  updateUI();
}

// Draw route
function drawRoute() {
  if (polyline) map.removeLayer(polyline);

  if (destinations.length < 2) return;

  let points = destinations.map(d => [d.lat, d.lon]);
  polyline = L.polyline(points, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());

  document.getElementById("summary").innerHTML =
    `<b>Total Stops:</b> ${destinations.length}`;
}