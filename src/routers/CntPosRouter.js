const express = require('express');
const router = express.Router();
const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
const WritePastWeather = require("../utils/WritePastWeather");
const db = require("../utils/FirebaseConfig");

// current position, past weather
// past weather need to be stored for weather prediction
router.post("/pastWea", async (req, res) => {
    const { lat, lon } = req.body;
    const startTime = new Date().getTime() / 1000;
    const data = await fetchPastData(lat, lon, startTime);
    await WritePastWeather(db, data);
    res.status(200).json(data);
});

// current position, current weather
router.post("/cntWea", async (req, res) => {
    const { lat, lon } = req.body;
    const data = await fetchCurrentData(lat, lon);
    res.status(200).json(data);
});

module.exports = router;
