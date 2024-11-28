/**
 *
 * @param {*} db
 * @returns arrays
 * example output:
 [
 {
 "id": 1,
 "latitude": 52.48356666666667,
 "longitude": -1.8810583333333333,
 "earliestTime": "2024-11-02 23:58:42",
 "latestTime": "2024-11-02 23:59:11"
 },
 {
 "id": 2,
 "latitude": 54.46356666666667,
 "longitude": -6.8863483333333,
 "earliestTime": "2024-11-02 23:58:42",
 "latestTime": "2024-11-02 23:59:11"
 }
 ]
 */
async function ReadSavedPosition(db) {
    try {
        const dbOldRef = db.ref("/position/sensor");
        const snapshot = await dbOldRef.once("value");

        if (!snapshot.exists()) {
            console.log("No data found in the database.");
            return [];
        }

        const data = snapshot.val();
        const locationTimeMap = new Map();

        // Traverse the data and update the earliest and latest times for each location
        for (const key in data) {
            const { latitude, longitude, time } = data[key];
            const locationKey = `${latitude},${longitude}`;

            if (locationTimeMap.has(locationKey)) {
                const timeInfo = locationTimeMap.get(locationKey);
                timeInfo.earliestTime =
                    time < timeInfo.earliestTime
                        ? time
                        : timeInfo.earliestTime;
                timeInfo.latestTime =
                    time > timeInfo.latestTime ? time : timeInfo.latestTime;
            } else {
                // Initialize the location time range
                locationTimeMap.set(locationKey, {
                    earliestTime: time,
                    latestTime: time,
                });
            }
        }

        // Extract the location time ranges
        const locationTimeRanges = Array.from(locationTimeMap).map(
            ([locationKey, timeInfo], index) => {
                const [latitude, longitude] = locationKey.split(",").map(Number);
                return {
                    id: index + 1,
                    latitude,
                    longitude,
                    earliestTime: timeInfo.earliestTime,
                    latestTime: timeInfo.latestTime,
                };
            }
        );

        // console.log("Location time ranges:", locationTimeRanges);
        return locationTimeRanges;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

module.exports = ReadSavedPosition;
