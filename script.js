let map = L.map('map').setView([20.5937, 78.9629], 6);
let destinations = [];
let markers = [];
let mainRoute = null;
let altRoute = null;

/* Map tiles */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

/* Add destination */
function addDestination() {
  const place = document.getElementById("place").value;
  if (!place) return;

  if (destinations.length === 2) {
    alert("Only FROM and TO locations allowed");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert("Place not found");

      destinations.push({
        name: place,
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      });

      document.getElementById("place").value = "";
      updateUI();
    });
}

/* Update UI */
function updateUI() {
  document.getElementById("destinationList").innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  destinations.forEach((d, i) => {
    let li = document.createElement("li");
    li.innerText = `${i + 1}. ${d.name}`;

    let btn = document.createElement("button");
    btn.innerText = "❌";
    btn.className = "delete-btn";
    btn.onclick = () => removeDestination(i);

    li.appendChild(btn);
    document.getElementById("destinationList").appendChild(li);

    let marker = L.marker([d.lat, d.lon]).addTo(map);
    markers.push(marker);
  });

  drawRoutes();
}

/* Remove destination */
function removeDestination(index) {
  destinations.splice(index, 1);
  updateUI();
}

/* Draw main + alternative routes (simulated) */
function drawRoutes() {
  if (mainRoute) map.removeControl(mainRoute);
  if (altRoute) map.removeControl(altRoute);

  if (destinations.length < 2) {
    document.getElementById("summary").innerHTML =
      `<b>Total Stops:</b> ${destinations.length}`;
    return;
  }

  // MAIN ROUTE
  mainRoute = L.Routing.control({
    waypoints: [
      L.latLng(destinations[0].lat, destinations[0].lon),
      L.latLng(destinations[1].lat, destinations[1].lon)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: { styles: [{ color: 'red', weight: 6 }] },
    createMarker: () => null
  }).addTo(map);

  // ALTERNATIVE ROUTE (simulated: offset slightly)
  altRoute = L.Routing.control({
    waypoints: [
      L.latLng(destinations[0].lat + 0.05, destinations[0].lon + 0.05),
      L.latLng(destinations[1].lat + 0.05, destinations[1].lon - 0.05)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: { styles: [{ color: 'purple', weight: 4 }] },
    createMarker: () => null
  }).addTo(map);

  mainRoute.on('routesfound', function(e) {
    const distanceKm = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
    document.getElementById("summary").innerHTML = `
      <b>From:</b> ${destinations[0].name}<br>
      <b>To:</b> ${destinations[1].name}<br>
      <b>Distance:</b> ${distanceKm} km
    `;
  });
}





