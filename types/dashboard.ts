/** 列数。 */
export const GRID_COLUMNS = 12;
/** 单个格子的边长（正方形，120×120）。 */
export const GRID_CELL_SIZE = 120;
/** 格子之间的间距。 */
export const GRID_GAP = 12;

export interface GridRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * cell 图标只有三种来源：
 * - `favicon`：由 cell 的地址解析站点图标（页面声明的 icon 优先，退到 /favicon.ico）；
 *   带 `url` 时表示用户从候选里挑定了某一张，直接用它，不再自动解析；
 * - `solid`：纯色块，可以带一段文字（`text`）显示在图标位；
 * - `upload`：用户上传的图片（先占位，选择器和存储都还没做）。
 */
export type IconSource =
    | { kind: 'favicon'; url?: string }
    | { kind: 'solid'; color: string; text?: string }
    | { kind: 'upload' };

/**
 * cell 只有三种：
 * - `link`：一个链接，图标 + 标题，另有"当前页/新标签打开"；
 * - `widget`：系统提供的小组件，由 `widget` id 决定渲染什么，目前只有时间；
 * - `custom`：自定义 cell，由 `template` id 决定模板，未注册的 id 回退到默认模板。
 *
 * 具体的 id 列表和渲染实现分别放在 `lib/dashboard/cell-kinds.ts` 和
 * `entrypoints/newtab/cells/` 的注册表里；这里只定义存下来的形状。
 */
export type CellKind = 'link' | 'widget' | 'custom';

/** 系统内置小组件 id，例如 `clock`。未实现的 id 会渲染占位，不会被丢弃。 */
export type WidgetId = string;

/** 自定义 cell 的模板 id。 */
export type CustomTemplateId = string;

export interface CellBase {
    id: string;
    title: string;
    icon?: IconSource;
    /** 占用的格子：左上角 x/y，宽高 w/h。y 不设上限，页面会随之增长。 */
    grid: GridRect;
}

export interface LinkCell extends CellBase {
    kind: 'link';
    url: string;
}

export interface WidgetCell extends CellBase {
    kind: 'widget';
    widget: WidgetId;
}

export interface CustomCell extends CellBase {
    kind: 'custom';
    template: CustomTemplateId;
}

export type Cell = LinkCell | WidgetCell | CustomCell;

export interface DashboardPage {
    id: string;
    title: string;
    icon?: IconSource;
    cells: Cell[];
}

export interface DashboardData {
    /** 1 = 旧的 `tiles` + `type` 结构，2 = 当前的 `cells` + `kind` 结构。 */
    schemaVersion: 2;
    activePageId: string;
    pages: DashboardPage[];
}
