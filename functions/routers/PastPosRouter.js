const express = require("express");
const router = express.Router();
const path = require('path');
const { PythonShell } = require("python-shell");
const ReadSavedPosition = require("../utils/ReadSavedPosition");
const WritePastWeather = require("../utils/WritePastWeather");
const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
const db = require("../utils/FirebaseConfig");

// only display all the past positions
router.get("/getAll", async (req, res) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return res.status(404).json({ error: "No location data found" });
    }
    const transData = locationTimeRanges.map((item) => ({
      location: {
        lat: item.latitude,
        lng: item.longitude,
      },
    }));
    res.status(200).json(transData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// past position, past weather
// past weather need to be stored for weather prediction
router.get("/pastWea/:id", async (req, res) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return res.status(404).json({ error: "No location data found" });
    }

    const id = parseInt(req.params.id, 10);
    const locationData = locationTimeRanges.find((item) => item.id === id);

    if (!locationData) {
      return res
        .status(404)
        .json({ error: "Location data not found for the given ID" });
    }

    const { latitude, longitude, earliestTime } = locationData;
    const startTime = new Date(earliestTime).getTime() / 1000;
    const data = await fetchPastData(latitude, longitude, startTime);
    await WritePastWeather(db, data);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// past position, current weather
router.get("/cntWea/:id", async (req, res) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return res.status(404).json({ error: "No location data found" });
    }

    const id = parseInt(req.params.id, 10);
    const locationData = locationTimeRanges.find((item) => item.id === id);

    if (!locationData) {
      return res
        .status(404)
        .json({ error: "Location data not found for the given ID" });
    }

    const { latitude, longitude } = locationData;
    const data = await fetchCurrentData(latitude, longitude);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

router.get("/weatherAnalysis", (req, res) => {
    const options = {
      mode: "text",
      pythonOptions: ["-u"],
      scriptPath: path.join(__dirname, '..'),
    };
  
    PythonShell.run("WeatherAnalysis.py", options, (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        try {
          const analysisResults = JSON.parse(results.join(""));
          res.json(analysisResults);
        } catch (parseError) {
          res.status(500).send("Error parsing analysis results");
        }
      }
    });
  });

module.exports = router;
