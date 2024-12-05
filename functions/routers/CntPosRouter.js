// const express = require('express');
// const router = express.Router();
// const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
// const WritePastWeather = require("../utils/WritePastWeather");
// const db = require("../utils/FirebaseConfig");

// // current position, past weather
// // past weather need to be stored for weather prediction
// router.post("/pastWea", async (req, res) => {
//     const { lat, lon } = req.body;
//     const startTime = new Date().getTime() / 1000;
//     const data = await fetchPastData(lat, lon, startTime);
//     await WritePastWeather(db, data);
//     res.status(200).json(data);
// });

// // current position, current weather
// router.post("/cntWea", async (req, res) => {
//     const { lat, lon } = req.body;
//     const data = await fetchCurrentData(lat, lon);
//     res.status(200).json(data);
// });

// module.exports = router;


//netlify format
const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
const WritePastWeather = require("../utils/WritePastWeather");
const db = require("../utils/FirebaseConfig");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://weather-condition-map.vercel.app",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "POST") {
    const { path } = event;
    const body = JSON.parse(event.body); // Parse the incoming JSON body

    if (path === "/api/v1/cntPos/pastWea") {
      const { lat, lon } = body;
      const startTime = new Date().getTime() / 1000;
      const data = await fetchPastData(lat, lon, startTime);
      await WritePastWeather(db, data);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    if (path === "/api/v1/cntPos/cntWea") {
      const { lat, lon } = body;
      const data = await fetchCurrentData(lat, lon);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid path" }),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
};
