// Shared FIRMS utility functions used by both the Recommendations screen
// and the useFireNotifications hook.


// A single fire / hotspot detection returned by NASA FIRMS.
// Coordinates are geographic (WGS84) latitude and longitude.
type FirePoint = {
  latitude: number;
  longitude: number;

  // Brightness temperature of the detected pixel (sensor-dependent units),
  // higher values generally indicate more intense heat.
  brightness?: number;

  // Fire Radiative Power (FRP), in megawatts (MW).
  // A proxy for fire intensity and energy output.
  frp?: number;

  // Confidence level of the detection.
  confidence?: string | number;

  // Acquisition date of the satellite observation (YYYY-MM-DD).
  acq_date?: string;

  // Acquisition time of the satellite observation (UTC, HHMM format).
  acq_time?: string;
};

// Auxiliary function
// Compute an approximate latitude/longitude bounding box around a point.
//
// This is used to query the FIRMS "area" API, which expects a rectangular
// bounding box (west, south, east, north) in decimal degrees.
export const bboxFromPoint = (lat: number, lon: number, radiusKm: number) => {
  const dLat = radiusKm / 111.32;
  const dLon = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    west: lon - dLon,
    south: lat - dLat,
    east: lon + dLon,
    north: lat + dLat,
  };
};

// Haversine distance in kilometres between two coordinates.
export const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Small CSV parser for FIRMS responses
export const parseCsv = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return []; // nothing

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, string> = {};

    headers.forEach((h, i) => (row[h] = (cols[i] ?? "").trim()));
    return row;
  });
};

// Fetch fire hotspots near a coordinate from the NASA FIRMS API
export const fetchFiresNear = async (
  lat: number,
  lon: number,
  radiusKm = 100,
  days = 3,
): Promise<FirePoint[]> => {
  // The concrete source
  // Visible Infrared Imaging Radiometer Suite: a satellite sensor that can detect thermal anomalies (heat) on Earth's surface
  // VIIRS = infrared fire detection sensor
  // SNPP  = Suomi-NPP satellite
  // NRT   = Near Real Time (≈ 3h latency)
  //
  // Returns active fire / hotspot detections (~375 m resolution),
  // not fire perimeters or smoke.
  const source = "VIIRS_SNPP_NRT";
  const MAP_KEY = process.env.EXPO_PUBLIC_FIRMS_MAP_KEY;
  if (!MAP_KEY) {
    throw new Error("Missing FIRMS key. Set EXPO_PUBLIC_FIRMS_MAP_KEY.");
  }

  const { west, south, east, north } = bboxFromPoint(lat, lon, radiusKm);
  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${MAP_KEY}/${source}/${west},${south},${east},${north}/${days}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`FIRMS error ${res.status}. ${t}`.trim());
  }

  const csv = await res.text();
  if (!csv.trim()) return [];

  // parse and match
  return parseCsv(csv)
    .map((r) => {
      const latitude = Number(r.latitude ?? (r as any).lat);
      const longitude = Number(r.longitude ?? (r as any).lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        return null;

      return {
        latitude,
        longitude,
        brightness: r.brightness ? Number(r.brightness) : undefined,
        frp: r.frp ? Number(r.frp) : undefined,
        confidence: r.confidence ?? (r as any).conf,
        acq_date: r.acq_date,
        acq_time: r.acq_time,
      } as FirePoint;
    })
    .filter((x): x is FirePoint => x !== null);
};
