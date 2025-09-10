import axios from "axios";
import { isIOSSafari } from "../utils/deviceDetection";

const ALADHAN_BASE_URL = "https://api.aladhan.com/v1";

export interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
  Sunset: string;
  Midnight: string;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        format: string;
        year: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        day: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
        holidays: string[];
      };
      gregorian: {
        date: string;
        format: string;
        year: string;
        month: {
          number: number;
          en: string;
        };
        day: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: Record<string, number>;
    };
  };
}

export interface PrayerMethod {
  id: number;
  name: string;
  description: string;
}

// Prayer calculation methods
export const PRAYER_METHODS: PrayerMethod[] = [
  {
    id: 1,
    name: "Muslim World League",
    description: "Used in Europe, Far East, parts of US",
  },
  {
    id: 2,
    name: "Islamic Society of North America (ISNA)",
    description: "Used in North America",
  },
  {
    id: 3,
    name: "Egyptian General Authority of Survey",
    description:
      "Used in Africa, Syria, Iraq, Lebanon, Malaysia, Parts of the USA",
  },
  {
    id: 4,
    name: "Umm Al-Qura University, Makkah",
    description: "Used in Saudi Arabia",
  },
  {
    id: 5,
    name: "University of Islamic Sciences, Karachi",
    description:
      "Used in Pakistan, Bangladesh, India, Afghanistan, Parts of Europe",
  },
  {
    id: 7,
    name: "Institute of Geophysics, University of Tehran",
    description: "Used in Iran, Some Shia communities",
  },
  {
    id: 8,
    name: "Gulf Region",
    description: "Modified version of Umm Al-Qura",
  },
  { id: 9, name: "Kuwait", description: "Used in Kuwait" },
  {
    id: 10,
    name: "Qatar",
    description: "Modified version of Umm Al-Qura used in Qatar",
  },
  {
    id: 11,
    name: "Majlis Ugama Islam Singapura, Singapore",
    description: "Used in Singapore",
  },
  {
    id: 12,
    name: "Union Organization islamic de France",
    description: "Used in France",
  },
  {
    id: 13,
    name: "Diyanet İşleri Başkanlığı, Turkey",
    description: "Used in Turkey",
  },
  {
    id: 14,
    name: "Spiritual Administration of Muslims of Russia",
    description: "Used in Russia",
  },
];

/**
 * Fetch prayer times for a specific location and date
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param date - Date in DD-MM-YYYY format (optional, defaults to today)
 * @param method - Prayer calculation method ID (default: 2 for ISNA)
 * @param school - Jurisprudence school (0 = Shafi, 1 = Hanafi)
 */
/**
 * Fetch prayer times using native fetch as fallback for iOS Safari
 */
