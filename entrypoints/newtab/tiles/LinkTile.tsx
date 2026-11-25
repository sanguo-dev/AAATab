import type { LinkTile as LinkTileData } from '../dashboard/types';

import TileIcon from './TileIcon';

export default function LinkTile(props: { tile: LinkTileData }) {
    return (
        <a
            class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center transition-colors"
            href={props.tile.url}
            target="_blank"
            rel="noreferrer"
            title={props.tile.title}
        >
            <span class="grid size-[60px] flex-none place-items-center text-primary">
                <TileIcon icon={props.tile.icon} size={60} />
            </span>
            <span class="block h-[20px] w-[90px] truncate text-xs font-medium leading-5 text-foreground">
                {props.tile.title}
            </span>
        </a>
    );
}
