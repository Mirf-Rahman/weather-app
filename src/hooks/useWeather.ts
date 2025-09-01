import { useCallback, useState } from "react";
import {
  CurrentWeather,
  ForecastResponse,
  fetchCurrentByCity,
  fetchForecastByCity,
  fetchCurrentByCoords,
  fetchForecastByCoords,
} from "../api/weather";

export function useWeather(units: "metric" | "imperial") {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cacheKey(type: "current" | "forecast", key: string) {
    return `cache:${type}:${units}:${key.toLowerCase()}`;
  }

  const search = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const cacheC = localStorage.getItem(cacheKey("current", q));
        const cacheF = localStorage.getItem(cacheKey("forecast", q));
        let c: CurrentWeather | null = null;
        let f: ForecastResponse | null = null;
        if (cacheC && cacheF) {
          try {
            c = JSON.parse(cacheC);
            f = JSON.parse(cacheF);
          } catch {
            /* ignore */
          }
        }
        if (!c || !f) {
          [c, f] = await Promise.all([
            fetchCurrentByCity(q, units),
            fetchForecastByCity(q, units),
          ]);
          localStorage.setItem(cacheKey("current", q), JSON.stringify(c));
          localStorage.setItem(cacheKey("forecast", q), JSON.stringify(f));
        }
        setCurrent(c);
        setForecast(f);
        setCity(q);
        localStorage.setItem("lastCity", q);
        setError(null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    },
    [units]
  );

  const searchByCoords = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
      try {
        const [c, f] = await Promise.all([
          fetchCurrentByCoords(lat, lon, units),
          fetchForecastByCoords(lat, lon, units),
        ]);
        setCurrent(c);
        setForecast(f);
        setCity(c.name);
        localStorage.setItem("lastCity", c.name);
        localStorage.setItem(cacheKey("current", key), JSON.stringify(c));
        localStorage.setItem(cacheKey("forecast", key), JSON.stringify(f));
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    },
    [units]
  );

  return { current, forecast, city, loading, error, search, searchByCoords };
}
