import React, { useEffect, useState, useMemo } from "react";
import { useWeather } from "./hooks/useWeather";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard";
import { ForecastGrid } from "./components/ForecastGrid";
import { UnitToggle } from "./components/UnitToggle";
import { ErrorMessage } from "./components/ErrorMessage";
import { Loader } from "./components/Loader";
import "./AppLayout.css";

export const App: React.FC = () => {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const { current, forecast, loading, error, search, searchByCoords } =
    useWeather(units);

  useEffect(() => {
    const last = localStorage.getItem("lastCity");
    if (last) {
      search(last);
    }
  }, [search]);

  function handleSearch(city: string) {
    search(city);
  }

  const themeClass = useMemo(() => {
    if (!current) return "theme-default";
    const main = current.weather[0]?.main?.toLowerCase() || "default";
    const map: Record<string, string> = {
      clear: "theme-clear",
      clouds: "theme-clouds",
      rain: "theme-rain",
      thunderstorm: "theme-thunder",
      snow: "theme-snow",
      drizzle: "theme-rain",
      mist: "theme-mist",
      fog: "theme-mist",
      haze: "theme-mist",
    };
    return map[main] || "theme-default";
  }, [current]);

  return (
    <div className={`container ${themeClass}`}>
      <header>
        <h1 className="logo" onClick={() => window.location.reload()}>
          <span className="logo-icon">☀️</span> Weather
        </h1>
        <SearchBar onSearch={handleSearch} />
        <UnitToggle units={units} onChange={(u) => setUnits(u)} />
        <button
          className="location-btn"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude, longitude } = pos.coords;
              searchByCoords(latitude, longitude);
            });
          }}
        >
          <span className="btn-icon">📍</span> My Location
        </button>
      </header>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => (current ? search(current.name) : undefined)}
        />
      )}
      {loading && <Loader />}

      {current && !loading && (
        <CurrentWeatherCard data={current} units={units} />
      )}
      {forecast && !loading && (
        <h3 className="forecast-title">5-Day Forecast</h3>
      )}
      {forecast && !loading && <ForecastGrid data={forecast} units={units} />}

      {!current && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>Search for a city to see weather information</p>
        </div>
      )}
    </div>
  );
};
