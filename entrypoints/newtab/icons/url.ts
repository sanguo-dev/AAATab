/** 有 scheme 就按原样解析，否则补 `https://`（抽屉里的地址可能只写了 github.com）。 */
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

export function parseWebUrl(raw: string): URL | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    try {
        const url = new URL(SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}

/**
 * 站点根地址（带结尾斜杠）。
 *
 * 图标是挂在站点上的，深链接（`github.com/foo/bar`）对取图标没有意义，
 * 而且更容易被重定向/404 挡回来。
 */
export function siteRoot(url: URL): string {
    return `${url.origin}/`;
}
