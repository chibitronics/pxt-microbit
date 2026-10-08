// staticpkg otherwise leaves @pxtRelId@ unchanged, so the service worker keeps
// serving old editor extensions after deployment. Version the cache by content.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const indexPath = process.argv[2] ? path.resolve(process.argv[2])
    : path.join(__dirname, '..', 'built', 'packaged', 'index.html');
const directory = path.dirname(indexPath);
const worker = path.join(directory, 'serviceworker.js');
if (!fs.existsSync(worker)) process.exit(0);
const hash = crypto.createHash('sha256');
for (const file of ['main.js', 'editor.js', 'target.js', 'pxtapp.js', 'semantic.css']) {
    hash.update(file);
    hash.update(fs.readFileSync(path.join(directory, file)));
}
const release = hash.digest('hex').slice(0, 20);
fs.writeFileSync(worker, fs.readFileSync(worker, 'utf8').replace(/@pxtRelId@/g, release).replace(/;[a-f0-9]{20}(?=")/g, ';' + release));
let html = fs.readFileSync(indexPath, 'utf8')
    .replace(/\?chibiRelease=[a-f0-9]{20}/g, '')
    .replace(/<script id="chibi-version-editor-extension">[\s\S]*?<\/script>\n?/g, '');
html = html.replace(/((?:src|href)=["'])([^"']+\.(?:js|css))(["'])/g,
    (_, before, url, after) => `${before}${url}?chibiRelease=${release}${after}`);
html = html.replace(/"pxtRelId": "[^"]*"/, `"pxtRelId": "${release}"`);
if (!html.includes('chibi-version-editor-extension')) {
    const hook = `<script id="chibi-version-editor-extension">(function () {
        var load = pxt.BrowserUtils.loadScriptAsync;
        pxt.BrowserUtils.loadScriptAsync = function (url) {
            return load(url === "editor.js" ? url + "?chibiRelease=${release}" : url);
        };
    })();</script>\n`;
    html = html.replace(/(<script[^>]+src=["'][^"']*main\.js[^"']*["'][^>]*>)/, hook + '$1');
}
fs.writeFileSync(indexPath, html);
console.log(`[cache-version] ${release}`);
