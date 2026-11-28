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

/** 浅色底用深色字，深色底用白字。 */
export function readableTextColor(color: string): string {
    const match = /^#?([0-9a-f]{6})$/i.exec(color.trim());
    const hex = match?.[1];
    if (!hex) return '#ffffff';

    const value = Number.parseInt(hex, 16);
    const r = (value >> 16) & 0xff;
    const g = (value >> 8) & 0xff;
    const b = value & 0xff;

    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.62 ? '#0b1119' : '#ffffff';
}

/** 纯色块，占满图标槽位；带文字时居中显示。 */
function SolidIcon(props: { color: string; text?: string; size: number }) {
    return (
        <span
            class="grid place-items-center overflow-hidden rounded-lg font-semibold leading-none"
            style={`width: ${props.size}px; height: ${props.size}px; background: ${props.color}; color: ${readableTextColor(props.color)}; font-size: ${Math.round(props.size * 0.42)}px;`}
            aria-hidden="true"
        >
            {props.text}
        </span>
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
function FaviconImage(props: { url?: string; src?: string; size: number; preview?: boolean }) {
    const root = () => {
        const url = props.url ? parseWebUrl(props.url) : null;
        return url ? siteRoot(url) : null;
    };

    const initial = (): string[] => {
        // 用户在候选里挑定了某一张：直接画它，不再自动解析。
        if (props.src) return [props.src];

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
        if (started || props.src || !props.url) return;
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
        if (props.preview || props.src || !root()) return;
        upgrade();
    });

    const advance = () => {
        if (index() + 1 < srcs().length) {
            setIndex(index() + 1);
            return;
        }

        // 指定了具体图标时没有"再解析一次"这条路，失败就落到占位。
        if (!started && !props.src) {
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
                    class="block object-contain"
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
 * `favicon` 会解析站点图标（或直接用用户挑定的那张）；`solid` 可以带文字；
 * `upload` 还没做，仍然渲染占位。
 */
export default function CellIcon(props: CellIconProps) {
    const size = () => props.size ?? 28;
    const source = (): IconSource | undefined =>
        props.icon ?? (props.url ? { kind: 'favicon' } : undefined);
    const icon = source();
    const url = props.url?.trim();

    if (icon?.kind === 'solid') {
        return <SolidIcon color={icon.color} text={icon.text} size={size()} />;
    }

    if (icon?.kind === 'favicon') {
        if (icon.url) return <FaviconImage src={icon.url} size={size()} preview={props.preview} />;
        if (url) return <FaviconImage url={url} size={size()} preview={props.preview} />;
    }

    return <IconPlaceholder size={size()} />;
}
