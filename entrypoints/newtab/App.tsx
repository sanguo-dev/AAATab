import { Show, createSignal } from 'solid-js';

import NewTabShell from '@/components/layout/NewTabShell';
import { DashboardProvider, useDashboard } from '@/utils/dashboard/use-dashboard';
import type { Tile } from '@/utils/dashboard/types';
import { SettingsProvider } from '@/utils/use-settings';

import PageGrid from './PageGrid';
import TileEditor from './TileEditor';

export default function App() {
    return (
        <SettingsProvider>
            <DashboardProvider>
                <NewTabView />
            </DashboardProvider>
        </SettingsProvider>
    );
}

function NewTabView() {
    const { data, setActivePage, moveTile, updateTile, removeTile } = useDashboard();
    const [direction, setDirection] = createSignal(1);
    const [editing, setEditing] = createSignal(false);
    const [editingTile, setEditingTile] = createSignal<Tile | null>(null);

    const pages = () => data().pages;
    const index = () => Math.max(0, pages().findIndex((page) => page.id === data().activePageId));
    const page = () => pages()[index()];

    const changePage = (next: number) => {
        const target = pages()[next];
        if (!target || target.id === data().activePageId) return;
        setDirection(next > index() ? 1 : -1);
        setActivePage(target.id);
    };

    const toggleEditing = () => {
        setEditing((value) => !value);
        setEditingTile(null);
    };

    const saveTile = (patch: Parameters<typeof updateTile>[2]) => {
        const tile = editingTile();
        const currentPage = page();
        if (!tile || !currentPage) return;

        updateTile(currentPage.id, tile.id, patch);
        setEditingTile(null);
    };

    const deleteTile = () => {
        const tile = editingTile();
        const currentPage = page();
        if (!tile || !currentPage) return;

        removeTile(currentPage.id, tile.id);
        setEditingTile(null);
    };

    return (
        <>
            <NewTabShell
                pages={pages()}
                index={index()}
                direction={direction()}
                editing={editing()}
                onIndexChange={changePage}
                onToggleEditing={toggleEditing}
            >
                <PageGrid
                    page={page()!}
                    editing={editing()}
                    onMoveTile={(tileId, rect) => moveTile(page()!.id, tileId, rect)}
                    onEditTile={(tile) => setEditingTile(tile)}
                />
            </NewTabShell>

            <Show when={editingTile()}>
                {(tile) => (
                    <TileEditor
                        tile={tile()}
                        onSave={saveTile}
                        onDelete={deleteTile}
                        onClose={() => setEditingTile(null)}
                    />
                )}
            </Show>
        </>
    );
}
