/** 页面空白处右键（全局菜单）的命令。 */
export type GlobalMenuCommand =
    | 'add-icon'
    | 'add-widget'
    | 'random-wallpaper'
    | 'download-wallpaper'
    | 'edit-home'
    | 'search-icon';

export interface GlobalMenuEntry {
    command: GlobalMenuCommand;
    label: string;
    /** 还没实现的功能：先占位，菜单里灰掉。 */
    pending?: boolean;
}

/**
 * 全局右键菜单模型。加一项只改这里 + `App.tsx` 的 `runCommand`。
 * `pending` 的项只占位，不可点。
 */
export const GLOBAL_MENU: GlobalMenuEntry[] = [
    { command: 'add-icon', label: '添加图标' },
    { command: 'add-widget', label: '添加小组件', pending: true },
    { command: 'random-wallpaper', label: '随机壁纸', pending: true },
    { command: 'download-wallpaper', label: '下载壁纸', pending: true },
    { command: 'edit-home', label: '编辑主页' },
    { command: 'search-icon', label: '搜索图标', pending: true },
];
