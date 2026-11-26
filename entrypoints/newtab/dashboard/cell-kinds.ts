import type { Cell, CellKind, CustomCell, LinkCell, WidgetCell } from '@/types/dashboard';

/** 三种 cell，顺序即文档/调试里的展示顺序。 */
export const CELL_KINDS: readonly CellKind[] = ['link', 'widget', 'custom'];

export const CELL_KIND_LABEL: Record<CellKind, string> = {
    link: '链接',
    widget: '小组件',
    custom: '自定义',
};

/**
 * 系统内置小组件。加一个 id 之后，还要在
 * `entrypoints/newtab/widgets/index.ts` 的注册表里给它一个组件。
 */
export const SYSTEM_WIDGET_IDS = ['clock'] as const;

export type SystemWidgetId = (typeof SYSTEM_WIDGET_IDS)[number];

/** 自定义 cell 的默认模板 id。 */
export const DEFAULT_CUSTOM_TEMPLATE = 'default';

export const isLinkCell = (cell: Cell): cell is LinkCell => cell.kind === 'link';

export const isWidgetCell = (cell: Cell): cell is WidgetCell => cell.kind === 'widget';

export const isCustomCell = (cell: Cell): cell is CustomCell => cell.kind === 'custom';

export function isCellKind(value: unknown): value is CellKind {
    return CELL_KINDS.includes(value as CellKind);
}
