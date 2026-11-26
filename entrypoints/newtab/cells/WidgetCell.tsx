import type { WidgetCell as WidgetCellData } from '@/types/dashboard';

import { resolveWidget } from '../widgets';

/**
 * widget 类 cell：只负责按 widget id 找到系统小组件并渲染。
 * 未知 id 渲染占位，数据不会因为少一个实现而消失。
 */
export default function WidgetCell(props: { cell: WidgetCellData; iconOnly?: boolean }) {
    // widget id 在 cell 生命周期内不变，所以这里取一次就够。
    const definition = resolveWidget(props.cell.widget);

    if (!definition) {
        return (
            <section
                class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center text-muted-foreground"
                title={props.cell.title}
            >
                <span class="text-xs leading-tight">未实现的小组件</span>
                <span class="max-w-full truncate text-[10px] opacity-60">{props.cell.widget}</span>
            </section>
        );
    }

    const Widget = definition.component;
    return <Widget cell={props.cell} iconOnly={props.iconOnly} />;
}
