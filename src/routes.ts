import { mapUrl } from "./api";

// The site's pages. Every page but a feeder's is prerendered at its path; a feeder's page and the
// short links to the map are served from 404.html and drawn in the browser from the path.
export type Route =
  | { kind: "home" }
  | { kind: "leaderboard" }
  | { kind: "feeders" }
  | { kind: "feeder"; key: string }
  | { kind: "api" }
  | { kind: "hardware" }
  | { kind: "aircraft"; hex: string }
  | { kind: "registration"; reg: string }
  | { kind: "place"; lat: number; lon: number; zoom: number | null }
  | { kind: "missing" };

/** The single-segment paths that are pages, never a short link. */
const pages = new Set(["leaderboard", "feeders", "api", "hardware", "404"]);

export function route(path: string): Route {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "home" };
  if (parts[0] === "leaderboard" && parts.length === 1) return { kind: "leaderboard" };
  if (parts[0] === "feeders" && parts.length === 1) return { kind: "feeders" };
  if (parts[0] === "feeders" && parts.length === 2) return { kind: "feeder", key: decodeURIComponent(parts[1]) };
  if (parts[0] === "api" && parts.length === 1) return { kind: "api" };
  if (parts[0] === "hardware" && parts.length === 1) return { kind: "hardware" };
  if (parts.length === 1 && !pages.has(parts[0])) return shortLink(safeDecode(parts[0]));
  return { kind: "missing" };
}

// adsb.lol's short links: /<icao hex>, /<registration>, /<lat>,<lon>[,<zoom>].
function shortLink(segment: string): Route {
  if (/^[0-9a-f]{6}$/i.test(segment)) return { kind: "aircraft", hex: segment.toLowerCase() };
  const place = segment.match(/^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,(\d{1,2}(?:\.\d+)?))?$/);
  if (place) {
    const lat = Number(place[1]);
    const lon = Number(place[2]);
    const zoom = place[3] == null ? null : Number(place[3]);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (zoom == null || zoom <= 20)) {
      return { kind: "place", lat, lon, zoom };
    }
    return { kind: "missing" };
  }
  if (/^(?=.{3,8}$)(?=.*[A-Za-z])[A-Za-z0-9]+(-[A-Za-z0-9]+)?$/.test(segment)) {
    return { kind: "registration", reg: segment.toUpperCase() };
  }
  return { kind: "missing" };
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Where a short link goes on the full map (tar1090's query parameters), or null for a page. */
export function mapLink(page: Route): string | null {
  switch (page.kind) {
    case "aircraft":
      return `${mapUrl}/?icao=${page.hex}`;
    case "registration":
      return `${mapUrl}/?reg=${encodeURIComponent(page.reg)}`;
    case "place":
      return `${mapUrl}/?lat=${page.lat}&lon=${page.lon}${page.zoom == null ? "" : `&zoom=${page.zoom}`}`;
    default:
      return null;
  }
}

/** The prerendered pages: their path and the file each is written to. */
export const prerendered: { path: string; file: string }[] = [
  { path: "/", file: "index.html" },
  { path: "/leaderboard/", file: "leaderboard/index.html" },
  { path: "/feeders/", file: "feeders/index.html" },
  { path: "/api/", file: "api/index.html" },
  { path: "/hardware/", file: "hardware/index.html" },
  { path: "/404", file: "404.html" },
];
