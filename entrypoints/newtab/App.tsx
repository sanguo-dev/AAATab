import { createSignal } from 'solid-js';

import NewTabShell from '@/components/layout/NewTabShell';
import { DashboardProvider, useDashboard } from '@/utils/dashboard/use-dashboard';
import { SettingsProvider } from '@/utils/use-settings';

import PageGrid from './PageGrid';

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
    const { data, setActivePage } = useDashboard();
    const [direction, setDirection] = createSignal(1);

    const pages = () => data().pages;
    const index = () => Math.max(0, pages().findIndex((page) => page.id === data().activePageId));
    const page = () => pages()[index()];

    const changePage = (next: number) => {
        const target = pages()[next];
        if (!target || target.id === data().activePageId) return;
        setDirection(next > index() ? 1 : -1);
        setActivePage(target.id);
    };

    return (
        <NewTabShell
            pages={pages()}
            index={index()}
            direction={direction()}
            onIndexChange={changePage}
        >
            <PageGrid page={page()!} />
        </NewTabShell>
    );
}
