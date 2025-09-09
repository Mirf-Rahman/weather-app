import { useState, useEffect, useCallback } from "react";
import {
  fetchPrayerTimes,
  fetchPrayerTimesRange,
  PrayerTimings,
  PrayerTimesResponse,
  getNextPrayer,
  getCurrentPrayerWindow,
  PRAYER_METHODS
} from "../api/prayerTimes";
import { getApproximatePrayerTimes } from "../utils/localPrayerTimes";
import { debugPrayerTimes } from "../utils/iosDebugger";
import { isIOSSafari } from "../utils/deviceDetection";

export interface PrayerTimesState {
  timings: PrayerTimings | null;
  hijriDate: string | null;
  nextPrayer: { name: string; time: string; timeUntil: number } | null;
  currentPrayerWindow: { name: string; time: string; isActive: boolean } | null;
  method: number;
  school: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

export interface PrayerNotification {
  id: string;
  prayerName: string;
  time: string;
  minutesBefore: number;
  enabled: boolean;
}

export function usePrayerTimes(
  latitude?: number,
  longitude?: number,
  method: number = 2, // ISNA default
  school: number = 0   // Shafi default
) {
  const [state, setState] = useState<PrayerTimesState>({
    timings: null,
    hijriDate: null,
    nextPrayer: null,
    currentPrayerWindow: null,
    method,
    school,
    loading: false,
    error: null,
    lastUpdated: 0,
  });

  const [notifications, setNotifications] = useState<PrayerNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  // Cache key generator
  const getCacheKey = useCallback((lat: number, lon: number, date: string) => {
    return `prayer_times_${lat.toFixed(3)}_${lon.toFixed(3)}_${date}_${method}_${school}`;
  }, [method, school]);

  // Format current date for caching
  const getCurrentDateKey = useCallback(() => {
    const today = new Date();
    return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  }, []);

  // Load prayer times
  const loadPrayerTimes = useCallback(async (lat: number, lon: number, useCache: boolean = true) => {
    if (!lat || !lon) return;

    console.log('🔄 loadPrayerTimes called with:', { lat, lon, useCache, isIOS: isIOSSafari() });
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const dateKey = getCurrentDateKey();
      const cacheKey = getCacheKey(lat, lon, dateKey);
      
      // Check cache first
      let cachedData: PrayerTimesResponse | null = null;
      if (useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            cachedData = JSON.parse(cached);
            // Check if cache is still valid (within last 6 hours)
            const cacheTime = localStorage.getItem(`${cacheKey}_timestamp`);
            if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < 6 * 60 * 60 * 1000) {
              const timings = cachedData.data.timings;
              const nextPrayer = getNextPrayer(timings);
              const currentWindow = getCurrentPrayerWindow(timings);
              const hijriDate = `${cachedData.data.date.hijri.day} ${cachedData.data.date.hijri.month.en} ${cachedData.data.date.hijri.year} ${cachedData.data.date.hijri.designation.abbreviated}`;

              setState(prev => ({
                ...prev,
                timings,
                hijriDate,
                nextPrayer,
                currentPrayerWindow: currentWindow,
                loading: false,
                lastUpdated: parseInt(cacheTime),
              }));
              return;
            }
          } catch (e) {
            console.warn('Invalid cached prayer times data');
          }
        }
      }

