import type { JSX } from '@solidjs/web';

import type {
    GridRect,
    LinkTile as LinkTileData,
    NoteTile as NoteTileData,
    Tile,
    TileType,
} from '@/lib/dashboard/types';

import ClockTile from './ClockTile';
import LinkTile from './LinkTile';
import NoteTile from './NoteTile';

export interface TileTemplate {
    name: string;
    label: string;
    /** 自动选择模板时，tile 至少要占这么多格。 */
    minW: number;
    minH: number;
    /** 可选的上限，用来区分同面积但横竖比例不同的模板。 */
    maxW?: number;
    maxH?: number;
    render: (tile: Tile) => JSX.Element;
}

export interface TileDefinition {
    type: TileType;
    label: string;
    defaultSize: { w: number; h: number };
    defaultTemplate: string;
    templates: readonly TileTemplate[];
}

/**
 * The tile registry is the extension point for new tile types. Add a renderer
 * here and the new type to the Tile union in lib/dashboard/types.ts.
 */
export const TILE_REGISTRY: Record<TileType, TileDefinition> = {
    clock: {
        type: 'clock',
        label: '时钟',
        defaultSize: { w: 1, h: 1 },
        defaultTemplate: 'compact',
        templates: [
            { name: 'default', label: '完整', minW: 3, minH: 2, render: () => <ClockTile /> },
            { name: 'compact', label: '紧凑', minW: 1, minH: 1, render: () => <ClockTile compact /> },
        ],
    },
    link: {
        type: 'link',
        label: '链接',
        defaultSize: { w: 1, h: 1 },
        defaultTemplate: 'default',
        templates: [
            {
                name: 'default',
                label: '图标',
                minW: 1,
                minH: 1,
                render: (tile) => <LinkTile tile={tile as LinkTileData} />,
            },
        ],
    },
    note: {
        type: 'note',
        label: '便签',
        defaultSize: { w: 4, h: 3 },
        defaultTemplate: 'card',
        templates: [
            {
                name: 'card',
                label: '卡片',
                minW: 2,
                minH: 2,
                render: (tile) => <NoteTile tile={tile as NoteTileData} variant="card" />,
            },
            {
                name: 'icon',
                label: '图标',
                minW: 1,
                minH: 1,
                render: (tile) => <NoteTile tile={tile as NoteTileData} variant="icon" />,
            },
        ],
    },
};

export const TILE_TYPES = Object.keys(TILE_REGISTRY) as TileType[];

function fits(template: TileTemplate, w: number, h: number): boolean {
    return (
        w >= template.minW &&
        h >= template.minH &&
        (template.maxW === undefined || w <= template.maxW) &&
        (template.maxH === undefined || h <= template.maxH)
    );
}

/** 显式模板优先；否则按当前占用尺寸挑一个能放下的最大模板。 */
export function resolveTileTemplate(tile: Tile, grid: GridRect = tile.grid): TileTemplate {
    const definition = TILE_REGISTRY[tile.type];

    if (tile.template) {
        const explicit = definition.templates.find((template) => template.name === tile.template);
        if (explicit) return explicit;
    }

    const fitting = definition.templates
        .filter((template) => fits(template, grid.w, grid.h))
        .sort((a, b) => b.minW * b.minH - a.minW * a.minH);

    return (
        fitting[0] ??
        definition.templates.find((template) => template.name === definition.defaultTemplate) ??
        definition.templates[0]!
    );
}
