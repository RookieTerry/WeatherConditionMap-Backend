import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pandas as pd
from dotenv import load_dotenv
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

load_dotenv('./.env.local')

database_url = os.getenv('FIREBASE_DATABASE_URL')

cred = credentials.Certificate('E:\\Code\\WeatherConditionMap\\backend\\serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': database_url
})

ref = db.reference('/position/weather')

weather_data = ref.get()

data_list = []
for key, value in weather_data.items():
    data_list.append(value)

df = pd.DataFrame(data_list)

df['date'] = pd.to_datetime(df['date'])
df['humidity'] = df['humidity'].astype(float)
df['lat'] = df['lat'].astype(float)
df['lon'] = df['lon'].astype(float)
df['temp'] = df['temp'].astype(float)
df['windSpeed'] = df['windSpeed'].astype(float)

df = df.sort_values('date')
df['day_of_year'] = df['date'].dt.dayofyear
features = df[['day_of_year', 'humidity', 'lat', 'lon', 'windSpeed']]
target = df['temp']

# divide training set and test set
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

# train the random forest regression model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

# visualization
plt.figure(figsize=(10, 5))
plt.plot(y_test.values, label='Actual Temperature')
plt.plot(y_pred, label='Predicted Temperature')
plt.xlabel('Sample Index')
plt.ylabel('Temperature')
plt.title('Actual vs Predicted Temperature')
plt.legend()
plt.show()

# predict weather condition in the next day
current_date = datetime.now()
future_date = current_date + timedelta(days=1)
future_day_of_year = future_date.timetuple().tm_yday

future_features = pd.DataFrame({
    'day_of_year': [future_day_of_year],
    'humidity': [df['humidity'].mean()],
    'lat': [df['lat'].mean()],
    'lon': [df['lon'].mean()],
    'windSpeed': [df['windSpeed'].mean()]
})

future_temp_pred = model.predict(future_features)
print(f'Predicted Temperature for {future_date.strftime("%Y-%m-%d")}: {future_temp_pred[0]}')
