// const express = require("express");
// const router = express.Router();
// const path = require('path');
// const { PythonShell } = require("python-shell");
// const ReadSavedPosition = require("../utils/ReadSavedPosition");
// const WritePastWeather = require("../utils/WritePastWeather");
// const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
// const db = require("../utils/FirebaseConfig");

// // only display all the past positions
// router.get("/getAll", async (req, res) => {
//   try {
//     const locationTimeRanges = await ReadSavedPosition(db);
//     if (locationTimeRanges.length === 0) {
//       return res.status(404).json({ error: "No location data found" });
//     }
//     const transData = locationTimeRanges.map((item) => ({
//       location: {
//         lat: item.latitude,
//         lng: item.longitude,
//       },
//     }));
//     res.status(200).json(transData);
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     res.status(500).json({ error: "Error fetching weather data" });
//   }
// });

// // past position, past weather
// // past weather need to be stored for weather prediction
// router.get("/pastWea/:id", async (req, res) => {
//   try {
//     const locationTimeRanges = await ReadSavedPosition(db);
//     if (locationTimeRanges.length === 0) {
//       return res.status(404).json({ error: "No location data found" });
//     }

//     const id = parseInt(req.params.id, 10);
//     const locationData = locationTimeRanges.find((item) => item.id === id);

//     if (!locationData) {
//       return res
//         .status(404)
//         .json({ error: "Location data not found for the given ID" });
//     }

//     const { latitude, longitude, earliestTime } = locationData;
//     const startTime = new Date(earliestTime).getTime() / 1000;
//     const data = await fetchPastData(latitude, longitude, startTime);
//     await WritePastWeather(db, data);

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     res.status(500).json({ error: "Error fetching weather data" });
//   }
// });

// // past position, current weather
// router.get("/cntWea/:id", async (req, res) => {
//   try {
//     const locationTimeRanges = await ReadSavedPosition(db);
//     if (locationTimeRanges.length === 0) {
//       return res.status(404).json({ error: "No location data found" });
//     }

//     const id = parseInt(req.params.id, 10);
//     const locationData = locationTimeRanges.find((item) => item.id === id);

//     if (!locationData) {
//       return res
//         .status(404)
//         .json({ error: "Location data not found for the given ID" });
//     }

//     const { latitude, longitude } = locationData;
//     const data = await fetchCurrentData(latitude, longitude);

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     res.status(500).json({ error: "Error fetching weather data" });
//   }
// });

// router.get("/weatherAnalysis", (req, res) => {
//     const options = {
//       mode: "text",
//       pythonOptions: ["-u"],
//       scriptPath: path.join(__dirname, '..'),
//     };
  
//     PythonShell.run("WeatherAnalysis.py", options, (err, results) => {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         try {
//           const analysisResults = JSON.parse(results.join(""));
//           res.json(analysisResults);
//         } catch (parseError) {
//           res.status(500).send("Error parsing analysis results");
//         }
//       }
//     });
//   });

// module.exports = router;


//netlify format
// functions/PastPosRouter.js
const path = require('path');
const { PythonShell } = require("python-shell");
const ReadSavedPosition = require("../utils/ReadSavedPosition");
const WritePastWeather = require("../utils/WritePastWeather");
const { fetchPastData, fetchCurrentData } = require("../utils/FetchData");
const db = require("../utils/FirebaseConfig");

const headers = {
  "Access-Control-Allow-Origin": "*",  // Allow all domains to access, adjust if needed
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Allowed methods
  "Access-Control-Allow-Headers": "Content-Type",  // Allowed headers
};

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  const pathSegments = event.path.split('/');
  const id = pathSegments[pathSegments.length - 1];

  switch (method) {
    case 'GET':
      if (event.path.includes('/getAll')) {
        return await getAll(event);
      } else if (event.path.includes('/pastWea')) {
        return await pastWea(event, id);
      } else if (event.path.includes('/cntWea')) {
        return await cntWea(event, id);
      } else if (event.path.includes('/weatherAnalysis')) {
        return await weatherAnalysis(event);
      }
      break;

    case 'POST':
      if (event.path.includes('/pastWea')) {
        return await postPastWea(event);
      } else if (event.path.includes('/cntWea')) {
        return await postCntWea(event);
      }
      break;

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
  }
};

// GET /getAll
const getAll = async (event) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "No location data found" }),
      };
    }

    const transData = locationTimeRanges.map((item) => ({
      location: {
        lat: item.latitude,
        lng: item.longitude,
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transData),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error fetching weather data" }),
    };
  }
};

// GET /pastWea/:id
const pastWea = async (event, id) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "No location data found" }),
      };
    }

    const locationData = locationTimeRanges.find((item) => item.id === parseInt(id, 10));

    if (!locationData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Location data not found for the given ID" }),
      };
    }

    const { latitude, longitude, earliestTime } = locationData;
    const startTime = new Date(earliestTime).getTime() / 1000;
    const data = await fetchPastData(latitude, longitude, startTime);
    await WritePastWeather(db, data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error fetching weather data" }),
    };
  }
};

// GET /cntWea/:id
const cntWea = async (event, id) => {
  try {
    const locationTimeRanges = await ReadSavedPosition(db);
    if (locationTimeRanges.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "No location data found" }),
      };
    }

    const locationData = locationTimeRanges.find((item) => item.id === parseInt(id, 10));

    if (!locationData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Location data not found for the given ID" }),
      };
    }

    const { latitude, longitude } = locationData;
    const data = await fetchCurrentData(latitude, longitude);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error fetching weather data" }),
    };
  }
};

// GET /weatherAnalysis
const weatherAnalysis = (event) => {
  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: path.join(__dirname, '..'),
  };

  return new Promise((resolve, reject) => {
    PythonShell.run("WeatherAnalysis.py", options, (err, results) => {
      if (err) {
        reject({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: err.message }),
        });
      } else {
        try {
          const analysisResults = JSON.parse(results.join(""));
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify(analysisResults),
          });
        } catch (parseError) {
          reject({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Error parsing analysis results" }),
          });
        }
      }
    });
  });
};

// POST /pastWea
const postPastWea = async (event) => {
  const { lat, lon } = JSON.parse(event.body);
  const startTime = new Date().getTime() / 1000;
  const data = await fetchPastData(lat, lon, startTime);
  await WritePastWeather(db, data);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

// POST /cntWea
const postCntWea = async (event) => {
  const { lat, lon } = JSON.parse(event.body);
  const data = await fetchCurrentData(lat, lon);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

