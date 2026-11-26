import { Show } from 'solid-js';

import type { LinkCell as LinkCellData } from '@/types/dashboard';

import CellIcon from './CellIcon';

/** link 类 cell：图标 + 标题，链接本身不显示。 */
export default function LinkCell(props: { cell: LinkCellData; iconOnly?: boolean }) {
    return (
        <a
            class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center transition-colors"
            href={props.cell.url}
            target="_blank"
            rel="noreferrer"
            title={props.cell.title}
        >
            <span class="grid size-[60px] flex-none place-items-center text-primary">
                <CellIcon icon={props.cell.icon} size={60} />
            </span>
            {/* 拖拽期间整个网格只留图标，避免文字跟着漂浮。 */}
            <Show when={!props.iconOnly}>
                <span class="block h-[20px] w-[90px] truncate text-xs font-medium leading-5 text-foreground">
                    {props.cell.title}
                </span>
            </Show>
        </a>
    );
}
