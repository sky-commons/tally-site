import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { Position } from "./api";

/** Where a station is and how far it hears: its location, and a circle of its range. */
export function StationMap({ at, rangeM }: { at: Position; rangeM: number | null }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let disposed = false;
    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (disposed || !container.current) return;
      const dark = document.documentElement.classList.contains("dark");
      const ring = rangeM ? circle(at, rangeM) : null;
      map = new maplibre.Map({
        container: container.current,
        style: `https://tiles.openfreemap.org/styles/${dark ? "dark" : "positron"}`,
        center: [at.lon, at.lat],
        zoom: 8,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      if (ring) {
        const lons = ring.map(([lon]) => lon);
        const lats = ring.map(([, lat]) => lat);
        map.fitBounds(
          [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)],
          ],
          { padding: 24, animate: false },
        );
      }
      map.on("load", () => {
        if (!map) return;
        // Credits start folded, so they never cover the map on a phone.
        map.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
        const accent = dark ? "#7ce2fe" : "#0b6e99";
        if (ring) {
          map.addSource("range", {
            type: "geojson",
            data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } },
          });
          map.addLayer({ id: "range-fill", type: "fill", source: "range", paint: { "fill-color": accent, "fill-opacity": 0.12 } });
          map.addLayer({ id: "range-line", type: "line", source: "range", paint: { "line-color": accent, "line-width": 1.5 } });
        }
        map.addSource("station", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [at.lon, at.lat] } },
        });
        map.addLayer({
          id: "station",
          type: "circle",
          source: "station",
          paint: { "circle-radius": 6, "circle-color": accent, "circle-stroke-color": dark ? "#111113" : "#ffffff", "circle-stroke-width": 2 },
        });
      });
    })();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [at.lat, at.lon, rangeM]);

  return (
    <div className="station-map">
      <div ref={container} className="map-canvas" />
    </div>
  );
}

// A circle of `radiusM` metres around `at`, as a ring of [lon, lat], on a sphere.
function circle(at: Position, radiusM: number): [number, number][] {
  const earth = 6_371_008.8;
  const angular = radiusM / earth;
  const lat1 = (at.lat * Math.PI) / 180;
  const lon1 = (at.lon * Math.PI) / 180;
  const ring: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const bearing = (i / 64) * 2 * Math.PI;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing));
    const lon2 =
      lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1), Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2));
    ring.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  return ring;
}
