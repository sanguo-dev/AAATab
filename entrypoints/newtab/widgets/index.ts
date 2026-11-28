import type { Component } from 'solid-js';

import type { SystemWidgetId } from '@/lib/dashboard/cell-kinds';
import type { WidgetCell } from '@/types/dashboard';

import ClockWidget from './ClockWidget';

export interface WidgetProps {
    cell: WidgetCell;
    /** 拖拽期间为 true：只留图标，不渲染文字。 */
    iconOnly?: boolean;
}

export interface WidgetDefinition {
    /** 和 cells 数据里存的 widget id 对应。 */
    id: string;
    label: string;
    component: Component<WidgetProps>;
}

/**
 * 系统小组件注册表。`SYSTEM_WIDGET_IDS` 里列的 id 都应该在这里有实现；
 * 数据里出现未知 id 时，WidgetCell 渲染占位而不是报错。
 */
export const WIDGETS = {
    clock: { id: 'clock', label: '时间', component: ClockWidget },
} satisfies Record<SystemWidgetId, WidgetDefinition>;

export function resolveWidget(id: string): WidgetDefinition | undefined {
    return WIDGETS[id as SystemWidgetId];
}
