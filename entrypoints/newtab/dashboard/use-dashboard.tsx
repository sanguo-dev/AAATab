import type { JSX } from '@solidjs/web';
import { createContext, createSignal, onSettled, useContext } from 'solid-js';
import { storage } from 'wxt/utils/storage';

import type { Cell, DashboardData, DashboardPage, GridRect, IconSource } from '@/types/dashboard';

import { createDefaultDashboard } from './defaults';
import { moveCell as moveCellOnGrid, resizeCell as resizeCellOnGrid } from './grid';
import { normalizeDashboard } from './normalize';

/**
 * 持久化条目；结构变化在 `normalize.ts` 里做迁移。
 *
 * - 正式环境：`fallback` 给一页空白，`init` 不传 —— 首次打开不往存储里写任何东西。
 * - 开发环境：`init` 在存储为空时写入 `dev-seed.ts` 的种子数据。`import.meta.env.DEV`
 *   在正式构建里是字面量 `false`，这个动态 import 和整个 `dev-seed` 模块会被摇掉。
 */
const dashboardItem = storage.defineItem<DashboardData>('local:dashboard', {
    init: import.meta.env.DEV
        ? async () => (await import('./dev-seed')).createDevSeedDashboard()
        : undefined,
    fallback: createDefaultDashboard(),
    version: 1,
});

/** 通用字段的补丁；kind 专属字段（url/widget/template）在各自的编辑器里处理。 */
export interface CellPatch {
    title?: string;
    icon?: IconSource;
    grid?: GridRect;
    url?: string;
}

export interface PagePatch {
    title?: string;
    icon?: IconSource;
}

interface DashboardStore {
    data: () => DashboardData;
    activePage: () => DashboardPage | undefined;
    setActivePage: (pageId: string) => void;
    updatePage: (pageId: string, patch: PagePatch) => void;
    updateCell: (pageId: string, cellId: string, patch: CellPatch) => void;
    moveCell: (pageId: string, cellId: string, rect: GridRect) => void;
    resizeCell: (pageId: string, cellId: string, rect: GridRect) => void;
    addCell: (pageId: string, cell: Cell) => void;
    removeCell: (pageId: string, cellId: string) => void;
    reorderCell: (pageId: string, cellId: string, toIndex: number) => void;
    addPage: (page: DashboardPage) => void;
    removePage: (pageId: string) => void;
    movePage: (pageId: string, toIndex: number) => void;
}

const DashboardContext = createContext<DashboardStore>();

export function DashboardProvider(props: { children: JSX.Element }) {
    let current = createDefaultDashboard();
    const [data, setData] = createSignal<DashboardData>(current);

    const apply = (value: unknown) => {
        current = normalizeDashboard(value);
        setData(current);
    };

    const commit = (next: DashboardData) => {
        current = next;
        setData(next);
        void dashboardItem.setValue(next);
    };

    const replacePage = (pageId: string, updater: (page: DashboardPage) => DashboardPage) => {
        const page = current.pages.find((candidate) => candidate.id === pageId);
        if (!page) return;

        const nextPage = updater(page);
        if (nextPage === page) return;

        commit({
            ...current,
            pages: current.pages.map((candidate) => (candidate.id === pageId ? nextPage : candidate)),
        });
    };

    const replaceCells = (pageId: string, updater: (cells: readonly Cell[]) => readonly Cell[]) => {
        replacePage(pageId, (page) => {
            const cells = updater(page.cells);
            return cells === page.cells ? page : { ...page, cells: [...cells] };
        });
    };

    const setActivePage = (pageId: string) => {
        if (pageId === current.activePageId) return;
        if (!current.pages.some((page) => page.id === pageId)) return;
        commit({ ...current, activePageId: pageId });
    };

    const updatePage = (pageId: string, patch: PagePatch) => {
        replacePage(pageId, (page) => ({
            ...page,
            ...patch,
        }));
    };

    const updateCell = (pageId: string, cellId: string, patch: CellPatch) => {
        replaceCells(pageId, (cells) =>
            cells.map((cell) => (cell.id === cellId ? ({ ...cell, ...patch } as Cell) : cell)),
        );
    };

    const moveCell = (pageId: string, cellId: string, rect: GridRect) => {
        replaceCells(pageId, (cells) => moveCellOnGrid(cells, cellId, rect));
    };

    const resizeCell = (pageId: string, cellId: string, rect: GridRect) => {
        replaceCells(pageId, (cells) => resizeCellOnGrid(cells, cellId, rect));
    };

    const addCell = (pageId: string, cell: Cell) => {
        replaceCells(pageId, (cells) =>
            cells.some((candidate) => candidate.id === cell.id) ? cells : [...cells, cell],
        );
    };

    const removeCell = (pageId: string, cellId: string) => {
        replaceCells(pageId, (cells) => cells.filter((cell) => cell.id !== cellId));
    };

    const reorderCell = (pageId: string, cellId: string, toIndex: number) => {
        replacePage(pageId, (page) => {
            const from = page.cells.findIndex((cell) => cell.id === cellId);
            const to = Math.max(0, Math.min(toIndex, page.cells.length - 1));
            if (from < 0 || from === to) return page;

            const cells = [...page.cells];
            const [cell] = cells.splice(from, 1);
            cells.splice(to, 0, cell!);

            return { ...page, cells };
        });
    };

    const addPage = (page: DashboardPage) => {
        if (current.pages.some((candidate) => candidate.id === page.id)) return;
        commit({ ...current, pages: [...current.pages, page] });
    };

    const removePage = (pageId: string) => {
        if (current.pages.length <= 1) return;
        const pages = current.pages.filter((page) => page.id !== pageId);
        if (pages.length === current.pages.length) return;

        commit({
            ...current,
            pages,
            activePageId: current.activePageId === pageId ? pages[0]!.id : current.activePageId,
        });
    };

    const movePage = (pageId: string, toIndex: number) => {
        const from = current.pages.findIndex((page) => page.id === pageId);
        const to = Math.max(0, Math.min(toIndex, current.pages.length - 1));
        if (from < 0 || from === to) return;

        const pages = [...current.pages];
        const [page] = pages.splice(from, 1);
        pages.splice(to, 0, page!);
        commit({ ...current, pages });
    };

    onSettled(() => {
        let active = true;
        let receivedUpdate = false;

        const unwatch = dashboardItem.watch((value) => {
            receivedUpdate = true;
            // 本组件的写入也会从 storage 回显一次。内容没变就别再归一化：
            // normalizeDashboard 会重建每个 cell 对象，<For> 按引用比对，
            // 于是整块网格的 DOM 被销毁重建（拖拽松手后最明显）。
            if (JSON.stringify(value) === JSON.stringify(current)) return;
            apply(value);
        });
        void dashboardItem.getValue().then((value) => {
            if (active && !receivedUpdate) apply(value);
        });

        return () => {
            active = false;
            unwatch();
        };
    });

    const store: DashboardStore = {
        data,
        activePage: () => data().pages.find((page) => page.id === data().activePageId),
        setActivePage,
        updatePage,
        updateCell,
        moveCell,
        resizeCell,
        addCell,
        removeCell,
        reorderCell,
        addPage,
        removePage,
        movePage,
    };

    return <DashboardContext value={store}>{props.children}</DashboardContext>;
}

export function useDashboard() {
    return useContext(DashboardContext);
}
