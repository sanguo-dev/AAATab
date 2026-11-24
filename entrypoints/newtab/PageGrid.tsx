import { For } from 'solid-js';

import type { DashboardPage } from '@/utils/dashboard/types';

import TileView from './tiles/TileView';

export default function PageGrid(props: { page: DashboardPage }) {
    return (
        <div class="grid min-h-screen w-full grid-cols-12 grid-rows-[repeat(8,minmax(0,1fr))] gap-3 p-6 pb-24">
            <For each={props.page.tiles}>
                {(tile) => (
                    <div
                        class="min-h-0 min-w-0"
                        style={`grid-column: ${tile.grid.x + 1} / span ${tile.grid.w}; grid-row: ${tile.grid.y + 1} / span ${tile.grid.h};`}
                    >
                        <TileView tile={tile} />
                    </div>
                )}
            </For>
        </div>
    );
}
