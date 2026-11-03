// Writes each prerendered page's HTML from dist/index.html, so the pages read without JavaScript
// and the client only hydrates them. The root names the path it was rendered for, so the client
// knows when to draw instead (404.html, which serves the short links and any station newer than
// this build). Each page carries its own title, description and link-preview tags.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { api, pageMeta, prerendered, render, urlKey } from "../dist-server/entry-server.js";

const site = "https://tally.skycommons.org";
// The map's card (packaging/map in sky-commons/tally): a raster picture, which previews need.
const card = "https://tally-map.skycommons.org/card.jpg";

const template = await readFile("dist/index.html", "utf8");
const slot = '<div id="root"><!--app--></div>';
const head = /<!--head-->[\s\S]*?<!--\/head-->/;
if (!template.includes(slot)) throw new Error(`dist/index.html has no ${slot}`);
if (!head.test(template)) throw new Error("dist/index.html has no <!--head--> block");

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tags(path) {
  const { title, description } = pageMeta(path);
  const url = site + (path === "/404" ? "/" : path);
  return [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Tally" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${escape(url)}" />`,
    `<meta property="og:image" content="${card}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
}

// Every station the API names now (each area's ranked and unranked), so its page answers 200.
// A build without the API still succeeds: those pages are drawn from 404.html instead.
async function stations() {
  try {
    const list = await (await fetch(`${api}/v1/leaderboards`)).json();
    const keys = new Set();
    for (const area of list.areas ?? []) {
      const board = await (await fetch(`${api}/v1/leaderboards/${area.area}`)).json();
      for (const entry of [...(board.by_unique_coverage ?? []), ...(board.unranked ?? [])]) keys.add(urlKey(entry.key));
    }
    return [...keys].map((key) => ({ path: `/feeders/${key}/`, file: `feeders/${key}/index.html` }));
  } catch (error) {
    console.warn(`prerender: no station pages (${error})`);
    return [];
  }
}

const pages = [...prerendered, ...(await stations())];
for (const { path, file } of pages) {
  const html = template
    .replace(head, tags(path))
    .replace(slot, `<div id="root" data-path="${path}">${render(path)}</div>`);
  await mkdir(dirname(`dist/${file}`), { recursive: true });
  await writeFile(`dist/${file}`, html);
}
console.log(`prerender: ${pages.length} pages`);
await rm("dist-server", { recursive: true });
