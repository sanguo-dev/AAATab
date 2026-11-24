import type { Tile } from '@/utils/dashboard/types';

import { TILE_REGISTRY } from './registry';

export default function TileView(props: { tile: Tile }) {
    return TILE_REGISTRY[props.tile.type].render(props.tile);
}
