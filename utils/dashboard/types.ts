export const GRID_COLUMNS = 12;
export const GRID_ROWS = 8;

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
    grid: GridRect;
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
