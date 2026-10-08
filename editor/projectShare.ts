// Adapter for our snapshot service. Leave Microsoft's package, compiler and
// legacy shared-project endpoints alone: only _c-prefixed projects are ours.
const isSavedProjectId = (id: string): boolean => /^_c[A-Za-z0-9_-]{11}$/.test(id);
const savedIdFromUrl = (value: string): string => {
    const match = /(?:#pub:|\/)(_c[A-Za-z0-9_-]{11})(?:[?&#].*)?$/.exec(value || '');
    return isSavedProjectId(value) ? value : match ? match[1] : undefined;
};

export function configureProjectShare(opts: pxt.editor.ExtensionOptions): void {
    const base = pxt.webConfig && pxt.webConfig.relprefix || '/';
    const apiBase = base + 'api/share/';
    const request = async (path: string, data?: any): Promise<any> => {
        const response = await fetch(apiBase + path, {
            method: data === undefined ? 'GET' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data === undefined ? undefined : JSON.stringify(data),
            credentials: 'same-origin', cache: 'no-store'
        });
        const result = await response.json();
        if (!response.ok) throw Object.assign(new Error(result.error || 'Unable to save project.'),
            { statusCode: response.status });
        return result;
    };
    const originalPost = pxt.Cloud.privatePostAsync;
    const originalGet = pxt.Cloud.privateGetAsync;
    const originalFiles = pxt.Cloud.downloadScriptFilesAsync;
    const originalMeta = pxt.Cloud.downloadScriptMetaAsync;
    const originalParse = pxt.Cloud.parseScriptId;
    pxt.Cloud.privatePostAsync = (path: string, data: any, live?: boolean) =>
        path === 'scripts' ? request('scripts', data) : originalPost(path, data, live);
    pxt.Cloud.privateGetAsync = (path: string, live?: boolean) =>
        isSavedProjectId(path) ? request(path) : originalGet(path, live);
    pxt.Cloud.downloadScriptFilesAsync = (id: string) =>
        isSavedProjectId(id) ? request(id + '/text') : originalFiles(id);
    pxt.Cloud.downloadScriptMetaAsync = (id: string) =>
        isSavedProjectId(id) ? request(id).then(result => result.meta) : originalMeta(id);
    pxt.Cloud.parseScriptId = (value: string) => savedIdFromUrl(value) || originalParse(value);

    // Keep the familiar Share dialog, but return a link to this editor instead
    // of Microsoft's editor. Hash links work on S3 without server-side routes.
    const view = opts.projectView as any;
    const originalShareUrl = view.getShareUrl.bind(view);
    view.getShareUrl = (id: string, persistent: boolean) => {
        if (!isSavedProjectId(id)) return originalShareUrl(id, persistent);
        // Existing browsers may retain pre-save-feature HTML by heuristic caching.
        // Version navigation too, not just scripts, so shared links load this release.
        const release = pxt.webConfig && (pxt.webConfig as any).pxtRelId || 'saved-projects';
        const page = window.location.origin + base + '?v=' + encodeURIComponent(release);
        const url = page + '#pub:' + id;
        return Promise.resolve({ url, embed: { url,
            editor: '<iframe src="' + page + '&embed=1#pub:' + id + '" width="100%" height="600" frameborder="0"></iframe>' } });
    };
    const originalPublish = view.publishAsync.bind(view);
    // Snapshot saving requires no account and must never try Microsoft's
    // authenticated permalink service, even if someone previously signed in.
    view.publishAsync = (name: string, screenshot: string) => originalPublish(name, screenshot, true);
}
