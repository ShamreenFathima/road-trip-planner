let map = L.map('map').setView([20.5937, 78.9629], 5);
let destinations = JSON.parse(localStorage.getItem("trip")) || [];
let markers = [];
let routingControl;

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
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
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

// Draw route with Leaflet Routing Machine
function drawRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (destinations.length < 2) {
    document.getElementById("summary").innerHTML =
      `<b>Total Stops:</b> ${destinations.length}<br><b>Total Distance:</b> 0 km`;
    return;
  }

  routingControl = L.Routing.control({
    waypoints: destinations.map(d => L.latLng(d.lat, d.lon)),
    routeWhileDragging: false,
    show: false
  }).addTo(map);

  routingControl.on('routesfound', function(e) {
    let route = e.routes[0];
    let totalDistance = (route.summary.totalDistance / 1000).toFixed(2); // km
    document.getElementById("summary").innerHTML = `
      <b>Total Stops:</b> ${destinations.length}<br>
      <b>Total Distance:</b> ${totalDistance} km
    `;
  });
}

