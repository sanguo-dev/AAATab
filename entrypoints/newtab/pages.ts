export type NewTabPageKind = 'clock' | 'content';

export type NewTabPageIcon = 'layout-grid' | 'link' | 'sparkles';

export interface NewTabPageConfig {
    /** Stable identifier used for future persistence and ordering. */
    id: string;
    label: string;
    kind: NewTabPageKind;
    title?: string;
    description?: string;
    icon?: NewTabPageIcon;
}

/**
 * New tab pages are configuration, not one component file per page.
 * Add an entry here and the pager order, dots and rendering follow.
 */
export const NEW_TAB_PAGES: NewTabPageConfig[] = [
    {
        id: 'home',
        label: '第一页',
        kind: 'clock',
    },
    {
        id: 'second',
        label: '第二页',
        kind: 'content',
        title: '第二页',
        description:
            '这是一个全新的全屏页面。鼠标滚轮可以在页面之间切换，之后可以在这里放置快捷链接、待办等内容。',
        icon: 'layout-grid',
    },
];
