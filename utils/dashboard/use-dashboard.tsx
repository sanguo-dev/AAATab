import type { JSX } from '@solidjs/web';
import { createContext, createSignal, onSettled, useContext } from 'solid-js';

import { createDefaultDashboard } from './defaults';
import { moveTile as moveTileOnGrid } from './grid';
import { normalizeDashboard } from './normalize';
import { dashboardItem } from './storage';
import type { DashboardData, DashboardPage, GridRect, IconSource, Tile } from './types';

export interface TilePatch {
    title?: string;
    icon?: IconSource;
    grid?: GridRect;
    url?: string;
    text?: string;
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
    updateTile: (pageId: string, tileId: string, patch: TilePatch) => void;
    moveTile: (pageId: string, tileId: string, rect: GridRect) => void;
    addTile: (pageId: string, tile: Tile) => void;
    removeTile: (pageId: string, tileId: string) => void;
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

    const replaceTiles = (pageId: string, updater: (tiles: readonly Tile[]) => readonly Tile[]) => {
        replacePage(pageId, (page) => {
            const tiles = updater(page.tiles);
            return tiles === page.tiles ? page : { ...page, tiles: [...tiles] };
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

    const updateTile = (pageId: string, tileId: string, patch: TilePatch) => {
        replaceTiles(pageId, (tiles) =>
            tiles.map((tile) => (tile.id === tileId ? ({ ...tile, ...patch } as Tile) : tile)),
        );
    };

    const moveTile = (pageId: string, tileId: string, rect: GridRect) => {
        replaceTiles(pageId, (tiles) => moveTileOnGrid(tiles, tileId, rect));
    };

    const addTile = (pageId: string, tile: Tile) => {
        replaceTiles(pageId, (tiles) =>
            tiles.some((candidate) => candidate.id === tile.id) ? tiles : [...tiles, tile],
        );
    };

    const removeTile = (pageId: string, tileId: string) => {
        replaceTiles(pageId, (tiles) => tiles.filter((tile) => tile.id !== tileId));
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
        updateTile,
        moveTile,
        addTile,
        removeTile,
        addPage,
        removePage,
        movePage,
    };

    return <DashboardContext value={store}>{props.children}</DashboardContext>;
}

export function useDashboard() {
    return useContext(DashboardContext);
}
