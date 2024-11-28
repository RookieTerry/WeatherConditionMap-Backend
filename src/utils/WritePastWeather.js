async function WritePastWeather(db, pastWeather){
    try {
        let dbNewRef = db.ref("/position/weather");
        if (Array.isArray(pastWeather)) {
            pastWeather.forEach((pw) => {
                const newEntryRef = dbNewRef.push();
                newEntryRef
                    .set(pw)
                    .then(() => {
                        console.log(
                            `Data written successfully with ID: ${dbNewRef.key}`
                        );
                    })
                    .catch((error) => {
                        console.error("Error writing data:", error);
                    });
            });
        } else {
            console.error("pastWeather is not an array or is undefined.");
        }
    } catch (error){
        console.error("Error fetching data:", error);
        return [];
    }
}

module.exports = WritePastWeather;