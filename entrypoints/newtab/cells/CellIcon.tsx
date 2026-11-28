import { Show, createSignal, onSettled } from 'solid-js';

import type { IconSource } from '@/types/dashboard';

import { peekIconCandidates } from '../icons/cache';
import { resolveIconCandidates } from '../icons/resolve';
import { parseWebUrl, siteRoot } from '../icons/url';

export interface CellIconProps {
    /** 没指定时：cell 有地址就按 favicon 处理，否则留空占位。 */
    icon?: IconSource;
    /** cell 的地址。favicon 来源靠它解析站点图标。 */
    url?: string;
    size?: number;
    /** 预览模式（抽屉里的图标墙）：先只画 /favicon.ico，失败了才抓 HTML。 */
    preview?: boolean;
}

/** 取不到图标、`upload` 未实现时的占位。 */
function IconPlaceholder(props: { size: number }) {
    return (
        <span
            class="block rounded-lg border border-dashed border-foreground/20"
            style={`width: ${props.size}px; height: ${props.size}px;`}
            aria-hidden="true"
        />
    );
}

/** 纯色块，占满图标槽位。 */
function SolidIcon(props: { color: string; size: number }) {
    return (
        <span
            class="block rounded-lg"
            style={`width: ${props.size}px; height: ${props.size}px; background: ${props.color};`}
            aria-hidden="true"
        />
    );
}

/**
 * 地址对应的站点图标。
 *
 * 先用缓存里最好的候选，没有就先画 `/favicon.ico`——它不需要任何权限，
 * 浏览器会自己发请求，格子不会空着。随后异步解析首页声明的图标
 * （SVG / apple-touch-icon 等比 ico 清楚得多），拿到后原地换掉。
 *
 * 图片用 `<img>` 直接渲染，不经过 canvas，所以图标在第三方 CDN 上也不需要
 * CORS；同一地址换图时浏览器会命中自己的缓存。
 */
function FaviconImage(props: { url: string; size: number; preview?: boolean }) {
    const root = () => {
        const url = parseWebUrl(props.url);
        return url ? siteRoot(url) : null;
    };

    const initial = (): string[] => {
        const origin = root();
        if (!origin) return [];

        const cached = peekIconCandidates(origin);
        if (cached?.length) return cached.map((candidate) => candidate.url);

        return [new URL('favicon.ico', origin).href];
    };

    const [srcs, setSrcs] = createSignal<string[]>(initial());
    const [index, setIndex] = createSignal(0);
    const src = () => srcs()[index()];

    // 预览模式下，只有 ico 也失败（站点把 /favicon.ico 删了）才去抓 HTML；
    // 图标墙一次几十个格子，不能每个都发一次首页请求。
    let started = false;

    const upgrade = () => {
        if (started) return;
        started = true;

        void resolveIconCandidates(props.url)
            .then((candidates) => {
                if (candidates.length === 0) {
                    setSrcs([]);
                    return;
                }

                setSrcs(candidates.map((candidate) => candidate.url));
                setIndex(0);
            })
            .catch(() => setSrcs([]));
    };

    onSettled(() => {
        if (props.preview || !root()) return;
        upgrade();
    });

    const advance = () => {
        if (index() + 1 < srcs().length) {
            setIndex(index() + 1);
            return;
        }

        if (!started) {
            upgrade();
            return;
        }

        setSrcs([]);
    };

    return (
        <Show when={src()} fallback={<IconPlaceholder size={props.size} />}>
            {(value) => (
                <img
                    src={value()}
                    alt=""
                    width={props.size}
                    height={props.size}
                    class="block rounded-lg object-contain"
                    style={`width: ${props.size}px; height: ${props.size}px;`}
                    referrerpolicy="no-referrer"
                    decoding="async"
                    loading={props.preview ? 'lazy' : 'eager'}
                    draggable={false}
                    onError={advance}
                />
            )}
        </Show>
    );
}

/**
 * cell 图标的唯一渲染点：按来源分派。
 *
 * `favicon` 现在会真的解析站点图标；`upload` 还没做，仍然渲染占位。
 */
export default function CellIcon(props: CellIconProps) {
    const size = () => props.size ?? 28;
    const source = () => props.icon ?? (props.url ? ({ kind: 'favicon' } as const) : undefined);
    const icon = source();
    const url = props.url?.trim();

    if (icon?.kind === 'solid') return <SolidIcon color={icon.color} size={size()} />;
    if (icon?.kind === 'favicon' && url) {
        return <FaviconImage url={url} size={size()} preview={props.preview} />;
    }

    return <IconPlaceholder size={size()} />;
}
