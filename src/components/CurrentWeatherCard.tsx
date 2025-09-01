import React from "react";
import { CurrentWeather } from "../api/weather";
import { format } from "date-fns";

interface Props {
  data: CurrentWeather;
  units: "metric" | "imperial";
}

export const CurrentWeatherCard: React.FC<Props> = ({ data, units }) => {
  const local = (data.dt + data.timezone) * 1000;
  const tempUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";
  const icon = data.weather[0]?.icon;

  return (
    <div className="current-card fade-in">
      <div className="header">
        <h2>
          {data.name}, {data.sys.country}
        </h2>
        <time>{format(local, "eee HH:mm")}</time>
      </div>
      <div className="main">
        <div className="temp">
          {Math.round(data.main.temp)}
          {tempUnit}
        </div>
        <div className="desc">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={data.weather[0].description}
          />
          <p>{data.weather[0].description}</p>
        </div>
      </div>
      <ul className="metrics">
        <li title="Feels Like">
          <span>🌡️</span> {Math.round(data.main.feels_like)}
          {tempUnit}
        </li>
        <li title="Humidity">
          <span>💧</span> {data.main.humidity}%
        </li>
        <li title="Wind Speed">
          <span>💨</span> {Math.round(data.wind.speed)} {windUnit}
        </li>
        <li title="Pressure">
          <span>📊</span> {data.main.pressure} hPa
        </li>
        <li title="Visibility">
          <span>👁️</span> {Math.round(data.visibility / 1000)} km
        </li>
        <li title="Sunrise">
          <span>🌅</span>{" "}
          {format((data.sys.sunrise + data.timezone) * 1000, "HH:mm")}
        </li>
        <li title="Sunset">
          <span>🌇</span>{" "}
          {format((data.sys.sunset + data.timezone) * 1000, "HH:mm")}
        </li>
      </ul>
    </div>
  );
};
