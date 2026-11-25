/** 固定列数。 */
export const GRID_COLUMNS = 12;
/** 单个格子的边长（正方形，固定 120×120）。 */
export const GRID_CELL_SIZE = 120;
/** 格子之间的间距。 */
export const GRID_GAP = 12;

export interface GridRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type IconName = 'clock' | 'layout-grid' | 'link' | 'sparkles';

export type IconSource =
    | { kind: 'lucide'; name: IconName }
    | { kind: 'emoji'; value: string }
    | { kind: 'image'; src: string };

export type TileType = 'clock' | 'link' | 'note';

export interface TileBase {
    id: string;
    type: TileType;
    title: string;
    icon?: IconSource;
    /** 占用的格子：左上角 x/y，宽高 w/h。y 不设上限，页面会随之增长。 */
    grid: GridRect;
    /** 显式指定的模板 id；省略时按尺寸自动选择。 */
    template?: string;
}

export interface ClockTile extends TileBase {
    type: 'clock';
}

export interface LinkTile extends TileBase {
    type: 'link';
    url: string;
}

export interface NoteTile extends TileBase {
    type: 'note';
    text: string;
}

export type Tile = ClockTile | LinkTile | NoteTile;

export interface DashboardPage {
    id: string;
    title: string;
    icon?: IconSource;
    tiles: Tile[];
}

export interface DashboardData {
    schemaVersion: 1;
    activePageId: string;
    pages: DashboardPage[];
}
