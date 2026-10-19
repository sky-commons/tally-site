// The public Tally API (one operator's, today Flightlines'). Its JSON is declared in
// sky-commons/tally crates/api-types; these are the fields the site reads.
export const api = "https://tally-api.flightlines.ai";

export type Network = {
  receivers_online: number;
  messages_per_sec: number;
  aircraft: number;
  aircraft_by_source: { mlat: number };
};

export type Position = { lat: number; lon: number };

export type Station = {
  key: string;
  online: boolean;
  first_seen_at_ms: number;
  last_seen_at_ms: number;
  messages_per_sec: number;
  location: Position | null;
  software: string | null;
};

export type FeederStats = {
  window_for_ms: number;
  uptime: number;
  messages_per_sec: number;
  aircraft: number;
  range_m: number;
  coverage_km2: number;
  unique_coverage_km2: number;
  mlat_positions: number;
  area: string | null;
  standing: boolean;
  ranks: { unique_coverage: number; mlat: number; of: number } | null;
};

export type LeaderboardArea = { area: string; center: Position; ranked: number; receivers?: number };
export type Leaderboards = { window_for_ms: number; areas: LeaderboardArea[] };

export type LeaderboardEntry = {
  rank: number;
  key: string;
  unique_coverage_km2: number;
  mlat_positions: number;
};

export type Leaderboard = {
  area: string;
  center: Position;
  ranked: number;
  receivers?: number;
  by_unique_coverage: LeaderboardEntry[];
  by_mlat: LeaderboardEntry[];
  unranked?: { key: string }[];
};

/** An answer, or why there is none: `missing` is the API's 404, `failed` anything else. */
export type Answer<T> = { kind: "ok"; value: T } | { kind: "missing"; why: string } | { kind: "failed" };

export async function read<T>(path: string): Promise<Answer<T>> {
  try {
    const response = await fetch(`${api}${path}`);
    if (response.ok) return { kind: "ok", value: (await response.json()) as T };
    if (response.status === 404 || response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      return { kind: "missing", why: body.error ?? "not found" };
    }
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

/** A station key as a URL names it: base64url without padding, as the API's paths take it. */
export function urlKey(key: string): string {
  return key.trim().replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** A key short enough for a table: its first and last characters. */
export function shortKey(key: string): string {
  const k = urlKey(key);
  return k.length > 12 ? `${k.slice(0, 6)}…${k.slice(-4)}` : k;
}

/** Whether text looks like a station key (32 bytes, base64 or base64url). */
export function isKey(text: string): boolean {
  return /^[A-Za-z0-9+/_-]{43}=?$/.test(text.trim());
}

export const mlatReceivers = 3;
