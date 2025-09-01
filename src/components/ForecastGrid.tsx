import React, { useState } from "react";
import { ForecastResponse } from "../api/weather";
import { format } from "date-fns";

interface Props {
  data: ForecastResponse;
  units: "metric" | "imperial";
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

export const ForecastGrid: React.FC<Props> = ({ data, units }) => {
  const grouped = groupByDay(data.list, data.city.timezone);
  const tempUnit = units === "metric" ? "°C" : "°F";
  const [selected, setSelected] = useState<string | null>(null);

  const handleDayClick = (day: string) => {
    setSelected(selected === day ? null : day);
  };

  return (
    <div className="forecast-grid">
      {Object.entries(grouped).map(([day, items]) => {
        const temps = items.map((i) => i.main.temp);
        const min = Math.round(Math.min(...temps));
        const max = Math.round(Math.max(...temps));
        const icon = items[0].weather[0].icon;
        const isSelected = selected === day;

        return (
          <div
            className={`day fade-in ${isSelected ? "selected" : ""}`}
            key={day}
            onClick={() => handleDayClick(day)}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
          >
            <h4>{format(new Date(day), "eee d MMM")}</h4>
            <img
              src={`https://openweathermap.org/img/wn/${icon}.png`}
              alt={items[0].weather[0].description}
            />
            <div className="range">
              {min}
              {tempUnit} – {max}
              {tempUnit}
            </div>

            {isSelected && (
              <div className="day-details">
                <h5>Hourly Details</h5>
                <ul>
                  {items.slice(0, 4).map((item, i) => (
                    <li key={i}>
                      {format(new Date(item.dt_txt), "HH:mm")} -{" "}
                      {Math.round(item.main.temp)}
                      {tempUnit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
