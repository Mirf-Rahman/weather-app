import React, { useEffect, useMemo, useState } from "react";
import { qiblaBearing } from "../utils/qibla";
import "../styles/qibla.css";

interface Props {
  latitude: number;
  longitude: number;
}

const QiblaCompass: React.FC<Props> = ({ latitude, longitude }) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState<boolean>(true);
  const [secure, setSecure] = useState<boolean>(true);

  const bearing = useMemo(() => qiblaBearing(latitude, longitude), [latitude, longitude]);
  const rotation = useMemo(() => {
    const h = heading ?? 0;
    return (bearing - h + 360) % 360;
  }, [bearing, heading]);

  useEffect(() => {
    setSecure(typeof window !== "undefined" ? (window as any).isSecureContext !== false : true);
    setSupported(typeof window !== "undefined" && typeof (window as any).DeviceOrientationEvent !== "undefined");

    const onOrientation = (e: any) => {
      if (typeof e.webkitCompassHeading === "number") {
        setHeading(e.webkitCompassHeading);
        return;
      }
      if (typeof e.alpha === "number") {
        const a = e.absolute ? e.alpha : 360 - e.alpha;
        setHeading((a + 360) % 360);
      }
    };

    let active = false;
    const enable = async () => {
      try {
        if (
          typeof (window as any).DeviceOrientationEvent !== "undefined" &&
          typeof (window as any).DeviceOrientationEvent.requestPermission === "function"
        ) {
          const p = await (window as any).DeviceOrientationEvent.requestPermission();
          if (p !== "granted") return;
        }
        window.addEventListener("deviceorientation", onOrientation, true);
        active = true;
        setEnabled(true);
      } catch (_) {}
    };

    if (supported) {
      // Attempt to enable automatically; on iOS this will be ignored until a user gesture.
      enable();
    }
    return () => {
      if (active) window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, []);

  const manualEnable = async () => {
    try {
      if (typeof (window as any).DeviceOrientationEvent !== "undefined" && typeof (window as any).DeviceOrientationEvent.requestPermission === "function") {
        const p = await (window as any).DeviceOrientationEvent.requestPermission();
        if (p !== "granted") return;
      }
      setEnabled(true);
    } catch (_) {}
  };

  return (
    <div className="qibla-card">
      <div className="qibla-header">
        <h4>Qibla Direction</h4>
        <div className="qibla-meta">{Math.round(bearing)}°</div>
      </div>
      <div className="qibla-compass">
        <div className="dial">
          <div className="north">N</div>
          <div className="east">E</div>
          <div className="south">S</div>
          <div className="west">W</div>
          <div className="needle" style={{ transform: `rotate(${rotation}deg)` }} />
          <div className="center-dot" />
        </div>
      </div>
      {!enabled && (
        <button className="qibla-enable" onClick={manualEnable}>Enable Compass</button>
      )}
      <div className="qibla-footer">
        {heading !== null ? (
          <span>Heading {Math.round(heading)}° • Align N with north</span>
        ) : supported ? (
          secure ? (
            <span>Waiting for heading… tap Enable on iOS</span>
          ) : (
            <span>Secure context required (use HTTPS)</span>
          )
        ) : (
          <span>Device orientation not supported</span>
        )}
      </div>
      {heading === null && (
        <div className="qibla-footer" style={{ marginTop: 4 }}>
          <span>Needle shows bearing from north (top)</span>
        </div>
      )}
    </div>
  );
};

export default QiblaCompass;
