  var map = L.map('map').setView([51.505, -0.09], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
function marker()
{
  var marker = L.marker([document.getElementsById('latitude').value,document.getElementById('longitude').value]).addTo(map);
}
document.getElementById('submit').addEventListener('click', addMarker);