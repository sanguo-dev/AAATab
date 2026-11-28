import type { IconCandidate } from './types';

/** rel 是空格分隔的列表，所以 `rel="alternate icon"` 也算图标。 */
const ICON_RELS = new Set([
    'icon',
    'shortcut',
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'mask-icon',
]);

/**
 * 解析页面声明的图标，并按质量排序。
 *
 * 相对地址按 `<base href>`（如果有）解析，其次按重定向后的最终地址，
 * 否则 `new URL()` 会拿到扩展页自己的 origin。
 */
export function parseIconCandidates(html: string, pageUrl: string): IconCandidate[] {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    let base = pageUrl;
    const baseHref = doc.querySelector('base[href]')?.getAttribute('href');
    if (baseHref) {
        try {
            base = new URL(baseHref, pageUrl).href;
        } catch {
            // 坏掉的 <base> 不影响用页面地址兜底。
        }
    }

    const candidates: IconCandidate[] = [];
    // Array.from：NodeList 的迭代器依赖 DOM.Iterable，转数组更省心。
    for (const link of Array.from(doc.querySelectorAll('link[rel][href]'))) {
        const rels = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
        const rel = rels.find((name) => ICON_RELS.has(name));
        if (!rel) continue;

        const href = (link.getAttribute('href') ?? '').trim();
        if (!href) continue;

        let url: URL;
        try {
            url = new URL(href, base);
        } catch {
            continue;
        }

        const protocol = url.protocol;
        if (protocol !== 'http:' && protocol !== 'https:' && protocol !== 'data:') continue;

        // data: 图标偶有见到，但太长的没有必要进缓存。
        if (protocol === 'data:' && href.length > 4096) continue;

        candidates.push({
            url: url.href,
            source: 'link',
            rel,
            type: link.getAttribute('type') ?? undefined,
            size: maxSize(link.getAttribute('sizes')),
        });
    }

    return dedupe(candidates).sort((a, b) => score(b) - score(a));
}

/** `sizes="16x16 32x32"` 取最大的边长；`any`（矢量）返回 undefined。 */
function maxSize(sizes: string | null): number | undefined {
    let max: number | undefined;

    for (const part of (sizes ?? '').toLowerCase().split(/\s+/)) {
        const match = /^(\d+)x(\d+)$/.exec(part);
        if (!match) continue;

        const side = Math.max(Number(match[1]), Number(match[2]));
        max = Math.max(max ?? 0, side);
    }

    return max;
}

/**
 * 排序权重：SVG 最好；其次是声明的尺寸（越大越清晰）；
 * 没写尺寸时按惯例估：apple-touch-icon 一般 180，其它多半 32。
 * mask-icon 是单色蒙版，只有别的都没有时才轮得到它。
 */
function score(candidate: IconCandidate): number {
    if (candidate.rel === 'mask-icon') return 1;

    // 不少站点的 <link rel="icon"> 不写 type，只能从扩展名认 SVG。
    const isSvg =
        candidate.type === 'image/svg+xml' || /\.svg(?:[?#]|$)/i.test(candidate.url);
    if (isSvg) return 1000;

    const fallback = candidate.rel?.startsWith('apple-touch-icon') ? 180 : 32;
    return candidate.size ?? fallback;
}

/** 同一个地址可能被声明多次（不同 sizes），保留信息更全的那条。 */
export function dedupe(candidates: IconCandidate[]): IconCandidate[] {
    const byUrl = new Map<string, IconCandidate>();

    for (const candidate of candidates) {
        const existing = byUrl.get(candidate.url);
        if (!existing || score(candidate) > score(existing)) byUrl.set(candidate.url, candidate);
    }

    return [...byUrl.values()];
}
