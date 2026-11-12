const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const error = document.getElementById("error");


/* =================================
   SEARCH BUTTON
================================= */

searchBtn.addEventListener("click", getWeather);


/* =================================
   ENTER KEY
================================= */

cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});


/* =================================
   GET WEATHER
================================= */

async function getWeather() {

    const city = cityInput.value.trim();


    if (city === "") {

        error.textContent =
            "Please enter a city name.";

        return;
    }


    error.textContent =
        "Searching...";


    try {

        /* Find city */

        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search" +
            "?name=" + encodeURIComponent(city) +
            "&count=1" +
            "&language=en" +
            "&format=json";


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {
            throw new Error("Geocoding failed");
        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            error.textContent =
                "City not found. Try another city.";

            return;
        }


        const location =
            geoData.results[0];


        await loadWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );


    } catch (err) {

        console.error(err);

        error.textContent =
            "Something went wrong. Check your internet connection.";

    }

}


/* =================================
   LOAD WEATHER
================================= */

async function loadWeather(
    latitude,
    longitude,
    city,
    country
) {

    try {

        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" + latitude +

            "&longitude=" + longitude +

            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "weather_code," +
            "wind_speed_10m," +
            "visibility," +
            "surface_pressure" +

            "&daily=" +
            "weather_code," +
            "temperature_2m_max," +
            "temperature_2m_min," +
            "sunrise," +
            "sunset," +
            "precipitation_probability_max" +

            "&timezone=auto";


        const response =
            await fetch(weatherURL);


        if (!response.ok) {
            throw new Error("Weather request failed");
        }


        const data =
            await response.json();


        const current =
            data.current;


        const daily =
            data.daily;


        /* City */

        document.getElementById("cityName")
            .textContent = city;


        document.getElementById("country")
            .textContent = country;


        /* Temperature */

        document.getElementById("temperature")
            .textContent =
            Math.round(current.temperature_2m);


        /* Feels like */

        document.getElementById("feelsLike")
            .textContent =
            Math.round(
                current.apparent_temperature
            ) + "°C";


        /* Humidity */

        document.getElementById("humidity")
            .textContent =
            current.relative_humidity_2m + "%";


        /* Wind */

        document.getElementById("windSpeed")
            .textContent =
            Math.round(
                current.wind_speed_10m
            ) + " km/h";


        /* Visibility */

        document.getElementById("visibility")
            .textContent =
            Math.round(
                current.visibility / 1000
            ) + " km";


        /* Pressure */

        document.getElementById("pressure")
            .textContent =
            Math.round(
                current.surface_pressure
            ) + " hPa";


        /* Weather condition */

        const weather =
            getWeatherInfo(
                current.weather_code
            );


        document.getElementById("weatherIcon")
            .textContent =
            weather.icon;


        document.getElementById("description")
            .textContent =
            weather.description;


        /* Sunrise */

        document.getElementById("sunrise")
            .textContent =
            formatTime(daily.sunrise[0]);


        /* Sunset */

        document.getElementById("sunset")
            .textContent =
            formatTime(daily.sunset[0]);


        /* Forecast */

        createForecast(daily);


        error.textContent = "";


    } catch (err) {

        console.error(err);

        error.textContent =
            "Unable to load weather information.";

    }

}


/* =================================
   WEATHER INFORMATION
================================= */

function getWeatherInfo(code) {

    if (code === 0) {

        return {
            description: "Clear Sky",
            icon: "☀️"
        };

    }


    if (code === 1) {

        return {
            description: "Mainly Clear",
            icon: "🌤️"
        };

    }


    if (code === 2) {

        return {
            description: "Partly Cloudy",
            icon: "⛅"
        };

    }


    if (code === 3) {

        return {
            description: "Overcast",
            icon: "☁️"
        };

    }


    if (code === 45 || code === 48) {

        return {
            description: "Foggy",
            icon: "🌫️"
        };

    }


    if (code >= 51 && code <= 57) {

        return {
            description: "Drizzle",
            icon: "🌦️"
        };

    }


    if (code >= 61 && code <= 67) {

        return {
            description: "Rain",
            icon: "🌧️"
        };

    }


    if (code >= 71 && code <= 77) {

        return {
            description: "Snow",
            icon: "❄️"
        };

    }


    if (code >= 80 && code <= 82) {

        return {
            description: "Rain Showers",
            icon: "🌦️"
        };

    }


    if (code >= 95 && code <= 99) {

        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };

    }


    return {
        description: "Unknown Weather",
        icon: "🌡️"
    };

}


/* =================================
   5 DAY FORECAST
================================= */

function createForecast(daily) {

    const forecast =
        document.getElementById("forecast");


    forecast.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const date =
            new Date(daily.time[i]);


        let day;


        if (i === 0) {

            day = "Today";

        } else {

            day =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        }


        const weather =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${weather.icon}
            </div>

            <div class="forecast-temp">
                ${Math.round(
                    daily.temperature_2m_max[i]
                )}°
                /
                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°
            </div>

            <div class="forecast-rain">
                💧 ${daily.precipitation_probability_max[i]}%
            </div>

        `;


        forecast.appendChild(card);

    }

}


/* =================================
   FORMAT TIME
================================= */

function formatTime(timeString) {

    const date =
        new Date(timeString);


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =================================
   CLOCK
================================= */

function updateClock() {

    const now =
        new Date();


    document.getElementById("date")
        .textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    document.getElementById("time")
        .textContent =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


updateClock();


setInterval(
    updateClock,
    1000
);


/* =================================
   DEFAULT WEATHER
================================= */

window.addEventListener(
    "load",
    function() {

        getDefaultWeather();

    }
);


async function getDefaultWeather() {

    try {

        await loadWeather(
            28.6139,
            77.2090,
            "New Delhi",
            "India"
        );

    } catch (err) {

        console.log(err);

    }

}