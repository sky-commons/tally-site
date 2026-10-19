// Only the theme's own colours (sky, slate), not every palette Radix ships.
import "@radix-ui/themes/tokens/base.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/slate.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./site.css";
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

hydrateRoot(document.getElementById("root")!, <App />);
