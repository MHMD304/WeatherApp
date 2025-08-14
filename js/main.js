const cityDropdown = document.getElementById('cityDropdown');
const cityList = document.getElementById('cityList');
const forecastDiv = document.getElementById('forecast');

const weatherIcons = {
  clearday: '☀️', clearnight: '🌙', cloudyday: '☁️', cloudynight: '☁️',
  mcloudyday: '⛅', mcloudynight: '⛅', pcloudyday: '🌤️', pcloudynight: '🌤️',
  lightrainday: '🌦️', lightrainnight: '🌦️', oshowerday: '🌧️', oshowernight: '🌧️',
  ishowerday: '🌧️', ishowernight: '🌧️', tsday: '⛈️', tsnight: '⛈️',
  rain: '🌧️', rainsnow: '🌨️', snow: '❄️', lightsnow: '🌨️', fog: '🌫️', humid: '💨',
  windy: '💨', tsrain: '⛈️'
};

// Fetch CSV file with cities
fetch('../city_coordinates.csv') 
  .then(res => res.text())
  .then(data => {
    const rows = data.trim().split('\n').slice(1); // skip header
    rows.forEach(row => {
      if (!row) return;
      const [lat, lon, city, country] = row.split(',');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item'; 
      a.href = '#';
      a.innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${city}, ${country}`;
      a.dataset.coords = `${lat},${lon}`;
      a.addEventListener('click', e => {
        e.preventDefault();
        cityDropdown.innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${city}, ${country}`;
        cityDropdown.dataset.coords = `${lat},${lon}`;
        getWeather();
      });
      li.appendChild(a);
      cityList.appendChild(li);
    });
  })
  .catch(err => console.error('Error loading CSV:', err));

function showLoading() {
  forecastDiv.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 150px;">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
}

function getWeather() {
  const coords = cityDropdown.dataset.coords;
  if (!coords) return;

  const [lat, lon] = coords.split(',');
  showLoading();

  fetch(`https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`)
    .then(res => res.json())
    .then(data => {
      forecastDiv.innerHTML = '';
      const today = new Date();
      data.dataseries.slice(0, 7).forEach((day, index) => {
        const date = new Date(today); 
        date.setDate(today.getDate() + index);
        const dateStr = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = day.temp2m;
        const weather = day.weather;
        
        const icon = weatherIcons[weather] || '☀️';

        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
          <div class="card-date">${dateStr}</div>
          <div class="weather-icon">${icon}</div>
          <div class="temp-display">${temp}°C</div>
          <div class="weather-detail"><i class="fas fa-eye"></i> ${weather}</div>
        `;
        forecastDiv.appendChild(card);
      });
    })
    .catch(err => {
      forecastDiv.innerHTML = '<div class="text-center text-light mt-3">Error fetching weather data.</div>';
      console.error(err);
    });
}

// Auto update every 5 minutes
setInterval(() => {
  if (cityDropdown.dataset.coords) getWeather();
}, 300000);
