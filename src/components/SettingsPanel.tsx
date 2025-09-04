import React, { useState, useEffect } from "react";
import { alertsManager, AlertRule } from "../utils/alerts";
import { weatherDB } from "../utils/database";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  units: "metric" | "imperial";
  onUnitsChange: (units: "metric" | "imperial") => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  timeFormat: "12h" | "24h";
  onTimeFormatChange: (format: "12h" | "24h") => void;
}

export const SettingsPanel: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  units,
  onUnitsChange,
  theme,
  onThemeChange,
  timeFormat,
  onTimeFormatChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    "general" | "alerts" | "data" | "about"
  >("general");
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    type: "temperature",
    condition: "above",
    threshold: 30,
    enabled: true,
    locations: ["*"],
    notifyTypes: ["browser"],
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [dataRetention, setDataRetention] = useState(7);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const [
        storedAutoRefresh,
        storedRefreshInterval,
        storedDataRetention,
        storedAnimations,
        rules,
      ] = await Promise.all([
        weatherDB.getPreference("autoRefresh"),
        weatherDB.getPreference("refreshInterval"),
        weatherDB.getPreference("dataRetention"),
        weatherDB.getPreference("animationsEnabled"),
        Promise.resolve(alertsManager.getRules()),
      ]);

      setAutoRefresh(storedAutoRefresh ?? true);
      setRefreshInterval(storedRefreshInterval ?? 10);
      setDataRetention(storedDataRetention ?? 7);
      setAnimationsEnabled(storedAnimations ?? true);
      setAlertRules(rules);
      setSoundEnabled(alertsManager.isSoundEnabled());
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const savePreference = async (key: string, value: any) => {
    try {
      await weatherDB.savePreference(key, value);
    } catch (error) {
      console.error(`Failed to save preference ${key}:`, error);
    }
  };

  const handleAutoRefreshChange = (enabled: boolean) => {
    setAutoRefresh(enabled);
    savePreference("autoRefresh", enabled);
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    savePreference("refreshInterval", interval);
  };

  const handleDataRetentionChange = (days: number) => {
    setDataRetention(days);
    savePreference("dataRetention", days);
  };

  const handleAnimationsChange = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    savePreference("animationsEnabled", enabled);
    document.body.classList.toggle("no-animations", !enabled);
  };

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
    alertsManager.setSoundEnabled(enabled);
  };

  const addAlertRule = () => {
    if (newRule.type && newRule.condition && newRule.threshold !== undefined) {
      const ruleId = alertsManager.addRule(newRule as Omit<AlertRule, "id">);
      setAlertRules(alertsManager.getRules());
      setNewRule({
        type: "temperature",
        condition: "above",
        threshold: 30,
        enabled: true,
        locations: ["*"],
        notifyTypes: ["browser"],
      });
    }
  };

  const toggleAlertRule = (id: string) => {
    const rule = alertRules.find((r) => r.id === id);
    if (rule) {
      alertsManager.updateRule(id, { enabled: !rule.enabled });
      setAlertRules(alertsManager.getRules());
    }
  };

  const deleteAlertRule = (id: string) => {
    alertsManager.removeRule(id);
    setAlertRules(alertsManager.getRules());
  };

  const clearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all stored data? This cannot be undone."
      )
    ) {
      try {
        localStorage.clear();
        await weatherDB.clearOldCache(0); // Clear all
        alert("All data has been cleared.");
        onClose();
      } catch (error) {
        alert("Failed to clear data.");
      }
    }
  };

  const exportSettings = () => {
    const settings = {
      units,
      theme,
      timeFormat,
      autoRefresh,
      refreshInterval,
      dataRetention,
      animationsEnabled,
      soundEnabled,
      alertRules,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weather-app-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        // Apply imported settings
        if (settings.units) onUnitsChange(settings.units);
        if (settings.theme) onThemeChange(settings.theme);
        if (settings.timeFormat) onTimeFormatChange(settings.timeFormat);
        if (settings.autoRefresh !== undefined)
          handleAutoRefreshChange(settings.autoRefresh);
        if (settings.refreshInterval)
          handleRefreshIntervalChange(settings.refreshInterval);
        if (settings.dataRetention)
          handleDataRetentionChange(settings.dataRetention);
        if (settings.animationsEnabled !== undefined)
          handleAnimationsChange(settings.animationsEnabled);
        if (settings.soundEnabled !== undefined)
          handleSoundChange(settings.soundEnabled);

        alert("Settings imported successfully!");
        loadSettings();
      } catch (error) {
        alert("Failed to import settings. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-tabs">
          {(["general", "alerts", "data", "about"] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "general" && "🔧 General"}
              {tab === "alerts" && "🚨 Alerts"}
              {tab === "data" && "💾 Data"}
              {tab === "about" && "ℹ️ About"}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === "general" && (
            <div className="general-settings">
              <div className="setting-group">
                <h3>Display</h3>

                <div className="setting-item">
                  <label>Units</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        checked={units === "metric"}
                        onChange={() => onUnitsChange("metric")}
                      />
                      Metric (°C, m/s)
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={units === "imperial"}
                        onChange={() => onUnitsChange("imperial")}
                      />
                      Imperial (°F, mph)
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Theme</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        checked={theme === "light"}
                        onChange={() => onThemeChange("light")}
                      />
                      Light
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={theme === "dark"}
                        onChange={() => onThemeChange("dark")}
                      />
                      Dark
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Time Format</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        checked={timeFormat === "12h"}
                        onChange={() => onTimeFormatChange("12h")}
                      />
                      12 Hour
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={timeFormat === "24h"}
                        onChange={() => onTimeFormatChange("24h")}
                      />
                      24 Hour
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={animationsEnabled}
                      onChange={(e) => handleAnimationsChange(e.target.checked)}
                    />
                    Enable animations
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Data Refresh</h3>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) =>
                        handleAutoRefreshChange(e.target.checked)
                      }
                    />
                    Auto-refresh weather data
                  </label>
                </div>

                {autoRefresh && (
                  <div className="setting-item">
                    <label>Refresh Interval</label>
                    <select
                      value={refreshInterval}
                      onChange={(e) =>
                        handleRefreshIntervalChange(Number(e.target.value))
                      }
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="alerts-settings">
              <div className="setting-group">
                <h3>Notification Settings</h3>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => handleSoundChange(e.target.checked)}
                    />
                    Enable notification sounds
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Alert Rules</h3>

                <div className="new-rule-form">
                  <div className="form-row">
                    <select
                      value={newRule.type}
                      onChange={(e) =>
                        setNewRule((prev) => ({
                          ...prev,
                          type: e.target.value as any,
                        }))
                      }
                    >
                      <option value="temperature">Temperature</option>
                      <option value="humidity">Humidity</option>
                      <option value="wind">Wind Speed</option>
                      <option value="rain">Rainfall</option>
                    </select>

                    <select
                      value={newRule.condition}
                      onChange={(e) =>
                        setNewRule((prev) => ({
                          ...prev,
                          condition: e.target.value as any,
                        }))
                      }
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                      <option value="equals">Equals</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Threshold"
                      value={newRule.threshold || ""}
                      onChange={(e) =>
                        setNewRule((prev) => ({
                          ...prev,
                          threshold: Number(e.target.value),
                        }))
                      }
                    />

                    <button onClick={addAlertRule}>Add Rule</button>
                  </div>
                </div>

                <div className="rules-list">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="rule-item">
                      <div className="rule-info">
                        <span className="rule-description">
                          {rule.type} {rule.condition} {rule.threshold}
                        </span>
                        <span className="rule-locations">
                          {rule.locations.includes("*")
                            ? "All locations"
                            : rule.locations.join(", ")}
                        </span>
                      </div>
                      <div className="rule-actions">
                        <button
                          className={`toggle-btn ${
                            rule.enabled ? "enabled" : "disabled"
                          }`}
                          onClick={() => toggleAlertRule(rule.id)}
                        >
                          {rule.enabled ? "🔔" : "🔕"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteAlertRule(rule.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="data-settings">
              <div className="setting-group">
                <h3>Data Management</h3>

                <div className="setting-item">
                  <label>Data Retention</label>
                  <select
                    value={dataRetention}
                    onChange={(e) =>
                      handleDataRetentionChange(Number(e.target.value))
                    }
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>1 week</option>
                    <option value={14}>2 weeks</option>
                    <option value={30}>1 month</option>
                  </select>
                  <small>How long to keep cached weather data</small>
                </div>
              </div>

              <div className="setting-group">
                <h3>Import/Export</h3>

                <div className="data-actions">
                  <button className="export-btn" onClick={exportSettings}>
                    📤 Export Settings
                  </button>

                  <label className="import-btn">
                    📥 Import Settings
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={importSettings}
                    />
                  </label>
                </div>
              </div>

              <div className="setting-group danger-zone">
                <h3>Danger Zone</h3>
                <button className="danger-btn" onClick={clearAllData}>
                  🗑️ Clear All Data
                </button>
                <small>
                  This will delete all cached weather data, location history,
                  and settings
                </small>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="about-settings">
              <div className="app-info">
                <h3>Weather App</h3>
                <p>Version 1.0.0</p>
                <p>
                  A modern, feature-rich weather application built with React
                  and TypeScript.
                </p>
              </div>

              <div className="features-list">
                <h4>Features</h4>
                <ul>
                  <li>✅ Real-time weather data</li>
                  <li>✅ 5-day forecasts</li>
                  <li>✅ Location history & favorites</li>
                  <li>✅ Weather alerts & notifications</li>
                  <li>✅ Detailed analytics</li>
                  <li>✅ Offline support</li>
                  <li>✅ Dark/Light themes</li>
                  <li>✅ Data export/import</li>
                </ul>
              </div>

              <div className="credits">
                <h4>Data Sources</h4>
                <p>Weather data provided by OpenWeatherMap API</p>
                <p>Icons from OpenWeatherMap</p>
              </div>

              <div className="tech-stack">
                <h4>Technology Stack</h4>
                <ul>
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Vite</li>
                  <li>IndexedDB</li>
                  <li>Web APIs (Notifications, Geolocation)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
