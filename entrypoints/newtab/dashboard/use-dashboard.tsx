import type { JSX } from '@solidjs/web';
import { createContext, createSignal, onSettled, useContext } from 'solid-js';

import { createDefaultDashboard } from '@/lib/dashboard/defaults';
import { moveCell as moveCellOnGrid, resizeCell as resizeCellOnGrid } from '@/lib/dashboard/grid';
import { normalizeDashboard } from '@/lib/dashboard/normalize';
import { dashboardItem } from '@/lib/dashboard/storage';
import type { Cell, DashboardData, DashboardPage, GridRect, IconSource } from '@/types/dashboard';

/** 写盘失败后的重试间隔；再失败就只留控制台报错，不阻塞下一次改动。 */
const RETRY_DELAYS = [150, 600];
/** 记住最近写入过的快照，用来把自己的存储回显和别的页面的改动区分开。 */
const RECENT_WRITES = 10;

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

    /**
     * 写盘是异步的，改动却是连续的（加一个、拖一下、再改个图标）。
     * 这里保证同一时间只有一个写入在飞，飞行途中攒下的改动合并成"只写最新的一份"，
     * 避免旧快照晚到、把新状态覆盖回去。
     */
    let pending: DashboardData | null = null;
    let flushing: Promise<void> | null = null;
    const recentWrites: string[] = [];

    const rememberWrite = (snapshot: string) => {
        recentWrites.push(snapshot);
        if (recentWrites.length > RECENT_WRITES) recentWrites.shift();
    };

    const writeOnce = async (value: DashboardData) => {
        let attempt = 0;

        for (;;) {
            try {
                await dashboardItem.setValue(value);
                return;
            } catch (error) {
                const delay = RETRY_DELAYS[attempt];
                if (delay === undefined) {
                    console.error('[dashboard] 保存失败，这次改动可能没有写进存储', error);
                    return;
                }

                attempt += 1;
                await new Promise<void>((resolve) => window.setTimeout(resolve, delay));

                // 重试等待期间又改了：旧值不必再写，循环会拿最新的 pending。
                if (pending) return;
            }
        }
    };

    const flush = () => {
        if (flushing) return;

        flushing = (async () => {
            while (pending) {
                const value = pending;
                pending = null;
                await writeOnce(value);
            }
        })().finally(() => {
            flushing = null;
        });
    };

    const apply = (value: unknown) => {
        current = normalizeDashboard(value);
        setData(current);
    };

    const commit = (next: DashboardData) => {
        current = next;
        setData(next);

        rememberWrite(JSON.stringify(next));
        pending = next;
        flush();
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

            const json = JSON.stringify(value);

            // 本组件的写入也会从 storage 回显一次。内容没变就别再归一化：
            // normalizeDashboard 会重建每个 cell 对象，<For> 按引用比对，
            // 于是整块网格的 DOM 被销毁重建（拖拽松手后最明显）。
            if (json === JSON.stringify(current)) return;

            // 连续改动时，先发出去的写入可能后回显；旧快照不能盖掉内存里更新的状态。
            if (recentWrites.includes(json)) return;

            // 本页还有没写完的改动：那一笔马上会落到存储里，先别用存储里的旧状态盖掉内存。
            // 两个页面同时改属于 last-write-wins，等这一笔写完再接受外部的状态。
            if (pending || flushing) return;

            apply(value);
        });
        void dashboardItem.getValue().then((value) => {
            // 读回来的值比首屏期间的本地改动旧，就别用它盖掉内存。
            if (active && !receivedUpdate && !pending && !flushing) apply(value);
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
