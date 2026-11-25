import { createMemo } from 'solid-js';

import type { GridRect, Tile } from '../dashboard/types';
import { resolveTileTemplate } from './registry';

export default function TileView(props: { tile: Tile; grid?: GridRect }) {
    const template = createMemo(() => resolveTileTemplate(props.tile, props.grid));

    return <>{template().render(props.tile)}</>;
}
