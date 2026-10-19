// Writes each prerendered page's HTML from dist/index.html, so the pages read without JavaScript
// and the client only hydrates them. The root names the path it was rendered for, so the client
// knows when to draw instead (404.html, which serves every feeder's page).
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { prerendered, render } from "../dist-server/entry-server.js";

const template = await readFile("dist/index.html", "utf8");
const slot = '<div id="root"><!--app--></div>';
if (!template.includes(slot)) throw new Error(`dist/index.html has no ${slot}`);
for (const { path, file } of prerendered) {
  const html = template.replace(slot, `<div id="root" data-path="${path}">${render(path)}</div>`);
  await mkdir(dirname(`dist/${file}`), { recursive: true });
  await writeFile(`dist/${file}`, html);
}
await rm("dist-server", { recursive: true });
