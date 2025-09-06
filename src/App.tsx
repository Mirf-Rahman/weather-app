import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useWeather } from "./hooks/useWeather";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard";
import { ForecastGrid } from "./components/ForecastGrid";
import WeatherCharts from "./components/WeatherCharts";
import AirQuality from "./components/AirQuality";
import WeatherInsights from "./components/WeatherInsights";
import { UnitToggle } from "./components/UnitToggle";
import { ErrorMessage } from "./components/ErrorMessage";
import { Loader } from "./components/Loader";
import { WeatherAnalytics } from "./components/WeatherAnalytics";
import { LocationManager } from "./components/LocationManager";
import { SettingsPanel } from "./components/SettingsPanel";
import { alertsManager } from "./utils/alerts";
import { weatherDB } from "./utils/database";
import "./AppLayout.css";
import "./styles/enhanced.css";
import "./styles/theme.css";
import "./styles/components.css";
import "./styles/charts.css";

export const App: React.FC = () => {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [showHome, setShowHome] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(() => {
    return localStorage.getItem("timeFormat") === "12h" ? "12h" : "24h";
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  });
  const { current, forecast, airQuality, loading, error, search, searchByCoords } =
    useWeather(units);

  useEffect(() => {
    const last = localStorage.getItem("lastCity");
    if (last) {
      search(last);
      setShowHome(false);
    }
  }, [search]);

  // Initialize database and check for alerts
  useEffect(() => {
    weatherDB.init().catch(console.error);

    if (current) {
      alertsManager.checkWeatherConditions(current, current.name);
    }
  }, [current]);

  // Effect to apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Effect to store time format preference
  useEffect(() => {
    localStorage.setItem("timeFormat", timeFormat);
  }, [timeFormat]);

  function handleSearch(city: string) {
    search(city);
    setShowHome(false);
  }

  const refreshWeather = useCallback(() => {
    if (!current) return;

    setIsRefreshing(true);
    search(current.name).finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); // Keep spinning for at least 1s for visual feedback
    });
  }, [current, search]);

  // Map condition to base theme class (still used for internal styling hooks)
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

  // Fixed gradients: always blue in dark mode, orange in light mode (user request)
  const computedGradient = useMemo(() => {
    if (theme === "dark") {
      return "linear-gradient(135deg,#0f172a 0%,#0c4a6e 30%,#0369a1 60%,#0ea5e9 100%)";
    }
    return "linear-gradient(135deg,#fef3c7 0%,#fdba74 30%,#fb923c 60%,#f97316 100%)";
  }, [theme]);

  // Home page content
  const renderHomePage = () => (
    <div className="home-page">
      <div className="home-controls">
        <div className="home-toggles">
          <button
            className={`icon-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <button
            className={`icon-btn ${timeFormat === "24h" ? "active" : ""}`}
            onClick={() => setTimeFormat(timeFormat === "24h" ? "12h" : "24h")}
            title={`Switch to ${
              timeFormat === "24h" ? "12-hour" : "24-hour"
            } format`}
          >
            <span className="time-format">
              {timeFormat === "24h" ? "24h" : "12h"}
            </span>
          </button>
        </div>
      </div>

      <div className="home-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-icon">🌤️</div>
          <h1 className="hero-title">Weather Forecast</h1>
          <p className="hero-subtitle">
            Discover weather conditions worldwide with real-time data and
            accurate forecasts
          </p>

          <div className="hero-search">
            <div className="home-search-form">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              className="home-btn primary"
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  searchByCoords(latitude, longitude);
                  setShowHome(false);
                });
              }}
            >
              📍 Use My Current Location
            </button>
          </div>
        </div>
      </div>

      <div className="home-features">
        <div className="features-container">
          <h2 className="features-title">What You'll Get</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌡️</div>
              <h3>Real-Time Temperature</h3>
              <p>
                Current conditions, feels-like temperature, and daily min/max
                values
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Metrics</h3>
              <p>
                Comprehensive data including humidity, pressure, wind speed, and
                visibility
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3>5-Day Forecast</h3>
              <p>
                Extended forecast with hourly breakdowns and weather patterns
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Coverage</h3>
              <p>
                Access weather data for any city or location around the world
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕒</div>
              <h3>Time Zones</h3>
              <p>
                Local time comparison between your location and searched cities
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Interface</h3>
              <p>Dark and light themes with weather-responsive backgrounds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="home-footer">
        <div className="footer-content">
          <p>Powered by OpenWeatherMap API</p>
          <div className="footer-links">
            <span>Made by Mir Faiyazur Rahman</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`container ${themeClass}`}
      data-theme={theme}
      style={{
        background: computedGradient,
        ["--app-gradient" as any]: computedGradient,
      }}
    >
      <header>
        <h1 className="logo" onClick={() => setShowHome(true)}>
          <span className="logo-icon">☀️</span> Weather
        </h1>
        {!showHome && (
          <>
            <SearchBar onSearch={handleSearch} />
            <div className="controls-group">
              <UnitToggle units={units} onChange={(u) => setUnits(u)} />

              <LocationManager
                onLocationSelect={handleSearch}
                currentLocation={current?.name || ""}
              />

              <button
                className="icon-btn"
                onClick={() => setShowAnalytics(!showAnalytics)}
                title="Toggle analytics"
              >
                📊
              </button>

              <button
                className={`icon-btn ${showCharts ? "active" : ""}`}
                onClick={() => setShowCharts(!showCharts)}
                title="Toggle charts"
              >
                📈
              </button>

              <button
                className="icon-btn"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                ⚙️
              </button>

              <button
                className={`icon-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span className="btn-icon">
                  {theme === "dark" ? "🌙" : "☀️"}
                </span>
              </button>

              <button
                className={`icon-btn ${timeFormat === "24h" ? "active" : ""}`}
                onClick={() =>
                  setTimeFormat(timeFormat === "24h" ? "12h" : "24h")
                }
                title={`Switch to ${
                  timeFormat === "24h" ? "12-hour" : "24-hour"
                } format`}
              >
                <span className="btn-icon">
                  {timeFormat === "24h" ? "24h" : "12h"}
                </span>
              </button>

              <button
                className="location-btn"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    searchByCoords(latitude, longitude);
                    setShowHome(false);
                  });
                }}
              >
                <span className="btn-icon">📍</span> My Location
              </button>
            </div>
          </>
        )}
      </header>

      <div className="content">
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => (current ? search(current.name) : undefined)}
          />
        )}
        {loading && <Loader />}

        {showHome && !loading && !error ? (
          renderHomePage()
        ) : (
          <>
            {current && !loading && (
              <CurrentWeatherCard
                data={current}
                units={units}
                timeFormat={timeFormat}
              />
            )}
            {forecast && !loading && (
              <h3 className="forecast-title">5-Day Forecast</h3>
            )}
            {forecast && !loading && (
              <ForecastGrid
                data={forecast}
                units={units}
                timeFormat={timeFormat}
              />
            )}

            {showCharts && forecast && !loading && (
              <WeatherCharts
                forecast={forecast.list}
                units={units}
                theme={theme}
              />
            )}

            {airQuality && !loading && (
              <AirQuality
                data={airQuality}
                theme={theme}
              />
            )}

            {current && forecast && !loading && (
              <WeatherInsights
                current={current}
                forecast={forecast}
                airQuality={airQuality}
                units={units}
                theme={theme}
              />
            )}

            {showAnalytics && current && forecast && (
              <WeatherAnalytics
                currentWeather={current}
                forecast={forecast}
                units={units}
              />
            )}

            {!current && !loading && !error && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Search for a city to see weather information</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Refresh button - only shown when weather data is displayed */}
      {current && !showHome && (
        <button
          className={`refresh-btn ${isRefreshing ? "spinning" : ""}`}
          onClick={refreshWeather}
          disabled={isRefreshing || loading}
          title="Refresh weather data"
        >
          <span className="refresh-icon">⟳</span>
        </button>
      )}

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        units={units}
        onUnitsChange={setUnits}
        theme={theme}
        onThemeChange={setTheme}
        timeFormat={timeFormat}
        onTimeFormatChange={setTimeFormat}
      />
    </div>
  );
};
