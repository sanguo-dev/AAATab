import type { JSX } from '@solidjs/web';

import type { LinkTile as LinkTileData, NoteTile as NoteTileData, Tile, TileType } from '@/utils/dashboard/types';

import ClockTile from './ClockTile';
import LinkTile from './LinkTile';
import NoteTile from './NoteTile';

export interface TileDefinition {
    type: TileType;
    label: string;
    defaultSize: { w: number; h: number };
    render: (tile: Tile) => JSX.Element;
}

/**
 * The tile registry is the extension point for new tile types. Add a renderer
 * here and the new type to the Tile union in utils/dashboard/types.ts.
 */
export const TILE_REGISTRY: Record<TileType, TileDefinition> = {
    clock: {
        type: 'clock',
        label: '时钟',
        defaultSize: { w: 12, h: 8 },
        render: () => <ClockTile />,
    },
    link: {
        type: 'link',
        label: '链接',
        defaultSize: { w: 2, h: 2 },
        render: (tile) => <LinkTile tile={tile as LinkTileData} />,
    },
    note: {
        type: 'note',
        label: '便签',
        defaultSize: { w: 4, h: 3 },
        render: (tile) => <NoteTile tile={tile as NoteTileData} />,
    },
};

export const TILE_TYPES = Object.keys(TILE_REGISTRY) as TileType[];
