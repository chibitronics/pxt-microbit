import { ID_PATTERN, metadata, newProjectId, normalizeProject } from './project.js';

// Async IO is supplied by the caller; routing and response construction stay pure.
export const createHandler = ({ store, createId = newProjectId }) => async ({ method, path, body }) => {
    if (method === 'GET' && path === '/health') {
        await store.health();
        return { status: 200, body: { ok: true } };
    }
    if (method === 'POST' && path === '/scripts') {
        const project = normalizeProject(body);
        const saved = Object.freeze({ ...project, id: createId() });
        await store.insert(saved);
        return { status: 201, body: metadata(saved) };
    }
    const match = /^\/([^/]+)(\/text)?$/.exec(path);
    if (method === 'GET' && match && ID_PATTERN.test(match[1])) {
        const saved = await store.find(match[1]);
        return saved ? { status: 200, body: match[2] ? saved.text : metadata(saved) }
            : { status: 404, body: { error: 'Saved project not found.' } };
    }
    return { status: 404, body: { error: 'Not found.' } };
};
