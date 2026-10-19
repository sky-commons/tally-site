// Only the theme's own colours (sky, slate), not every palette Radix ships.
import "@radix-ui/themes/tokens/base.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/slate.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./site.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root")!;
const path = window.location.pathname;
// A prerendered page hydrates; a feeder's page arrives as 404.html and is drawn here from its path.
if (root.dataset.path === path) {
  hydrateRoot(root, <App path={path} />);
} else {
  root.replaceChildren();
  createRoot(root).render(<App path={path} />);
}
