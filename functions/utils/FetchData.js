const axios = require("axios");

async function fetchPastData(lat, lon, startTime) {
    const baseURL = "https://history.openweathermap.org/data/2.5/history/city";
    const params = {
        lat: lat,
        lon: lon,
        type: "hour",
        start: startTime,
        // end: endTime,
        cnt: 24,
        appid: process.env.OPENWEATHER_API_KEY,
    };

    try {
        const response = await axios.get(baseURL, { params });
        // console.log(response.data);
        const weatherList = response.data.list;
        let weatherCondition = [];
        weatherList.forEach((item) => {
            const { temp, humidity } = item.main;
            const { speed } = item.wind;
            const { main } = item.weather[0];

            const date = new Date(item.dt * 1000);
            // stored date is in Chinese format, convert it to Irish format
            const formattedDate = date.toLocaleString('en-IE', { timeZone: 'UTC' });
            const condition = {
                // id: index + 1,
                lat: lat,
                lon: lon,
                date: formattedDate,
                temp: temp.toFixed(2),
                windSpeed: speed,
                humidity: humidity,
                weather: main
            }
            weatherCondition.push(condition);
        });
        return weatherCondition;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchCurrentData(lat, lon) {
    const baseURL = "https://api.openweathermap.org/data/2.5/weather";
    const params = {
        lat: lat,
        lon: lon,
        appid: process.env.OPENWEATHER_API_KEY,
    };

    try {
        const response = await axios.get(baseURL, { params });
        // console.log(response.data);
        const location = response.data.name + ", " + response.data.sys.country;
        const date = new Date(response.data.dt * 1000);
        const time = date.toLocaleString('en-IE', { timeZone: 'UTC' });

        const weather = response.data.weather[0].description;
        const temperature = response.data.main.temp - 273.15;
        const humidity = response.data.main.humidity;

        return { location, time, weather, temperature, humidity };
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

module.exports = {
    fetchPastData,
    fetchCurrentData
};