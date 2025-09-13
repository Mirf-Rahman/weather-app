import axios from "axios";

const API_BASE = import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:8000/api";

export async function pingBackend(): Promise<{ status: string }> {
  const { data } = await axios.get(`${API_BASE}/health`);
  return data;
}

export async function signup(email: string, password: string): Promise<{ id: number; email: string }>{
  const { data } = await axios.post(`${API_BASE}/auth/signup`, { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }>{
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const { data } = await axios.post(`${API_BASE}/auth/login`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function ingestWeather(payload: {
  location_name?: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  weather_condition?: string;
  raw_data?: any;
}) {
  const { data } = await axios.post(`${API_BASE}/weather/ingest`, payload);
  return data;
}

// Phase 2: Activities & Recommendations
export async function listActivities(): Promise<{ key: string; label: string; tags: string[] }[]> {
  const { data } = await axios.get(`${API_BASE}/recommendations/activities`);
  return data;
}

export async function getRecommendations(input: {
  user_id?: number;
  units: "metric" | "imperial";
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  top_k?: number;
}): Promise<{ key: string; label: string; score: number; reason: string }[]> {
  const { data } = await axios.post(`${API_BASE}/recommendations/activities`, input);
  return data;
}

export async function sendFeedback(input: { user_id: number; activity_key: string; rating: number }) {
  const { data } = await axios.post(`${API_BASE}/recommendations/feedback`, input);
  return data;
}
