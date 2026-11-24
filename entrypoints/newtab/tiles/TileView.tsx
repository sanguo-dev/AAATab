import type { Tile } from '@/utils/dashboard/types';

import ClockTile from './ClockTile';
import LinkTile from './LinkTile';
import NoteTile from './NoteTile';

export default function TileView(props: { tile: Tile }) {
    if (props.tile.type === 'clock') return <ClockTile />;
    if (props.tile.type === 'link') return <LinkTile tile={props.tile} />;
    return <NoteTile tile={props.tile} />;
}
