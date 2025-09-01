import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

export interface CurrentWeather {
  name: string;
  dt: number;
  timezone: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  wind: { speed: number; deg: number };
  visibility: number;
  sys: { country: string; sunrise: number; sunset: number };
}

export interface ForecastListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  visibility: number;
  dt_txt: string;
}

export interface ForecastResponse {
  city: {
    name: string;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
  list: ForecastListItem[];
}

export interface GeocodeResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function fetchCurrentByCity(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<CurrentWeather> {
  const { data } = await axios.get<CurrentWeather>(`${BASE_URL}/weather`, {
    params: { q: city, appid: import.meta.env.VITE_OPENWEATHER_API_KEY, units },
  });
  return data;
}

export async function fetchForecastByCity(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<ForecastResponse> {
  const { data } = await axios.get<ForecastResponse>(`${BASE_URL}/forecast`, {
    params: { q: city, appid: import.meta.env.VITE_OPENWEATHER_API_KEY, units },
  });
  return data;
}

export async function fetchCurrentByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<CurrentWeather> {
  const { data } = await axios.get<CurrentWeather>(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
      units,
    },
  });
  return data;
}

export async function fetchForecastByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<ForecastResponse> {
  const { data } = await axios.get<ForecastResponse>(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
      units,
    },
  });
  return data;
}

export async function geocodeCity(
  q: string,
  limit: number = 5
): Promise<GeocodeResult[]> {
  if (!q.trim()) return [];
  const { data } = await axios.get<GeocodeResult[]>(`${GEO_URL}/direct`, {
    params: { q, appid: import.meta.env.VITE_OPENWEATHER_API_KEY, limit },
  });
  return data;
}
