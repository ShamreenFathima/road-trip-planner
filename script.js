let map = L.map('map').setView([20.5937, 78.9629], 5);
let destinations = [];
let markers = [];
let routingControl = null;

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Add destination
function addDestination() {
  const place = document.getElementById("place").value;
  if (!place) return;

  if (destinations.length === 2) {
    alert("Only From and To locations are allowed");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        alert("Place not found");
        return;
      }

      destinations.push({
        name: place,
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      });

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

    let span = document.createElement("span");
    span.innerText = `${i + 1}. ${d.name}`;

    let btn = document.createElement("button");
    btn.innerText = "❌";
    btn.className = "delete-btn";
    btn.onclick = () => removeDestination(i);

    li.appendChild(span);
    li.appendChild(btn);
    document.getElementById("destinationList").appendChild(li);

    let marker = L.marker([d.lat, d.lon]).addTo(map);
    markers.push(marker);
  });

  drawRoute();
}

// Remove destination
function removeDestination(index) {
  destinations.splice(index, 1);
  updateUI();
}

// Draw route using OSRM
function drawRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (destinations.length < 2) {
    document.getElementById("summary").innerHTML =
      `<b>Total Stops:</b> ${destinations.length}`;
    return;
  }

  // Main route in red
  mainRouteControl = L.Routing.control({
    waypoints: [
      L.latLng(destinations[0].lat, destinations[0].lon),
      L.latLng(destinations[1].lat, destinations[1].lon)
    ],
    routeWhileDragging: false,
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: { styles: [{ color: 'red', weight: 6 }] },
    createMarker: () => null,
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'driving',
      alternatives: true // fetch alternative routes
    })
  }).addTo(map);

  mainRouteControl.on('routesfound', function(e) {
    const route = e.routes[0];
    const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
    document.getElementById("summary").innerHTML = `
      <b>From:</b> ${destinations[0].name}<br>
      <b>To:</b> ${destinations[1].name}<br>
      <b>Distance:</b> ${distanceKm} km
    `;

    // Draw alternative routes in purple
    e.routes.slice(1).forEach(alt => {
      const altLine = L.Routing.line(alt, {
        styles: [{ color: 'purple', weight: 4 }]
      }).addTo(map);
      altRouteControls.push(L.Routing.control({ addWaypoints: false }).addTo(map));
      map.removeControl(altRouteControls[altRouteControls.length-1]); // only keep line
    });
  });

  routingControl.on('routesfound', function(e) {
    const summary = e.routes[0].summary;
    const distanceKm = (summary.totalDistance / 1000).toFixed(2);
    const durationHr = (summary.totalTime / 3600).toFixed(2);

    document.getElementById("summary").innerHTML = `
      <b>From:</b> ${destinations[0].name}<br>
      <b>To:</b> ${destinations[1].name}<br>
      <b>Distance:</b> ${distanceKm} km<br>
      <b>Duration:</b> ${durationHr} hrs
    `;
  });
}




