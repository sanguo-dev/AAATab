/**
 * 新标签页背景的来源。
 *
 * - `default`：内置的深色主题背景（`assets/app.css` 里的 `.tab-surface`），不加任何覆盖；
 * - `solid`：一个纯色；
 * - `bing`：必应首页的「每日一图」，一天一张，`market` 决定地区版本；
 * - `url`：用户自己贴的图片地址；
 * - `upload`：用户上传到本地图片库（IndexedDB）的图片，`ref` 是库里的键。
 */
export type BackgroundSource =
    | { kind: 'default' }
    | { kind: 'solid'; color: string }
    | { kind: 'bing'; market?: string }
    | { kind: 'url'; url: string }
    | { kind: 'upload'; ref: string };

/**
 * 解析后的背景，渲染层只看这个，不关心来源。
 *
 * `color` 和 `url` 最多有一个：纯色来源给 `color`，图片来源给 `url`；
 * 两者都没有就是"用默认背景"。
 */
export interface ResolvedBackground {
    color?: string;
    /** 远程图片地址，或本地图片的 `blob:` 地址。 */
    url?: string;
    /** 图片来源的标题与版权文字（必应每日一图有）。 */
    title?: string;
    copyright?: string;
    /** 版权文字链回来源。 */
    sourceUrl?: string;
    /** `url` 是 `blob:` 时用来释放它；远程地址不需要。 */
    dispose?: () => void;
}
