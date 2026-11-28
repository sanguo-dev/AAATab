/** 一个可以直接塞进 `<img src>` 的图标候选。 */
export interface IconCandidate {
    /** 绝对地址，已经按页面的 `<base>` 解析过。 */
    url: string;
    /** 从哪来的：`link` = 页面声明的图标，`ico` = 站点根的 /favicon.ico。 */
    source: 'link' | 'ico';
    /** 声明里的 rel；`mask-icon` 是单色图，排序时靠后。 */
    rel?: string;
    /** 声明里的 type，SVG 优先。 */
    type?: string;
    /** 声明里的 sizes 取到的最大边长。 */
    size?: number;
}
