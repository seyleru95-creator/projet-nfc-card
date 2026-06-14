const fs = require('fs');
const assets = fs.readdirSync('dist/client/assets');
const css = assets.find(f => f.endsWith('.css'));
const jsFiles = assets.filter(f => f.startsWith('index-') && f.endsWith('.js'));
const js = jsFiles.reduce((biggest, f) => {
  const sizeA = fs.statSync('dist/client/assets/' + biggest).size;
  const sizeB = fs.statSync('dist/client/assets/' + f).size;
  return sizeB > sizeA ? f : biggest;
});

const linkTag = '/assets/' + css + '" />';
const scriptTag = '<script type="module" src="/assets/' + js + '"><\/script>';

const html = '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Profile</title>\n    ' + linkTag + '\n  </head>\n  <body>\n    <div id="root"></div>\n    ' + scriptTag + '\n  </body>\n</html>';

fs.writeFileSync('dist/client/index.html', html);
console.log('index.html généré avec', css, js);