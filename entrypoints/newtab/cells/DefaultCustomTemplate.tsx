import { Show } from 'solid-js';

import type { CustomCell as CustomCellData } from '@/types/dashboard';

import CellIcon from './CellIcon';

/** 默认自定义模板：图标 + 标题，和普通 cell 的外观一致。 */
export default function DefaultCustomTemplate(props: {
    cell: CustomCellData;
    iconOnly?: boolean;
}) {
    return (
        <section
            class="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-3xl p-2 text-center backdrop-blur"
            title={props.cell.title}
        >
            <span class="grid size-[60px] flex-none place-items-center rounded-2xl text-primary">
                <CellIcon icon={props.cell.icon} size={30} />
            </span>
            {/* 拖拽期间整个网格只留图标，避免文字跟着漂浮。 */}
            <Show when={!props.iconOnly}>
                <span class="block w-full max-w-[90px] truncate text-xs font-medium text-foreground">
                    {props.cell.title}
                </span>
            </Show>
        </section>
    );
}
