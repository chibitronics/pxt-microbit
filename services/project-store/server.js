import fs from 'node:fs';
import http from 'node:http';
import { createHandler } from './handler.js';
import { createStore } from './store.js';
import { MAX_BODY_BYTES, invalid } from './project.js';

const config = JSON.parse(fs.readFileSync(process.env.PROJECT_STORE_CONFIG || '/etc/microbit-project-store/config.json', 'utf8'));
const store = createStore(config);
const handle = createHandler({ store });
const origins = new Set(config.allowedOrigins || []);
const readBody = async req => {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) throw invalid('Request is too large.', 413);
        chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw invalid('Invalid JSON.'); }
};
const server = http.createServer({ requestTimeout: 15000, headersTimeout: 10000, maxHeaderSize: 8192 }, async (req, res) => {
    const send = (status, body) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(JSON.stringify(body));
    };
    try {
        if (req.headers.origin && !origins.has(req.headers.origin)) throw invalid('Origin not allowed.', 403);
        if (req.method === 'POST' && !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
            throw invalid('Use application/json.', 415);
        const path = new URL(req.url, 'http://localhost').pathname;
        const response = await handle({ method: req.method, path, body: req.method === 'POST' ? await readBody(req) : undefined });
        send(response.status, response.body);
    } catch (error) {
        // Do not log database messages, request content or credentials.
        if (!error.status) console.error('Project store request failed.');
        send(error.status || 503, { error: error.status ? error.message : 'Save service unavailable; please try again.' });
    }
});
server.listen(config.portHTTP || 8087, '127.0.0.1');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(async () => { await store.close(); process.exit(0); }));
