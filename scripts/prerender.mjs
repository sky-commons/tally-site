// Writes the page's HTML into dist/index.html, so the site reads without JavaScript and the
// client only hydrates it.
import { readFile, rm, writeFile } from "node:fs/promises";
import { render } from "../dist-server/entry-server.js";

const page = "dist/index.html";
const template = await readFile(page, "utf8");
if (!template.includes("<!--app-->")) throw new Error(`${page} has no <!--app--> placeholder`);
await writeFile(page, template.replace("<!--app-->", render()));
await rm("dist-server", { recursive: true });
