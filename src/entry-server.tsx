import { renderToString } from "react-dom/server";
import { App } from "./App";

export { pageMeta, prerendered } from "./routes";
export { api, stationPath } from "./api";

export function render(path: string): string {
  return renderToString(<App path={path} />);
}
