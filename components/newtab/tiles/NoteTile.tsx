import type { NoteTile as NoteTileData } from '@/lib/dashboard/types';

import TileIcon from './TileIcon';

export type NoteVariant = 'icon' | 'card';

export default function NoteTile(props: { tile: NoteTileData; variant: NoteVariant }) {
    if (props.variant === 'icon') {
        return (
            <section
                class="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-3xl p-2 text-center backdrop-blur"
                title={props.tile.title}
            >
                <span class="grid size-[60px] flex-none place-items-center rounded-2xl text-primary">
                    <TileIcon icon={props.tile.icon} size={30} />
                </span>
                <span class="block w-full max-w-[90px] truncate text-xs font-medium text-foreground">
                    {props.tile.title}
                </span>
            </section>
        );
    }

    return (
        <section class="flex h-full w-full flex-col items-center justify-center rounded-3xl p-5 text-center backdrop-blur">
            <div class="grid size-[60px] flex-none place-items-center rounded-2xl text-primary">
                <TileIcon icon={props.tile.icon} size={30} />
            </div>
            <h2 class="mt-3 w-full truncate text-[clamp(1rem,7cqmin,2.25rem)] font-semibold tracking-tight">
                {props.tile.title}
            </h2>
            <p class="mt-1 line-clamp-4 w-full text-[clamp(0.7rem,3cqmin,1rem)] leading-relaxed text-muted-foreground">
                {props.tile.text}
            </p>
        </section>
    );
}
