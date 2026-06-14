const fs = require("fs");
const assets = fs.readdirSync("dist/client/assets");
const css = assets.find(f => f.endsWith(".css"));
const jsFiles = assets.filter(f => f.startsWith("index-") && f.endsWith(".js"));
const js = jsFiles.reduce((b, f) => fs.statSync("dist/client/assets/" + f).size > fs.statSync("dist/client/assets/" + b).size ? f : b);
const html = "<!DOCTYPE html><html><head><meta charset=UTF-8><title>Profile</title>/assets/" + css + "\"></head><body><div id=root></div><script type=module src=\"/assets/" + js + "\"></script></body></html>";
fs.writeFileSync("dist/client/index.html", html);
console.log("OK:", css, js);
