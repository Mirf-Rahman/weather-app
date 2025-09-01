import React, { useState } from "react";
import { ForecastResponse } from "../api/weather";
import { format } from "date-fns";

interface Props {
  data: ForecastResponse;
  units: "metric" | "imperial";
  timeFormat?: "12h" | "24h";
}

function groupByDay(list: ForecastResponse["list"], tz: number) {
  const map: Record<string, typeof list> = {};
  list.forEach((item) => {
    const local = (item.dt + tz) * 1000;
    const key = format(local, "yyyy-MM-dd");
    map[key] = map[key] || [];
    map[key].push(item);
  });
  return map;
}

export const ForecastGrid: React.FC<Props> = ({
  data,
  units,
  timeFormat = "24h",
}) => {
  const grouped = groupByDay(data.list, data.city.timezone);
  const tempUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";
  const [selected, setSelected] = useState<string | null>(null);

  // Format time based on user preference
  const formatTime = (time: number | Date) => {
    return format(time, timeFormat === "12h" ? "h:mm aa" : "HH:mm");
  };

  const handleDayClick = (day: string) => {
    setSelected(selected === day ? null : day);
  };

  // Get weather summary text
  const getDayWeatherSummary = (items: ForecastResponse["list"][number][]) => {
    // Get the most common weather condition
    const conditions = items.map((item) => item.weather[0].main.toLowerCase());
    const conditionCounts: Record<string, number> = {};

    conditions.forEach((condition) => {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });

    const mainCondition = Object.entries(conditionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // Get temperature range
    const temps = items.map((item) => item.main.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));

    // Create summary text
    const conditionText =
      {
        clear: "Clear skies",
        clouds: "Mostly cloudy",
        rain: "Rainy conditions",
        snow: "Snowy weather",
        thunderstorm: "Thunderstorms",
        drizzle: "Light rain",
        mist: "Misty conditions",
        fog: "Foggy conditions",
      }[mainCondition] || "Mixed conditions";

    return `${conditionText}. Temperatures from ${min}${tempUnit} to ${max}${tempUnit}.`;
  };

  const expanded = selected !== null;

  return (
    <div className={`forecast-grid ${expanded ? "expanded" : ""}`}>
      {Object.entries(grouped).map(([day, items]) => {
        const temps = items.map((i) => i.main.temp);
        const min = Math.round(Math.min(...temps));
        const max = Math.round(Math.max(...temps));
        const icon = items[0].weather[0].icon;
        const isSelected = selected === day;
        const weatherSummary = getDayWeatherSummary(items);

        return (
          <div
            className={`day fade-in ${isSelected ? "selected" : ""}`}
            key={day}
            onClick={() => handleDayClick(day)}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-label={`Forecast for ${format(new Date(day), "EEEE, MMMM d")}`}
          >
            <h4>{format(new Date(day), "EEE, MMM d")}</h4>
            <img
              src={`https://openweathermap.org/img/wn/${icon}.png`}
              alt={items[0].weather[0].description}
            />
            <div className="range">
              <span className="max">
                {max}
                {tempUnit}
              </span>
              <span className="divider"> / </span>
              <span className="min">
                {min}
                {tempUnit}
              </span>
            </div>

            <div className="day-summary">{weatherSummary}</div>

            {isSelected && (
              <div className="day-details">
                <h5>Hourly Forecast</h5>
                <ul>
                  {items.slice(0, 6).map((item, i) => {
                    const itemTime = new Date(item.dt_txt);
                    return (
                      <li key={i}>
                        <div className="hour-time">{formatTime(itemTime)}</div>
                        <div className="hour-weather">
                          <img
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                            alt={item.weather[0].description}
                            className="hour-icon"
                          />
                        </div>
                        <div className="hour-temp">
                          {Math.round(item.main.temp)}
                          {tempUnit}
                        </div>
                        <div className="hour-details">
                          <span title="Feels Like">
                            🌡️ {Math.round(item.main.feels_like)}
                            {tempUnit}
                          </span>
                          <span title="Humidity">💧 {item.main.humidity}%</span>
                          <span title="Wind">
                            💨 {Math.round(item.wind.speed)} {windUnit}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