      // Fetch fresh data with retry mechanism for iOS Safari
      let response: PrayerTimesResponse | null = null;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Fetching prayer times (attempt ${attempt}/3):`, { lat, lon, method, school });
          response = await fetchPrayerTimes(lat, lon, undefined, method, school);
          console.log('✅ Prayer times fetch successful in hook!', { hasResponse: !!response });
          break;
        } catch (error) {
          lastError = error as Error;
          console.warn(`❌ Prayer times fetch attempt ${attempt} failed:`, error);
          debugPrayerTimes.logApiError({ attempt, error: error instanceof Error ? error.message : error });
          
          // If it's a network error and we have cached data, use it
          if (cachedData && (error as Error).message.includes('Network')) {
            console.log('📦 Using cached data due to network error');
            const timings = cachedData.data.timings;
            const nextPrayer = getNextPrayer(timings);
            const currentWindow = getCurrentPrayerWindow(timings);
            const hijriDate = `${cachedData.data.date.hijri.day} ${cachedData.data.date.hijri.month.en} ${cachedData.data.date.hijri.year} ${cachedData.data.date.hijri.designation.abbreviated}`;

            setState(prev => ({
              ...prev,
              timings,
              hijriDate,
              nextPrayer,
              currentPrayerWindow: currentWindow,
              loading: false,
              error: 'Using cached data (offline)',
              lastUpdated: Date.now(),
            }));
            return;
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        }
      }
      
      if (!response && lastError) {
        console.error('🚨 All prayer times attempts failed, throwing error:', lastError);
        throw lastError;
      }

      if (!response) {
        throw new Error('Failed to fetch prayer times after multiple attempts');
      }
      
      console.log('✅ Prayer times response received in hook!', { 
        hasResponse: !!response, 
        hasData: !!response?.data, 
        hasTimings: !!response?.data?.timings,
        isIOS: isIOSSafari() 
      });
      
      // Cache the response
      localStorage.setItem(cacheKey, JSON.stringify(response));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

      const timings = response.data.timings;
      const nextPrayer = getNextPrayer(timings);
      const currentWindow = getCurrentPrayerWindow(timings);
      const hijriDate = `${response.data.date.hijri.day} ${response.data.date.hijri.month.en} ${response.data.date.hijri.year} ${response.data.date.hijri.designation.abbreviated}`;

      console.log('✅ About to update state with prayer times:', { 
        hasTimings: !!timings, 
        nextPrayerName: nextPrayer?.name,
        isIOS: isIOSSafari()
      });

      setState(prev => ({
        ...prev,
        timings,
        hijriDate,
        nextPrayer,
        currentPrayerWindow: currentWindow,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      }));
      
      console.log('✅ State updated successfully with prayer times!', { isIOS: isIOSSafari() });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prayer times';
      console.error('❌ Error fetching prayer times in hook:', { 
        error: err, 
        message: errorMessage,
        isIOS: isIOSSafari()
      });
      debugPrayerTimes.logApiError({ hookError: errorMessage, isIOSSafari: isIOSSafari() });
      
      // Try local calculation as final fallback
      try {
        console.log('🔄 Attempting local prayer times calculation...', { isIOS: isIOSSafari() });
        debugPrayerTimes.logFallback(errorMessage);
        
        const localTimes = getApproximatePrayerTimes('your location', lat, lon);
        const nextPrayer = getNextPrayer(localTimes);
        const currentWindow = getCurrentPrayerWindow(localTimes);
        
        console.log('✅ Local times calculated, updating state...', { 
          hasLocalTimes: !!localTimes,
          isIOS: isIOSSafari()
        });
        
        setState(prev => ({
          ...prev,
          timings: localTimes,
          hijriDate: null, // Not available in local calculation
          nextPrayer,
          currentPrayerWindow: currentWindow,
          loading: false,
          error: 'Using approximate times (network unavailable)',
          lastUpdated: Date.now(),
        }));
        
        console.log('Local prayer times calculated successfully');
        return;
      } catch (localError) {
        console.error('Local calculation also failed:', localError);
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [method, school, getCacheKey, getCurrentDateKey]);

  // Update next prayer and current window periodically
  useEffect(() => {
    if (!state.timings) return;

    const updatePrayerInfo = () => {
      const nextPrayer = getNextPrayer(state.timings!);
      const currentWindow = getCurrentPrayerWindow(state.timings!);
      
      setState(prev => ({
        ...prev,
        nextPrayer,
        currentPrayerWindow: currentWindow,
      }));
    };

    // Update every minute
    const interval = setInterval(updatePrayerInfo, 60000);
    return () => clearInterval(interval);
  }, [state.timings]);

  // Auto-refresh prayer times daily
  useEffect(() => {
    if (!latitude || !longitude) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Refresh at midnight
    const timeout = setTimeout(() => {
      loadPrayerTimes(latitude, longitude, false); // Force fresh data
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [latitude, longitude, loadPrayerTimes]);

  // Initialize notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const storedNotifications = localStorage.getItem('prayer_notifications_enabled');
      setNotificationsEnabled(storedNotifications === 'true');
      
      if (state.timings) {
        const defaultNotifications: PrayerNotification[] = [
          { id: 'fajr', prayerName: 'Fajr', time: state.timings.Fajr, minutesBefore: 15, enabled: true },
          { id: 'dhuhr', prayerName: 'Dhuhr', time: state.timings.Dhuhr, minutesBefore: 15, enabled: true },
          { id: 'asr', prayerName: 'Asr', time: state.timings.Asr, minutesBefore: 15, enabled: true },
          { id: 'maghrib', prayerName: 'Maghrib', time: state.timings.Maghrib, minutesBefore: 15, enabled: true },
          { id: 'isha', prayerName: 'Isha', time: state.timings.Isha, minutesBefore: 15, enabled: true },
        ];
        setNotifications(defaultNotifications);
      }
    }
  }, [state.timings]);

  // Schedule notifications with enhanced 15-minute alerts
  useEffect(() => {
    if (!notificationsEnabled || !state.timings) return;

    const scheduleNotification = (notification: PrayerNotification) => {
      const [hours, minutes] = notification.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);
      
      // Schedule 15-minute warning
      const warningTime = new Date(prayerTime.getTime() - 15 * 60000);
      const now = new Date();
      
      if (warningTime > now) {
        const timeUntilWarning = warningTime.getTime() - now.getTime();
        
        setTimeout(() => {
          if ('serviceWorker' in navigator && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(`🕌 ${notification.prayerName} Prayer Alert`, {
                body: `${notification.prayerName} prayer time is in 15 minutes (${notification.time}).\nPrepare for prayer and make wudu.`,
                icon: '/prayer-icon.png',
                badge: '/prayer-badge.png',
                tag: `prayer-warning-${notification.id}`,
                requireInteraction: true,
                silent: false
              });
            }
          }
        }, timeUntilWarning);
      }

      // Schedule exact prayer time notification
      if (prayerTime > now) {
        const timeUntilPrayer = prayerTime.getTime() - now.getTime();
        
        setTimeout(() => {
          if ('serviceWorker' in navigator && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(`🕌 ${notification.prayerName} Prayer Time`, {
                body: `It's time for ${notification.prayerName} prayer. الله أكبر`,
                icon: '/prayer-icon.png',
                badge: '/prayer-badge.png',
                tag: `prayer-time-${notification.id}`,
                requireInteraction: true,
                silent: false
              });
            }
          }
        }, timeUntilPrayer);
      }
    };

    // Reset notifications array with current timings
    const enhancedNotifications: PrayerNotification[] = [
      { id: 'fajr', prayerName: 'Fajr', time: state.timings.Fajr, minutesBefore: 15, enabled: true },
      { id: 'dhuhr', prayerName: 'Dhuhr', time: state.timings.Dhuhr, minutesBefore: 15, enabled: true },
      { id: 'asr', prayerName: 'Asr', time: state.timings.Asr, minutesBefore: 15, enabled: true },
      { id: 'maghrib', prayerName: 'Maghrib', time: state.timings.Maghrib, minutesBefore: 15, enabled: true },
      { id: 'isha', prayerName: 'Isha', time: state.timings.Isha, minutesBefore: 15, enabled: true },
    ];

    setNotifications(enhancedNotifications);

    enhancedNotifications.forEach(notification => {
      if (notification.enabled) {
        scheduleNotification(notification);
      }
    });
  }, [notificationsEnabled, state.timings]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      setNotificationsEnabled(enabled);
      localStorage.setItem('prayer_notifications_enabled', enabled.toString());
      return enabled;
    }
    return Notification.permission === 'granted';
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }
    
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('prayer_notifications_enabled', newState.toString());
    return newState;
  }, [notificationsEnabled, requestNotificationPermission]);

  // Update prayer method
  const updateMethod = useCallback((newMethod: number) => {
    setState(prev => ({ ...prev, method: newMethod }));
    if (latitude && longitude) {
      // Clear cache when method changes
      const dateKey = getCurrentDateKey();
      const oldCacheKey = getCacheKey(latitude, longitude, dateKey);
      localStorage.removeItem(oldCacheKey);
      localStorage.removeItem(`${oldCacheKey}_timestamp`);
      
      // Reload with new method
      loadPrayerTimes(latitude, longitude, false);
    }
  }, [latitude, longitude, getCacheKey, getCurrentDateKey, loadPrayerTimes]);

  // Update school
  const updateSchool = useCallback((newSchool: number) => {
    setState(prev => ({ ...prev, school: newSchool }));
    if (latitude && longitude) {
      // Clear cache when school changes
      const dateKey = getCurrentDateKey();
      const oldCacheKey = getCacheKey(latitude, longitude, dateKey);
      localStorage.removeItem(oldCacheKey);
      localStorage.removeItem(`${oldCacheKey}_timestamp`);
      
      // Reload with new school
      loadPrayerTimes(latitude, longitude, false);
    }
  }, [latitude, longitude, getCacheKey, getCurrentDateKey, loadPrayerTimes]);

  // Refresh prayer times manually
  const refresh = useCallback(() => {
    if (latitude && longitude) {
      loadPrayerTimes(latitude, longitude, false);
    }
  }, [latitude, longitude, loadPrayerTimes]);

  // Load prayer times when coordinates change
  useEffect(() => {
    if (latitude && longitude) {
      loadPrayerTimes(latitude, longitude);
    }
  }, [latitude, longitude, loadPrayerTimes]);

  return {
    ...state,
    notifications,
    notificationsEnabled,
    availableMethods: PRAYER_METHODS,
    loadPrayerTimes,
    refresh,
    updateMethod,
    updateSchool,
    toggleNotifications,
    requestNotificationPermission,
  };
}
