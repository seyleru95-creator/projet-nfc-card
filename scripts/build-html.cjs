const fs = require('fs');
const assets = fs.readdirSync('dist/client/assets');
const css = assets.find(f => f.endsWith('.css'));
const js = assets.find(f => f.startsWith('index-') && f.endsWith('.js') && f.includes('BtlMrHY'));

const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Profile</title>
    /assets/${css}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${js}"></script>
  </body>
</html>`;

fs.writeFileSync('dist/client/index.html', html);
console.log('index.html généré avec', css, js);