import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pandas as pd
from sklearn.cluster import KMeans
import json
import os
from dotenv import load_dotenv

def main():
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env.local'))
    database_url = os.getenv('FIREBASE_DATABASE_URL')

    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), '../serviceAccountKey.json'))

    firebase_admin.initialize_app(cred, {
        'databaseURL': database_url
    })

    ref = db.reference('/position/weather')
    weather_data = ref.get()

    data_list = []
    for key, value in weather_data.items():
        data_list.append(value)
    df = pd.DataFrame(data_list)

    df['lat'] = df['lat'].astype(float)
    df['lon'] = df['lon'].astype(float)
    df['temp'] = df['temp'].astype(float)
    df['humidity'] = df['humidity'].astype(float)
    df['windSpeed'] = df['windSpeed'].astype(float)

    kmeans = KMeans(n_clusters=4, random_state=42)
    df['region'] = kmeans.fit_predict(df[['lat', 'lon']])

    results = []
    for region in df['region'].unique():
        region_data = df[df['region'] == region]
        weather_counts = region_data['weather'].value_counts()
        main_weather = weather_counts.idxmax()

        avg_temp = region_data['temp'].mean()
        avg_humidity = region_data['humidity'].mean()
        avg_wind_speed = region_data['windSpeed'].mean()

        result = {
            "region": int(region),
            "average_temperature": round(avg_temp - 273.15, 2),
            "average_humidity": round(avg_humidity, 2),
            "average_wind_speed": round(avg_wind_speed, 2),
            "main_weather_condition": main_weather
        }
        results.append(result)

    print(json.dumps(results))

if __name__ == "__main__":
    main()
