import { Show } from 'solid-js';

import type { LinkTile as LinkTileData } from '../dashboard/types';

import TileIcon from './TileIcon';

export type LinkVariant = 'icon' | 'bar' | 'card';

function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export default function LinkTile(props: { tile: LinkTileData; variant: LinkVariant }) {
    const frame =
        'flex h-full w-full rounded-3xl border border-border bg-card/40 text-center backdrop-blur transition-colors hover:border-primary/40 hover:bg-card/60';

    const layout =
        props.variant === 'bar'
            ? 'flex-row items-center gap-3 px-4 text-left'
            : props.variant === 'card'
              ? 'flex-col items-center justify-center gap-2 p-4'
              : 'flex-col items-center justify-center gap-1.5 p-2';

    return (
        <a
            class={`${frame} ${layout}`}
            href={props.tile.url}
            target="_blank"
            rel="noreferrer"
            title={props.tile.title}
        >
            <span class="grid size-[60px] flex-none place-items-center rounded-2xl border border-border bg-card/40 text-primary">
                <TileIcon icon={props.tile.icon} size={30} />
            </span>

            <Show
                when={props.variant !== 'icon'}
                fallback={
                    <span class="block w-full max-w-[90px] truncate text-xs font-medium text-foreground">
                        {props.tile.title}
                    </span>
                }
            >
                <span class="flex min-w-0 flex-col">
                    <span
                        class={`truncate font-medium text-foreground ${
                            props.variant === 'bar' ? 'text-sm' : 'text-base'
                        }`}
                    >
                        {props.tile.title}
                    </span>
                    <span class="truncate text-[0.7rem] text-muted-foreground">
                        {hostOf(props.tile.url)}
                    </span>
                </span>
            </Show>
        </a>
    );
}
