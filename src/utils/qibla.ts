export function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function toDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export function normalizeBearing(b: number): number {
  return (b + 360) % 360;
}

export function qiblaBearing(lat: number, lon: number): number {
  const kaabaLat = toRad(21.4225);
  const kaabaLon = toRad(39.8262);
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const Δλ = kaabaLon - λ1;
  const y = Math.sin(Δλ) * Math.cos(kaabaLat);
  const x = Math.cos(φ1) * Math.sin(kaabaLat) - Math.sin(φ1) * Math.cos(kaabaLat) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return normalizeBearing(toDeg(θ));
}

