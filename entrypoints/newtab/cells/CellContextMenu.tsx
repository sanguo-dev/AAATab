import type { JSX } from '@solidjs/web';
import { For } from 'solid-js';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { Cell, CellKind } from '@/types/dashboard';

/** 右键菜单能发出的命令；具体做什么由页面层决定。 */
export type CellMenuCommand = 'open-current' | 'open-new' | 'edit-icon' | 'delete';

export interface CellMenuEntry {
    command: CellMenuCommand;
    label: string;
    variant?: 'destructive';
}

/** 每种 cell 各自多出来的菜单项。 */
const KIND_ENTRIES: Record<CellKind, CellMenuEntry[]> = {
    link: [
        { command: 'open-current', label: '当前页打开' },
        { command: 'open-new', label: '新标签打开' },
        { command: 'edit-icon', label: '编辑图标' },
    ],
    // 小组件由系统渲染，没有链接可打开，也没有自己的图标可编辑。
    widget: [],
    custom: [{ command: 'edit-icon', label: '编辑图标' }],
};

/** 通用菜单项：所有 cell 都有。 */
const COMMON_ENTRIES: CellMenuEntry[] = [{ command: 'delete', label: '删除', variant: 'destructive' }];

/**
 * 通用右键菜单模型 = 该 kind 专属项 + 通用项。
 * 加一种 cell 只需要在这里补一条 `KIND_ENTRIES`，渲染层不用改。
 */
export function buildCellMenu(cell: Cell): CellMenuEntry[] {
    return [...KIND_ENTRIES[cell.kind], ...COMMON_ENTRIES];
}

interface CellContextMenuProps {
    cell: Cell;
    onCommand: (command: CellMenuCommand) => void;
    children: JSX.Element;
}

/**
 * 通用的 cell 右键菜单：内容来自 `buildCellMenu`，这里只负责把菜单项渲染出来。
 */
export default function CellContextMenu(props: CellContextMenuProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger
                data-cell-menu
                class="block h-full w-full"
                onContextMenu={(event) => event.stopPropagation()}
            >
                {props.children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <For each={buildCellMenu(props.cell)}>
                    {(entry) => (
                        <ContextMenuItem
                            variant={entry.variant}
                            onSelect={() => props.onCommand(entry.command)}
                        >
                            {entry.label}
                        </ContextMenuItem>
                    )}
                </For>
            </ContextMenuContent>
        </ContextMenu>
    );
}
