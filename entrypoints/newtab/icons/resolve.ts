import { readIconCandidates, writeIconCandidates } from './cache';
import { dedupe, parseIconCandidates } from './parse';
import type { IconCandidate } from './types';
import { parseWebUrl, siteRoot } from './url';

/** 图标都在 `<head>` 里，读到这里就够；这个上限用来兜住超大页面。 */
const HTML_LIMIT = 512 * 1024;
const FETCH_TIMEOUT = 6000;
/** 新标签页可能一次挂十几个 cell，限制同时抓取的站点数。 */
const MAX_CONCURRENT = 4;
const MAX_CANDIDATES = 6;

/**
 * 给一个页面地址，返回按质量排好序的图标候选。
 *
 * 先看缓存；没有就抓一次首页 HTML 解析 `<link rel="icon">`，再兜底
 * `/favicon.ico`。同一 origin 的请求会合并，重复的 cell 只抓一次。
 */
export function resolveIconCandidates(pageUrl: string): Promise<IconCandidate[]> {
    const url = parseWebUrl(pageUrl);
    if (!url) return Promise.resolve([]);

    const root = siteRoot(url);
    const pending = inflight.get(root);
    if (pending) return pending;

    const task = withSlot(() => resolve(root)).finally(() => inflight.delete(root));
    inflight.set(root, task);
    return task;
}

const inflight = new Map<string, Promise<IconCandidate[]>>();

async function resolve(root: string): Promise<IconCandidate[]> {
    const cached = await readIconCandidates(root);
    if (cached) return cached;

    let links: IconCandidate[] = [];
    try {
        const page = await fetchPageHtml(root);
        // 页面没拿到（断网 / 站点拒绝）时 links 为空，只能靠 /favicon.ico。
        if (page) links = parseIconCandidates(page.html, page.url);
    } catch {
        // 同上：任何失败都退到 /favicon.ico，不让图标拖垮格子。
    }

    const candidates = dedupe([
        ...links,
        { url: new URL('favicon.ico', root).href, source: 'ico' },
    ]).slice(0, MAX_CANDIDATES);

    try {
        // 没解析出声明的图标时缓存时间短一些，站点临时 403 之后还能重试。
        await writeIconCandidates(root, candidates, links.length === 0);
    } catch {
        // 缓存写不进去不影响这一次的结果。
    }

    return candidates;
}

async function fetchPageHtml(root: string): Promise<{ html: string; url: string } | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(root, {
            signal: controller.signal,
            credentials: 'omit',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            headers: { Accept: 'text/html,application/xhtml+xml' },
        });

        if (!response.ok) return null;

        // 被 WAF 挡回来的挑战页、JSON 接口都没有 link 可解析，直接放弃。
        const type = response.headers.get('content-type') ?? '';
        if (/image\/|json|pdf|octet-stream/i.test(type)) return null;

        const html = await readCapped(response, HTML_LIMIT);
        return { html, url: response.url || root };
    } finally {
        clearTimeout(timer);
    }
}

async function readCapped(response: Response, limit: number): Promise<string> {
    if (!response.body) return response.text();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    let bytes = 0;

    try {
        while (bytes < limit) {
            const { done, value } = await reader.read();
            if (done) break;

            bytes += value.byteLength;
            html += decoder.decode(value, { stream: true });

            if (html.includes('</head>')) break;
        }
    } finally {
        void reader.cancel().catch(() => {});
    }

    return html + decoder.decode();
}

let active = 0;
const waiting: (() => void)[] = [];

/** 很小的并发闸门：同时最多抓 MAX_CONCURRENT 个站点的 HTML。 */
async function withSlot<T>(task: () => Promise<T>): Promise<T> {
    // 被唤醒后要重新检查：可能刚有别的调用者先占了这个空位。
    while (active >= MAX_CONCURRENT) {
        await new Promise<void>((resolve) => waiting.push(resolve));
    }

    active += 1;

    try {
        return await task();
    } finally {
        active -= 1;
        waiting.shift()?.();
    }
}
