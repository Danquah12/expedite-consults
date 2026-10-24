import { readFileSync, writeFileSync } from "node:fs";

const file = ".vercel/output/config.json";
const config = JSON.parse(readFileSync(file, "utf8"));
const routes = Array.isArray(config.routes) ? config.routes : [];
const miss = {
  src: "/assets/(.*)",
  status: 404,
  headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" },
};
const next = [];
let placed = false;
for (const route of routes) {
  if (route?.src === "/(.*)" && route?.dest === "/__server" && !placed) {
    next.push(miss);
    placed = true;
  }
  next.push(route);
}
if (!placed) next.push(miss);
config.routes = next;
writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
console.log("[vercel] missing /assets files now 404 with no-store");
