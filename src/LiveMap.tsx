import { useEffect, useRef, useState } from "react";
import { Card, Flex, Text } from "@radix-ui/themes";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

// The public Tally API (one operator's, today Flightlines'). Its JSON is declared in
// sky-commons/tally crates/api-types.
const api = "https://tally-api.flightlines.ai";
// The API answers a box at most 60 degrees each way.
const maxSpan = 60;

type Aircraft = {
  hex: string;
  flight: string | null;
  lat: number;
  lon: number;
  alt_baro_ft: number | null;
  gs_kt: number | null;
  track_deg: number | null;
  on_ground: boolean;
  position_source: "adsb" | "mlat" | "adsr" | "tisb" | "other";
};

type AircraftUpdate = { full: boolean; aircraft: Aircraft[]; gone: string[] };

type Network = {
  receivers_online: number;
  messages_per_sec: number;
  aircraft: number;
  aircraft_by_source: { mlat: number };
};

export function LiveMap() {
  const container = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<Network | null>(null);

  useEffect(() => {
    let closed = false;
    const poll = async () => {
      try {
        const response = await fetch(`${api}/v1/network`);
        if (response.ok && !closed) setNetwork(await response.json());
      } catch {
        // The next poll tries again.
      }
    };
    poll();
    const timer = setInterval(poll, 15_000);
    return () => {
      closed = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let stream: EventSource | undefined;
    let restream: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const held = new Map<string, Aircraft>();

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (disposed || !container.current) return;
      const dark = document.documentElement.classList.contains("dark");
      map = new maplibre.Map({
        container: container.current,
        style: `https://tiles.openfreemap.org/styles/${dark ? "dark" : "positron"}`,
        center: [-118.3, 34.05],
        zoom: 7.4,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const draw = () => {
        const source = map?.getSource("aircraft") as GeoJSONSource | undefined;
        source?.setData({
          type: "FeatureCollection",
          features: [...held.values()].map((plane) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [plane.lon, plane.lat] },
            properties: {
              hex: plane.hex,
              label: plane.flight?.trim() || plane.hex.toUpperCase(),
              altitude: plane.on_ground ? "ground" : plane.alt_baro_ft == null ? "" : `${plane.alt_baro_ft} ft`,
              speed: plane.gs_kt == null ? "" : `${Math.round(plane.gs_kt)} kt`,
              track: plane.track_deg ?? 0,
              source: plane.position_source,
            },
          })),
        });
      };

      const listen = () => {
        if (!map) return;
        const bounds = map.getBounds();
        const box = clampBox(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
        stream?.close();
        stream = new EventSource(
          `${api}/v1/aircraft/stream?west=${box.west}&south=${box.south}&east=${box.east}&north=${box.north}`,
        );
        stream.addEventListener("aircraft", (event) => {
          const update: AircraftUpdate = JSON.parse((event as MessageEvent).data);
          if (update.full) held.clear();
          for (const plane of update.aircraft) held.set(plane.hex, plane);
          for (const hex of update.gone) held.delete(hex);
          draw();
        });
      };

      map.on("load", () => {
        if (!map) return;
        map.addImage("plane", planeIcon(), { sdf: true, pixelRatio: 2 });
        map.addSource("aircraft", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "aircraft",
          type: "symbol",
          source: "aircraft",
          layout: {
            "icon-image": "plane",
            "icon-size": 0.9,
            "icon-rotate": ["get", "track"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "text-field": ["step", ["zoom"], "", 9, ["get", "label"]],
            "text-font": ["Noto Sans Regular"],
            "text-size": 11,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: {
            "icon-color": ["match", ["get", "source"], "mlat", "#e5484d", dark ? "#7ce2fe" : "#0b6e99"],
            "icon-halo-color": dark ? "#111113" : "#ffffff",
            "icon-halo-width": 1,
            "text-color": dark ? "#edeef0" : "#1c2024",
            "text-halo-color": dark ? "#111113" : "#ffffff",
            "text-halo-width": 1.2,
          },
        });
        map.on("click", "aircraft", (event) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== "Point" || !map) return;
          const p = feature.properties as Record<string, string>;
          const body = document.createElement("div");
          body.className = "plane-popup";
          for (const line of [p.label, [p.altitude, p.speed].filter(Boolean).join(" · "), p.source.toUpperCase()]) {
            if (!line) continue;
            const row = document.createElement("div");
            row.textContent = line;
            body.append(row);
          }
          new maplibre.Popup({ closeButton: false, offset: 10 })
            .setLngLat(feature.geometry.coordinates as [number, number])
            .setDOMContent(body)
            .addTo(map);
        });
        map.on("mouseenter", "aircraft", () => map && (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "aircraft", () => map && (map.getCanvas().style.cursor = ""));
        listen();
      });
      map.on("moveend", () => {
        clearTimeout(restream);
        restream = setTimeout(listen, 400);
      });
    })();

    return () => {
      disposed = true;
      clearTimeout(restream);
      stream?.close();
      map?.remove();
    };
  }, []);

  return (
    <div className="live-map">
      <div ref={container} className="live-map-canvas" />
      <Card size="1" className="live-map-stats">
        <Flex gap="4" wrap="wrap">
          <Stat label="receivers" value={network?.receivers_online} />
          <Stat label="aircraft" value={network?.aircraft} />
          <Stat label="by MLAT" value={network?.aircraft_by_source.mlat} />
          <Stat label="msg/s" value={network && Math.round(network.messages_per_sec)} />
        </Flex>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <Flex direction="column">
      <Text size="4" weight="bold">
        {value == null ? "…" : value.toLocaleString("en-US")}
      </Text>
      <Text size="1" color="gray">
        {label}
      </Text>
    </Flex>
  );
}

// The box the API is asked for: the view, cut to at most 60 degrees each way around its centre.
function clampBox(west: number, south: number, east: number, north: number) {
  const centreLon = (west + east) / 2;
  const centreLat = (south + north) / 2;
  const halfLon = Math.min(east - west, maxSpan) / 2;
  const halfLat = Math.min(north - south, maxSpan) / 2;
  const fix = (n: number) => n.toFixed(4);
  return {
    west: fix(Math.max(-180, centreLon - halfLon)),
    east: fix(Math.min(180, centreLon + halfLon)),
    south: fix(Math.max(-85, centreLat - halfLat)),
    north: fix(Math.min(85, centreLat + halfLat)),
  };
}

// A plane pointing north, drawn once as a signed-distance image so its colour is the layer's.
function planeIcon(): ImageData {
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.scale(size / 24, size / 24);
  context.fillStyle = "#000";
  context.fill(
    new Path2D(
      "M12 2c.7 0 1.2.8 1.2 1.8v5.6l7.8 4.6v2l-7.8-2.4v4.6l2.2 1.6v1.6L12 20.4l-3.4 1v-1.6l2.2-1.6v-4.6L3 16v-2l7.8-4.6V3.8C10.8 2.8 11.3 2 12 2z",
    ),
  );
  return context.getImageData(0, 0, size, size);
}
