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

  if (destinations.length < 2) {
    document.getElementById("summary").innerHTML =
      `<b>Total Stops:</b> ${destinations.length}`;
    return;
  }

  let points = destinations.map(d => [d.lat, d.lon]);
  polyline = L.polyline(points, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());

  
  let totalDistance = 0;

  for (let i = 0; i < destinations.length - 1; i++) {
    totalDistance += getDistance(
      destinations[i].lat,
      destinations[i].lon,
      destinations[i + 1].lat,
      destinations[i + 1].lon
    );
  }

  document.getElementById("summary").innerHTML = `
    <b>Total Stops:</b> ${destinations.length}<br>
    <b>Total Distance:</b> ${totalDistance.toFixed(2)} km
  `;
}
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
