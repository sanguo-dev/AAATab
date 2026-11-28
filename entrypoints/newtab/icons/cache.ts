import { storage } from 'wxt/utils/storage';

import type { IconCandidate } from './types';

interface IconCacheEntry {
    /** 写入时间，用来判断过期。 */
    at: number;
    candidates: IconCandidate[];
    /** 没解析出页面声明的图标（只有 /favicon.ico），过期更快。 */
    weak?: boolean;
}

/**
 * 只缓存候选地址，不缓存图片本身——图片交给浏览器的 HTTP 缓存。
 * 解析结果过期后就重新抓一次 HTML，避免站点换图标后一直用旧的。
 */
const TTL = 7 * 24 * 60 * 60 * 1000;
const WEAK_TTL = 60 * 60 * 1000;

const cacheItem = storage.defineItem<Record<string, IconCacheEntry>>(
    'local:icon-candidates',
    { fallback: {}, version: 1 },
);

let entries: Record<string, IconCacheEntry> | null = null;
let loading: Promise<void> | null = null;

/** 存储只读一次，之后都走内存；读写失败也不影响出图标。 */
async function load() {
    if (entries) return;

    loading ??= cacheItem
        .getValue()
        .then((value) => {
            entries = { ...value };
        })
        .catch(() => {
            entries = {};
        });
    await loading;
    loading = null;
}

/** 同步读，给首屏用：缓存还没加载完就返回 undefined，调用方自己给个临时图标。 */
export function peekIconCandidates(origin: string): IconCandidate[] | undefined {
    const entry = entries?.[origin];
    if (!entry) return undefined;

    const ttl = entry.weak ? WEAK_TTL : TTL;
    if (Date.now() - entry.at > ttl) return undefined;

    return entry.candidates;
}

export async function readIconCandidates(origin: string): Promise<IconCandidate[] | undefined> {
    await load();
    return peekIconCandidates(origin);
}

export async function writeIconCandidates(
    origin: string,
    candidates: IconCandidate[],
    weak: boolean,
): Promise<void> {
    await load();
    entries = { ...(entries ?? {}), [origin]: { at: Date.now(), candidates, weak } };
    await cacheItem.setValue(entries);
}