async function fetchWithFallback(url: string, config: any): Promise<any> {
  // First try with axios
  try {
    console.log("🔄 Trying axios request...");

    const response = await axios.get(url, config);

    console.log("✅ Axios success! Response:", response.status, response.data);

    return response.data;
  } catch (axiosError) {
    console.warn("❌ Axios failed, trying fetch fallback:", axiosError);

    // Fallback to native fetch for iOS Safari
    try {
      console.log("🔄 Trying native fetch...");
      const fetchConfig: RequestInit = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors", // Important for cross-origin requests
        cache: "no-cache",
        credentials: "omit", // Don't send cookies
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || 15000
      );

      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Fetch success! Data:", data);
      return data;
    } catch (fetchError) {
      console.error("❌ Both axios and fetch failed:", {
        axiosError,
        fetchError,
      });
      throw fetchError;
    }
  }
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  date?: string,
  method: number = 2, // ISNA default for Montreal
  school: number = 0 // Shafi default
): Promise<PrayerTimesResponse> {
  try {
    const dateParam = date || formatDate(new Date());

    // Use simplified URL that works on both iOS Safari and PC (based on debug testing)
    // Debug shows simple format works: https://api.aladhan.com/v1/timings?latitude=45.5088&longitude=-73.5878&method=2&school=0
    // But complex format fails in production: https://api.aladhan.com/v1/timings/09-09-2025?...
    const url = `${ALADHAN_BASE_URL}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`;

    console.log(`🔄 Fetching prayer times from simplified URL: ${url}`);

    // Use axios directly since debug shows it works on both platforms with simple URL
    const response = await axios.get(url, {
      timeout: 25000,
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });

    const data = response.data;
    console.log("✅ Simplified URL success!", {
      code: data.code,
      hasTimings: !!data.data?.timings,
    });

    if (data.code !== 200) {
      const apiError = new Error(`Prayer times API error: ${data.status}`);
      console.error("❌ API returned error code:", data.code, data.status);
      throw apiError;
    }

    return data;
  } catch (error) {
    console.error("Prayer times fetch error:", error);

    // More specific error handling for iOS Safari
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          "Request timed out. Please check your internet connection."
        );
      }
      if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Cannot connect to prayer times service. Please check if you have a stable internet connection."
        );
      }
      if (error.message.includes("CORS")) {
        throw new Error(
          "Browser blocked the request. Please try refreshing the page."
        );
      }
    }

    if (axios.isAxiosError(error)) {
      if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        throw new Error(
          "Network connection failed. Please check your internet connection and try again."
        );
      }
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timeout. Please check your connection and try again."
        );
      }
      if (error.response?.status === 0) {
        throw new Error(
          "Cannot connect to prayer times service. Please check if you have internet access."
        );
      }
    }

    throw new Error(
      `Prayer times unavailable: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get prayer times for multiple days
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param days - Number of days to fetch (max 30)
 * @param method - Prayer calculation method ID
 * @param school - Jurisprudence school
 */
export async function fetchPrayerTimesRange(
  latitude: number,
  longitude: number,
  days: number = 7,
  method: number = 2,
  school: number = 0
): Promise<PrayerTimesResponse[]> {
  const promises = [];
  const today = new Date();

  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    promises.push(
      fetchPrayerTimes(latitude, longitude, formatDate(date), method, school)
    );
  }

  return Promise.all(promises);
}

/**
 * Format date for API (DD-MM-YYYY)
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

/**
 * Convert prayer time string to Date object
 * @param timeStr - Prayer time in HH:MM format
 * @param timezone - Timezone offset in minutes
 */
export function parseTime(timeStr: string, timezone?: number): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  if (timezone !== undefined) {
    // Adjust for timezone if provided
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset() + timezone);
  }

  return date;
}

/**
 * Get the next prayer time
 * @param timings - Prayer timings object
 */
export function getNextPrayer(
  timings: PrayerTimings
): { name: string; time: string; timeUntil: number } | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerTime = hours * 60 + minutes;

    if (prayerTime > currentTime) {
      const timeUntil = prayerTime - currentTime;
      return {
        name: prayer.name,
        time: prayer.time,
        timeUntil,
      };
    }
  }

  // If no prayer found for today, return Fajr for tomorrow
  const [hours, minutes] = timings.Fajr.split(":").map(Number);
  const fajrTime = hours * 60 + minutes;
  const timeUntil = 24 * 60 - currentTime + fajrTime;

  return {
    name: "Fajr",
    time: timings.Fajr,
    timeUntil,
  };
}

/**
 * Check if current time is within a prayer window
 * @param timings - Prayer timings object
 * @param bufferMinutes - Buffer time in minutes before/after prayer
 */
export function getCurrentPrayerWindow(
  timings: PrayerTimings,
  bufferMinutes: number = 15
): { name: string; time: string; isActive: boolean } | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerTime = hours * 60 + minutes;

    if (Math.abs(currentTime - prayerTime) <= bufferMinutes) {
      return {
        name: prayer.name,
        time: prayer.time,
        isActive: true,
      };
    }
  }

  return null;
}
