import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Weather emoji mapping
const weatherEmoji = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "❄️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Mist: "🌫️",
};

// Weather tips mapping
const weatherTips = {
  Clear: "It's sunny! Don't forget your sunglasses 😎",
  Clouds: "Cloudy skies today. You might need a light jacket 🌤️",
  Rain: "Take an umbrella! ☔",
  Snow: "Wear warm clothes! ❄️",
  Drizzle: "Carry a small umbrella 🌦️",
  Thunderstorm: "Stay indoors if possible ⛈️",
  Mist: "Drive carefully in the mist 🌫️",
};

// Animated effects for rain/snow
const WeatherEffect = ({ type }) => {
  if (type === "Rain" || type === "Drizzle") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="raindrop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    );
  } else if (type === "Snow") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  const apiKey = "d4afe42722c98e631dfa248801d35a63";

  const fetchWeather = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setError("");
    try {
      const resWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const dataWeather = await resWeather.json();
      if (dataWeather.cod !== 200) {
        setError("City not found. Try another one.");
        setWeather(null);
        setForecast(null);
        setHourly([]);
        setLoading(false);
        return;
      }
      setWeather(dataWeather);

      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const dataForecast = await resForecast.json();
      if (dataForecast.cod === "200") {
        setForecast(dataForecast);
        const hourlyData = dataForecast.list.slice(0, 12).map((item) => ({
          time: item.dt_txt.split(" ")[1].slice(0, 5),
          temp: item.main.temp,
        }));
        setHourly(hourlyData);
      }

      // Voice reading
      const speech = `The current temperature in ${dataWeather.name} is ${dataWeather.main.temp} degrees Celsius with ${dataWeather.weather[0].description}`;
      const utter = new SpeechSynthesisUtterance(speech);
      window.speechSynthesis.speak(utter);
    } catch (err) {
      setError("Error fetching data.");
      setWeather(null);
      setForecast(null);
      setHourly([]);
      console.error(err);
    }
    setLoading(false);
  };

  const addFavorite = (cityName) => {
    if (!favorites.includes(cityName)) {
      const updated = [...favorites, cityName];
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
    }
  };

  const removeFavorite = (cityName) => {
    const updated = favorites.filter((c) => c !== cityName);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const useLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setLoading(true);
      setError("");
      try {
        const resWeather = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const dataWeather = await resWeather.json();
        setCity(dataWeather.name);

        const resForecast = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const dataForecast = await resForecast.json();

        setWeather(dataWeather);
        if (dataForecast.cod === "200") {
          setForecast(dataForecast);
          const hourlyData = dataForecast.list.slice(0, 12).map((item) => ({
            time: item.dt_txt.split(" ")[1].slice(0, 5),
            temp: item.main.temp,
          }));
          setHourly(hourlyData);
        }
      } catch {
        setError("Cannot fetch location weather.");
      }
      setLoading(false);
    });
  };

  const formatDate = (dt_txt) => {
    const parts = dt_txt.split(" ")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const getBackground = () => {
    if (!weather) return "from-blue-200 via-blue-100 to-white";
    const main = weather.weather[0].main;
    switch (main) {
      case "Clear":
        return "from-yellow-200 via-yellow-100 to-orange-100";
      case "Clouds":
        return "from-gray-300 via-gray-200 to-gray-100";
      case "Rain":
      case "Drizzle":
        return "from-blue-300 via-blue-200 to-blue-100";
      case "Snow":
        return "from-white via-blue-100 to-gray-100";
      case "Thunderstorm":
        return "from-gray-400 via-gray-300 to-gray-200";
      default:
        return "from-blue-200 via-blue-100 to-white";
    }
  };

  return (
    <div
      className={`min-h-screen p-4 relative bg-gradient-to-b ${getBackground()} flex flex-col items-center justify-center text-center`}
    >
      {weather && <WeatherEffect type={weather.weather[0].main} />}

      {/* Header */}
      <header className="mb-8 relative z-10 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4 drop-shadow-md">
          Live Weather Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <input
            type="text"
            placeholder="Enter city name"
            className="p-2 rounded border border-gray-400 flex-1"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
            onClick={() => fetchWeather(city)}
          >
            Get Weather
          </button>
          <button
            className="p-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
            onClick={useLocation}
          >
            Use My Location
          </button>
        </div>
      </header>

      {/* Loading & Error */}
      {loading && <p className="text-blue-700 font-semibold">Loading...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {/* Current Weather */}
      {weather && weather.main && !error && (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">{weather.name}</h2>
          <p className="text-5xl mb-2">
            {weatherEmoji[weather.weather[0].main] || "🌤️"}
          </p>
          <p className="text-3xl font-bold">{weather.main.temp}°C</p>
          <p className="text-gray-600 capitalize">
            {weather.weather[0].description}
          </p>
          <div className="mt-4 bg-blue-100 p-3 rounded shadow">
            {weatherTips[weather.weather[0].main] || "Have a nice day!"}
          </div>
          <button
            className="mt-3 p-2 bg-yellow-400 rounded hover:bg-yellow-500 transition"
            onClick={() => addFavorite(weather.name)}
          >
            Add to Favorites
          </button>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <h3 className="font-semibold mb-2">Favorite Cities</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {favorites.map((fav) => (
              <div
                key={fav}
                className="bg-white rounded shadow px-3 py-1 flex items-center gap-2"
              >
                <button onClick={() => fetchWeather(fav)}>{fav}</button>
                <button
                  className="text-red-500 font-bold"
                  onClick={() => removeFavorite(fav)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Day Forecast */}
      {forecast?.list && !error && (
        <div className="w-full max-w-md mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {forecast.list
            .filter((item, index) => index % 8 === 0)
            .slice(0, 3)
            .map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold">{formatDate(item.dt_txt)}</p>
                <p className="text-3xl mb-2">
                  {weatherEmoji[item.weather[0].main] || "🌤️"}
                </p>
                <p className="text-xl font-bold">{item.main.temp}°C</p>
                <p className="text-gray-600 capitalize">
                  {item.weather[0].description}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Hourly Forecast */}
      {hourly.length > 0 && (
        <div className="w-full max-w-md mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Next 12 Hours Forecast</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourly}>
              <XAxis dataKey="time" />
              <YAxis unit="°C" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        .raindrop {
          position: absolute;
          width: 2px;
          height: 10px;
          background: rgba(255, 255, 255, 0.7);
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes fall {
          0% {
            top: -10px;
          }
          100% {
            top: 100%;
          }
        }
        .snowflake {
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation-name: snowFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes snowFall {
          0% {
            top: -10px;
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
          100% {
            top: 100%;
            transform: translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
