import { renderToString } from "react-dom/server";
import { App } from "./App";

export { pageMeta, prerendered } from "./routes";
export { api, urlKey } from "./api";

export function render(path: string): string {
  return renderToString(<App path={path} />);
}
