import { storage } from 'wxt/utils/storage';

import type { BackgroundSource, ResolvedBackground } from '@/types/background';

import { readUpload } from './uploads';

/**
 * 背景解析：把设置里存的「来源」变成渲染层能直接用的颜色 / 图片地址。
 *
 * - 必应每日一图走 `HPImageArchive.aspx`，这是必应首页在用的接口，没有公开文档，
 *   但多年没变过；它的结果按 6 小时缓存，接口偶尔挂了就退回上一次的图。
 * - 远程图片下载一次放进 Cache Storage，离线时也能显示；同时只保留当前这张，
 *   避免换图之后旧图一直占着空间。
 */

const BING_HOST = 'https://www.bing.com';
const BING_ENDPOINT = `${BING_HOST}/HPImageArchive.aspx`;
const BING_MARKET = 'zh-CN';
/** 图片是几百 KB 到 1MB 级别，超时给宽一点。 */
const FETCH_TIMEOUT = 8000;
/** 必应每天换一次图，6 小时刷新一次足够，也不至于频繁请求。 */
const BING_TTL = 6 * 60 * 60 * 1000;
const IMAGE_CACHE = 'aaatab-background';

interface BingImage {
    startdate: string;
    url: string;
    urlbase?: string;
    title?: string;
    copyright?: string;
    copyrightlink?: string;
}

interface BingDailyCache {
    image: BingImage;
    /** 写入时间，用来判断过期。 */
    at: number;
}

const bingDaily = storage.defineItem<BingDailyCache | null>('local:bing-daily', {
    fallback: null,
    version: 1,
});

function blobUrl(blob: Blob): { url: string; dispose: () => void } {
    const url = URL.createObjectURL(blob);
    return { url, dispose: () => URL.revokeObjectURL(url) };
}

async function fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        return await fetch(url, {
            signal: controller.signal,
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
        });
    } finally {
        clearTimeout(timer);
    }
}

/** 只接受 http(s) 地址：`javascript:` / `data:` 之类不能进 CSS。 */
export function normalizeImageUrl(value: string): string | undefined {
    const text = value.trim();
    if (!text) return undefined;

    try {
        const url = new URL(text);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    } catch {
        return undefined;
    }
}

async function loadBingDaily(market: string | undefined): Promise<BingImage | undefined> {
    const cached = await bingDaily.getValue().catch(() => null);
    if (cached && Date.now() - cached.at < BING_TTL) return cached.image;

    try {
        const url = new URL(BING_ENDPOINT);
        url.searchParams.set('format', 'js');
        url.searchParams.set('idx', '0');
        url.searchParams.set('n', '1');
        url.searchParams.set('mkt', market ?? BING_MARKET);

        const response = await fetchWithTimeout(url.href);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = (await response.json()) as { images?: BingImage[] };
        const image = payload.images?.[0];
        if (!image?.url) throw new Error('接口里没有图片');

        const value: BingDailyCache = { image, at: Date.now() };
        await bingDaily.setValue(value).catch(() => {
            // 缓存写不进去不影响这一次的结果。
        });

        return image;
    } catch {
        // 接口失败、断网：用上一次缓存的图，别把背景弄没。
        return cached?.image;
    }
}

async function pruneImageCache(cache: Cache, keep: string): Promise<void> {
    const requests = await cache.keys();
    await Promise.all(
        requests.filter((request) => request.url !== keep).map((request) => cache.delete(request)),
    );
}

/**
 * 远程图片 → 本地 `blob:` 地址。第一次下载后放进 Cache Storage，之后离线也能用。
 * 下载失败就退回远程地址，让浏览器自己的 HTTP 缓存去碰运气。
 */
async function cacheImage(remote: string): Promise<ResolvedBackground> {
    if (typeof caches === 'undefined') return { url: remote };

    try {
        const cache = await caches.open(IMAGE_CACHE);
        const hit = await cache.match(remote);
        if (hit) return blobUrl(await hit.blob());

        const response = await fetchWithTimeout(remote);
        if (!response.ok) return { url: remote };

        // 地址写错时可能返回一个 HTML 页面，别把错误页当图片存下来。
        const type = response.headers.get('content-type') ?? '';
        if (!type.startsWith('image/')) return { url: remote };

        const blob = await response.blob();
        if (!blob.size) return { url: remote };

        // 只保留 content-type：把原始响应头（比如 content-encoding）一起存进去，
        // 下次从缓存读出来时会被当成"已编码"的字节，容易读出坏图。
        void cache
            .put(remote, new Response(blob))
            .then(() => pruneImageCache(cache, remote))
            .catch(() => {});

        return blobUrl(blob);
    } catch {
        return { url: remote };
    }
}

/**
 * 解析背景来源。纯色给 `color`，图片来源给 `url`（`blob:` 时附带 `dispose`），
 * 两者都没有表示"用默认背景"。
 */
export async function resolveBackground(source: BackgroundSource): Promise<ResolvedBackground> {
    switch (source.kind) {
        case 'default':
            return {};

        case 'solid':
            return { color: source.color };

        case 'upload': {
            const handle = await readUpload(source.ref).catch(() => undefined);
            return handle ? { url: handle.url, dispose: handle.dispose } : {};
        }

        case 'bing': {
            const image = await loadBingDaily(source.market);
            if (!image) return {};

            const remote = image.url.startsWith('http') ? image.url : `${BING_HOST}${image.url}`;
            return {
                ...(await cacheImage(remote)),
                ...(image.title ? { title: image.title } : {}),
                ...(image.copyright ? { copyright: image.copyright } : {}),
                ...(image.copyrightlink ? { sourceUrl: image.copyrightlink } : {}),
            };
        }

        case 'url': {
            const remote = normalizeImageUrl(source.url);
            return remote ? cacheImage(remote) : {};
        }
    }
}
