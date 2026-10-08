import { randomBytes } from 'node:crypto';

export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_PROJECT_BYTES = 1024 * 1024;
export const ID_PATTERN = /^_c[A-Za-z0-9_-]{11}$/;
export const newProjectId = () => `_c${randomBytes(8).toString('base64url')}`;
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const invalid = (message, status = 400) => Object.assign(new Error(message), { status });

// Pure validation/normalization. Never persist headers, account IDs or thumbnails.
export const normalizeProject = payload => {
    if (!isRecord(payload) || payload.target !== 'microbit') throw invalid('Expected a micro:bit project.');
    let files;
    try { files = typeof payload.text === 'string' ? JSON.parse(payload.text) : payload.text; }
    catch { throw invalid('Invalid project files.'); }
    if (!isRecord(files) || Object.keys(files).length > 100) throw invalid('Invalid project files.');
    const entries = Object.entries(files);
    if (entries.some(([name, text]) => typeof text !== 'string' || name.length > 200 ||
        /[\x00-\x1f\\]/.test(name) || name.startsWith('/') || name.split('/').includes('..') ||
        ['__proto__', 'constructor', 'prototype'].includes(name))) throw invalid('Invalid project file.');
    const text = Object.fromEntries(entries);
    if (typeof text['pxt.json'] !== 'string' || !entries.some(([name]) => /\.(ts|blocks|py)$/.test(name)))
        throw invalid('Project needs pxt.json and source code.');
    let config;
    try { config = JSON.parse(text['pxt.json']); }
    catch { throw invalid('Invalid pxt.json.'); }
    if (!isRecord(config) || !Array.isArray(config.files) || config.files.some(name => typeof name !== 'string'))
        throw invalid('Invalid pxt.json.');
    if (Buffer.byteLength(JSON.stringify(text)) > MAX_PROJECT_BYTES) throw invalid('Project is too large.', 413);
    const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 200) : '';
    const versions = isRecord(payload.meta?.versions) ? Object.fromEntries(
        Object.entries(payload.meta.versions).filter(([key, value]) =>
            ['target', 'pxt', 'targetId'].includes(key) && typeof value === 'string' && value.length < 100)
    ) : {};
    return Object.freeze({ name: name || 'Untitled', target: 'microbit',
        targetVersion: typeof payload.targetVersion === 'string' ? payload.targetVersion.slice(0, 100) : '',
        editor: ['blocksprj', 'tsprj', 'pyprj'].includes(payload.editor) ? payload.editor : 'blocksprj',
        text, meta: { versions } });
};

export const metadata = row => ({ id: row.id, shortid: row.id, name: row.name,
    target: row.target, targetVersion: row.targetVersion, editor: row.editor, meta: row.meta });
