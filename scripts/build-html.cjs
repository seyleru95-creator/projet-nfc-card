const fs = require("fs");
const assets = fs.readdirSync("dist/client/assets");
const css = assets.find((f) => f.endsWith(".css"));
const jsFiles = assets.filter((f) => f.startsWith("index-") && f.endsWith(".js"));
const js = jsFiles.reduce((biggest, f) => {
  const sizeA = fs.statSync(`dist/client/assets/${biggest}`).size;
  const sizeB = fs.statSync(`dist/client/assets/${f}`).size;
  return sizeB > sizeA ? f : biggest;
});

const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Profile</title>
    <link rel="stylesheet" href="/assets/${css}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${js}"></script>
  </body>
</html>`;

fs.writeFileSync("dist/client/index.html", html, "utf8");
console.log("index.html généré avec", css, js);