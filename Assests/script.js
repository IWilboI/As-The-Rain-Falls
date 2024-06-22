const apiKey = '836930e0d61e48f09cb4633eb7dc7ce7';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            fetchWeather(city);
            saveToHistory(city);
            document.getElementById('cityInput').value = '';
        } else {
            alert('Please enter a city name.');
        }
    });

    displayHistory();
});

function fetchWeather(city) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const fahrenheitTemp = convertToFahrenheit(data.main.temp);
            data.main.tempFahrenheit = fahrenheitTemp;
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            alert(`Error: ${error.message}`);
        });

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Convert temperatures in forecast data to Fahrenheit
            data.list.forEach(item => {
                item.main.tempFahrenheit = convertToFahrenheit(item.main.temp);
            });
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            alert(`Error: ${error.message}`);
        });
}

function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function displayCurrentWeather(data) {
    const weatherDetails = `
        <h3>${data.name} (${new Date().toLocaleDateString()})</h3>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
        <p>Temperature: ${data.main.tempFahrenheit.toFixed(1)} °F</p>
        <p>Humidity: ${data.main.humidity} %</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    document.querySelector('#currentWeatherDetails .weather-details').innerHTML = weatherDetails;
}

function displayForecast(data) {
    const forecastDetails = data.list.filter(item => item.dt_txt.includes('12:00:00')).map(item => `
        <div class="forecast-day">
            <h4>${new Date(item.dt_txt).toLocaleDateString()}</h4>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            <p>Temp: ${item.main.tempFahrenheit.toFixed(1)} °F</p>
            <p>Humidity: ${item.main.humidity} %</p>
            <p>Wind: ${item.wind.speed} m/s</p>
        </div>
    `).join('');
    document.querySelector('#forecastDetails .forecast-container').innerHTML = forecastDetails;
}

function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        displayHistory();
    }
}

function displayHistory() {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyList = history.map(city => `<li onclick="fetchWeather('${city}')">${city}</li>`).join('');
    document.getElementById('historyList').innerHTML = historyList;
}
