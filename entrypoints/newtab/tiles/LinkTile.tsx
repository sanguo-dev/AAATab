import type { LinkTile as LinkTileData } from '@/utils/dashboard/types';

import TileIcon from './TileIcon';

export default function LinkTile(props: { tile: LinkTileData }) {
    return (
        <a
            class="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-base-content/10 bg-base-100/40 p-5 text-center backdrop-blur transition-colors hover:border-primary/40 hover:bg-base-100/60"
            href={props.tile.url}
            target="_blank"
            rel="noreferrer"
        >
            <span class="grid size-12 place-items-center rounded-2xl border border-base-content/10 bg-base-100/40 text-primary">
                <TileIcon icon={props.tile.icon} size={24} />
            </span>
            <span class="text-sm font-medium text-base-content">{props.tile.title}</span>
        </a>
    );
}
