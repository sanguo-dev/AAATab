import type { NoteTile as NoteTileData } from '@/utils/dashboard/types';

import TileIcon from './TileIcon';

export default function NoteTile(props: { tile: NoteTileData }) {
    return (
        <section class="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-base-content/10 bg-base-100/40 p-6 text-center backdrop-blur">
            <div class="grid size-14 place-items-center rounded-2xl border border-base-content/10 bg-base-100/40 text-primary">
                <TileIcon icon={props.tile.icon} size={26} />
            </div>
            <h2 class="mt-4 text-2xl font-semibold tracking-tight">{props.tile.title}</h2>
            <p class="mt-2 max-w-md text-sm leading-relaxed text-base-content/60">{props.tile.text}</p>
        </section>
    );
}
