import type { Tile } from '@/types/dashboard';

import ClockTile from './ClockTile';
import LinkTile from './LinkTile';
import NoteTile from './NoteTile';

/**
 * 目前所有 cell 都是 1×1 的紧凑尺寸，所以直接用对应的紧凑模板；
 * 以后支持跨格时再按 tile.grid 选模板。
 */
export default function TileView(props: { tile: Tile }) {
    if (props.tile.type === 'clock') return <ClockTile compact />;
    if (props.tile.type === 'link') return <LinkTile tile={props.tile} />;

    return <NoteTile tile={props.tile} variant="icon" />;
}
