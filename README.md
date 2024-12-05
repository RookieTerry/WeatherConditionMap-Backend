# Weather Condition Map

This full-stack project visualize real-time/past position and weather data by Google Map SDK and Echarts, and it is the final assignment of the Urban Computing module in Trinity College Dublin.

## Tech Stack
- Frontend: Vite, React.js, Material UI, Echarts
- Backend: Google Firebase Real-time database, Express, Node.js
- Data Analysis: pandas and sklearn in Python

## How to Run
First, pull the repo to your own laptop:

```bash
git clone git clone https://github.com/RookieTerry/WeatherConditionMap-Backend.git WeatherConditionMap-Backend
```

Install the dependencies by using the command:

```bash
npm install
```

Before running the project, do not forget to configure the `.env.local` file in the root directory, and it should look like:

```
PORT=5000
OPENWEATHER_API_KEY=xxxxxx
FIREBASE_APP_ID=xxxxxx
FIREBASE_PROJECT_ID=xxxxxx
FIREBASE_DATABASE_URL=xxxxxx
# For Netlify deployment, please add the following row
FIREBASE_ADMIN_SA_KEY=xxxxxx
```

Replace the "xxxxxx" into yours, and you also need to replace the last row with the content in your own `serviceAccountKey.json` from your Google Firebase console if deployed on Netlify.

Execute the command:

```bash
npm start
```

The project should be ready to go. Enjoy!

## To-do List

- [ ] display current weather condition of current position
- [ ] predict future weather condition
- [x] deploy this web application on the cloud (e.g. Heroku, Vercel)
