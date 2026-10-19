// The site's pages. Every page but a feeder's is prerendered at its path; a feeder's page is
// served from 404.html and drawn in the browser from the path.
export type Route =
  | { kind: "home" }
  | { kind: "leaderboard" }
  | { kind: "feeders" }
  | { kind: "feeder"; key: string }
  | { kind: "missing" };

export function route(path: string): Route {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "home" };
  if (parts[0] === "leaderboard" && parts.length === 1) return { kind: "leaderboard" };
  if (parts[0] === "feeders" && parts.length === 1) return { kind: "feeders" };
  if (parts[0] === "feeders" && parts.length === 2) return { kind: "feeder", key: decodeURIComponent(parts[1]) };
  return { kind: "missing" };
}

/** The prerendered pages: their path and the file each is written to. */
export const prerendered: { path: string; file: string }[] = [
  { path: "/", file: "index.html" },
  { path: "/leaderboard/", file: "leaderboard/index.html" },
  { path: "/feeders/", file: "feeders/index.html" },
  { path: "/404", file: "404.html" },
];
