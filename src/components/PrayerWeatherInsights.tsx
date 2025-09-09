import React, { useMemo } from "react";
import { CurrentWeather } from "../api/weather";
import { PrayerTimings } from "../api/prayerTimes";
import { getWeatherContextualQuote, getPrayerContextualQuote, getTimeBasedQuote, IslamicQuote } from "../data/islamicQuotes";

interface PrayerWeatherInsightsProps {
  current: CurrentWeather;
  timings: PrayerTimings | null;
  nextPrayer: { name: string; time: string; timeUntil: number } | null;
  theme: "light" | "dark";
  cityName?: string;
}

const PrayerWeatherInsights: React.FC<PrayerWeatherInsightsProps> = ({
  current,
  timings,
  nextPrayer,
  theme,
  cityName = "your location",
}) => {
  
  // Get weather emoji based on condition
  const getWeatherEmoji = (weatherCode: string, isDay: boolean = true): string => {
    const weatherEmojis: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return weatherEmojis[weatherCode] || '🌤️';
  };

  // Get daily quote based on multiple contexts - weather, prayer time, and time of day
  const dailyQuote: IslamicQuote = useMemo(() => {
    const weatherMain = current.weather[0].main;
    const currentHour = new Date().getHours();
    
    // Dynamic theme selection based on multiple factors
    const timeBasedThemes = [];
    
    // Add time-based themes for more dynamic selection
    if (currentHour >= 5 && currentHour < 12) {
      timeBasedThemes.push('morning', 'fajr', 'dawn');
    } else if (currentHour >= 12 && currentHour < 15) {
      timeBasedThemes.push('midday', 'dhuhr', 'work');
    } else if (currentHour >= 15 && currentHour < 18) {
      timeBasedThemes.push('afternoon', 'asr', 'reflection');
    } else if (currentHour >= 18 && currentHour < 21) {
      timeBasedThemes.push('evening', 'maghrib', 'gratitude');
    } else {
      timeBasedThemes.push('night', 'isha', 'contemplation');
    }
    
    // If we have prayer times, use prayer-specific quotes
    if (nextPrayer) {
      return getPrayerContextualQuote(nextPrayer.name);
    }
    
    // Otherwise use weather and time contextual quote
    return getWeatherContextualQuote(weatherMain, timeBasedThemes);
  }, [current.weather, nextPrayer]);

  // If prayer times failed to load, show weather-only guidance
  if (!timings) {
    return (
      <div className={`prayer-weather-insights ${theme}`}>
        <div className="insights-header">
          <div className="prayer-title">
            <h3>
              <span className="title-icon">🕌</span>
              Weather Guidance
              <span className="location-badge">{cityName}</span>
            </h3>
          </div>
          <div className="bismillah" data-tooltip="In the name of Allah, the Most Gracious, the Most Merciful">
            ✨ Islamic wisdom meets weather wisdom • الحكمة الإسلامية
          </div>
        </div>

        <div className="weather-summary-banner" data-weather={current.weather[0].main.toLowerCase()}>
          <div className="weather-info">
            <div className="weather-icon-large">
              {getWeatherEmoji(current.weather[0].icon)}
            </div>
            <div className="weather-details">
              <span className="weather-label">Current Conditions</span>
              <div className="weather-value">
                <span className="temp-value">{Math.round(current.main.temp)}°C</span>
                <span className="condition-text">
                  {current.weather[0].description.charAt(0).toUpperCase() + 
                   current.weather[0].description.slice(1)}
                </span>
              </div>
              <div className="weather-meta">
                <span className="humidity">💧 {current.main.humidity}%</span>
                <span className="wind">🌬️ {Math.round(current.wind.speed)} km/h</span>
              </div>
            </div>
          </div>
          
          <div className="prayer-info">
            <div className="prayer-icon">🕐</div>
            <div className="prayer-details">
              <span className="prayer-label">Prayer Times</span>
              <div className="prayer-value">
                <span className="prayer-name">Loading...</span>
                <span className="prayer-time">Please check connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Daily Islamic Quote */}
        <div className="daily-quote interactive-card">
          <div className="quote-header">
            <span className="quote-icon">📖</span>
            <h4>Daily Reflection</h4>
            <span className={`quote-badge ${dailyQuote.category}`}>
              {dailyQuote.category === 'quran' ? 'Holy Quran' : 'Authentic Hadith'}
            </span>
          </div>
          <div className="quote-content">
            {dailyQuote.textArabic && (
              <div className="quote-arabic">
                <p>{dailyQuote.textArabic}</p>
              </div>
            )}
            <div className="quote-text">
              <p>"{dailyQuote.text}"</p>
            </div>
            <div className="quote-source">
              <span className="source-icon">✨</span>
              <cite>— {dailyQuote.source}</cite>
              <div className="source-details">{dailyQuote.sourceDetails}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format time until next prayer with proper hours and minutes
  const formatTimeUntil = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  // Weather-Prayer correlations with enhanced insights
  const getPrayerWeatherAdvice = () => {
    const temp = current.main.temp;
    const weather = current.weather[0];
    const wind = current.wind.speed;
    const humidity = current.main.humidity;
    const visibility = current.visibility ? current.visibility / 1000 : 10; // Convert to km

    const insights = [];

    // Temperature-based advice with more specific ranges
    if (temp < -10) {
      insights.push({
        icon: "🥶",
        title: "Extreme Cold Weather",
        advice: `Very cold conditions in ${cityName}. Consider combining prayers (Jam') and dress in layers for mosque visits.`,
        type: "urgent",
        priority: 3
      });
    } else if (temp < 0) {
      insights.push({
        icon: "❄️",
        title: "Freezing Conditions",
        advice: `Freezing weather in ${cityName}. Use warm prayer rugs and ensure proper heating for prayer areas.`,
        type: "warning",
        priority: 2
      });
    } else if (temp < 10) {
      insights.push({
        icon: "🧥",
        title: "Cold Weather",
        advice: `Cold conditions in ${cityName}. Wear warm clothing when going for prayers. Hot tea after prayers is recommended.`,
        type: "info",
        priority: 1
      });
    } else if (temp > 35) {
      insights.push({
        icon: "🌡️",
        title: "Very Hot Weather",
        advice: `Extremely hot in ${cityName}. Stay hydrated, seek shade, and consider praying in air-conditioned spaces.`,
        type: "urgent",
        priority: 3
      });
    } else if (temp > 28) {
      insights.push({
        icon: "☀️",
        title: "Hot Weather",
        advice: `Hot conditions in ${cityName}. Stay hydrated and consider lighter prayer clothing. Early morning prayers are more comfortable.`,
        type: "warning",
        priority: 2
      });
    } else if (temp > 20) {
      insights.push({
        icon: "🌤️",
        title: "Pleasant Weather",
        advice: `Beautiful weather in ${cityName}! Perfect conditions for outdoor prayers or mosque visits.`,
        type: "positive",
        priority: 1
      });
    }

    // Weather condition-based advice
    if (weather.main === "Rain" || weather.main === "Drizzle") {
      insights.push({
        icon: "☔",
        title: "Rainy Weather",
        advice: `Rainy conditions in ${cityName}. Bring waterproof prayer mat if praying outdoors. Remember: rain is a blessing from Allah.`,
        type: "info",
        priority: 2
      });
    } else if (weather.main === "Snow") {
      insights.push({
        icon: "❄️",
        title: "Snowy Conditions",
        advice: `Snowing in ${cityName}. Be careful of slippery surfaces when going to mosque. Beautiful creation of Allah to contemplate.`,
        type: "warning",
        priority: 2
      });
    } else if (weather.main === "Thunderstorm") {
      insights.push({
        icon: "⛈️",
        title: "Thunderstorm",
        advice: `Thunderstorm in ${cityName}. Seek shelter and remember the du'a for thunder. Perfect time for extra dhikr and prayers.`,
        type: "urgent",
        priority: 3
      });
    } else if (weather.main === "Clear") {
      insights.push({
        icon: "☀️",
        title: "Clear Sky",
        advice: `Perfect clear skies in ${cityName}. Witness Allah's beautiful creation. Excellent conditions for all prayers.`,
        type: "positive",
        priority: 1
      });
    }

    // Wind and visibility conditions
    if (wind > 20) {
      insights.push({
        icon: "💨",
        title: "Strong Winds",
        advice: `Very windy in ${cityName}. Secure loose clothing and prayer items. Be mindful during outdoor prayers.`,
        type: "warning",
        priority: 2
      });
    } else if (wind > 10) {
      insights.push({
        icon: "🌬️",
        title: "Breezy Conditions",
        advice: `Windy in ${cityName}. Pleasant breeze, but secure prayer items outdoors.`,
        type: "info",
        priority: 1
      });
    }

    // Visibility advice
    if (visibility < 1) {
      insights.push({
        icon: "🌫️",
        title: "Poor Visibility",
        advice: `Foggy conditions in ${cityName}. Drive carefully to mosque and use extra caution during travel.`,
        type: "warning",
        priority: 2
      });
    }

    // Humidity advice
    if (humidity > 80) {
      insights.push({
        icon: "💧",
        title: "High Humidity",
        advice: `Very humid in ${cityName}. Stay hydrated and consider lighter clothing for prayers.`,
        type: "info",
        priority: 1
      });
    }

    // Sort by priority and return top insights
    return insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3); // Show top 3 insights
  };

  const insights = getPrayerWeatherAdvice();

  if (insights.length === 0) {
    // Show at least basic info even if no specific insights
    return (
      <div className={`prayer-weather-insights ${theme}`}>
        {/* Header with enhanced styling */}
        <div className="insights-header">
          <div className="prayer-title">
            <h3>
              <span className="title-icon">🕌</span>
              Prayer & Weather Guidance
              <span className="location-badge">{cityName}</span>
            </h3>
          </div>
          <div className="bismillah" data-tooltip="In the name of Allah, the Most Gracious, the Most Merciful">
            ✨ Islamic wisdom meets weather wisdom • الحكمة الإسلامية
          </div>
        </div>

        {/* Enhanced Weather Summary Banner */}
        <div className="weather-summary-banner" data-weather={current.weather[0].main.toLowerCase()}>
          <div className="weather-info">
            <div className="weather-icon-large">
              {getWeatherEmoji(current.weather[0].icon)}
            </div>
            <div className="weather-details">
              <span className="weather-label">Current Conditions</span>
              <div className="weather-value">
                <span className="temp-value">{Math.round(current.main.temp)}°C</span>
                <span className="condition-text">
                  {current.weather[0].description.charAt(0).toUpperCase() + 
                   current.weather[0].description.slice(1)}
                </span>
              </div>
              <div className="weather-meta">
                <span className="humidity">💧 {current.main.humidity}%</span>
                <span className="wind">🌬️ {Math.round(current.wind.speed)} km/h</span>
              </div>
            </div>
          </div>
          
          {nextPrayer && (
            <div className="prayer-info">
              <div className="prayer-icon">🕐</div>
              <div className="prayer-details">
                <span className="prayer-label">Next Prayer</span>
                <div className="prayer-value">
                  <span className="prayer-name">{nextPrayer.name}</span>
                  <span className="prayer-time">in {formatTimeUntil(nextPrayer.timeUntil)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Daily Islamic Quote */}
        <div className="daily-quote interactive-card">
          <div className="quote-header">
            <span className="quote-icon">📖</span>
            <h4>Daily Reflection</h4>
            <span className={`quote-badge ${dailyQuote.category}`}>
              {dailyQuote.category === 'quran' ? 'Holy Quran' : 'Authentic Hadith'}
            </span>
          </div>
          <div className="quote-content">
            {dailyQuote.textArabic && (
              <div className="quote-arabic">
                <p>{dailyQuote.textArabic}</p>
              </div>
            )}
            <div className="quote-text">
              <p>"{dailyQuote.text}"</p>
            </div>
            <div className="quote-source">
              <span className="source-icon">✨</span>
              <cite>— {dailyQuote.source}</cite>
              <div className="source-details">{dailyQuote.sourceDetails}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`prayer-weather-insights ${theme}`}>
      {/* Header with enhanced styling */}
      <div className="insights-header">
        <div className="prayer-title">
          <h3>
            <span className="title-icon">🕌</span>
            Prayer & Weather Guidance
            <span className="location-badge">{cityName}</span>
          </h3>
        </div>
        <div className="bismillah" data-tooltip="In the name of Allah, the Most Gracious, the Most Merciful">
          ✨ Islamic wisdom meets weather wisdom • الحكمة الإسلامية
        </div>
      </div>

      {/* Enhanced Weather Summary Banner */}
      <div className="weather-summary-banner" data-weather={current.weather[0].main.toLowerCase()}>
        <div className="weather-info">
          <div className="weather-icon-large">
            {getWeatherEmoji(current.weather[0].icon)}
          </div>
          <div className="weather-details">
            <span className="weather-label">Current Conditions</span>
            <div className="weather-value">
              <span className="temp-value">{Math.round(current.main.temp)}°C</span>
              <span className="condition-text">
                {current.weather[0].description.charAt(0).toUpperCase() + 
                 current.weather[0].description.slice(1)}
              </span>
            </div>
            <div className="weather-meta">
              <span className="humidity">💧 {current.main.humidity}%</span>
              <span className="wind">🌬️ {Math.round(current.wind.speed)} km/h</span>
            </div>
          </div>
        </div>
        
        {nextPrayer && (
          <div className="prayer-info">
            <div className="prayer-icon">🕐</div>
            <div className="prayer-details">
              <span className="prayer-label">Next Prayer</span>
              <div className="prayer-value">
                <span className="prayer-name">{nextPrayer.name}</span>
                <span className="prayer-time">in {formatTimeUntil(nextPrayer.timeUntil)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guidance Section with Enhanced Styling */}
      <div className="guidance-section">
        {insights.map((insight, index) => (
          <div key={index} className={`guidance-item ${insight.type}`}>
            <div className="guidance-content">
              <div className="guidance-title">
                <span className="guidance-icon">{insight.icon}</span>
                {insight.title}
              </div>
              <div className="guidance-text">
                <p>{insight.advice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Daily Islamic Quote */}
      <div className="daily-quote interactive-card">
        <div className="quote-header">
          <span className="quote-icon">📖</span>
          <h4>Daily Reflection</h4>
          <span className={`quote-badge ${dailyQuote.category}`}>
            {dailyQuote.category === 'quran' ? 'Holy Quran' : 'Authentic Hadith'}
          </span>
        </div>
        <div className="quote-content">
          {dailyQuote.textArabic && (
            <div className="quote-arabic">
              <p>{dailyQuote.textArabic}</p>
            </div>
          )}
          <div className="quote-text">
            <p>"{dailyQuote.text}"</p>
          </div>
          <div className="quote-source">
            <span className="source-icon">✨</span>
            <cite>— {dailyQuote.source}</cite>
            <div className="source-details">{dailyQuote.sourceDetails}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerWeatherInsights;
