import { createSignal } from 'solid-js';

import NewTabShell from '@/components/layout/NewTabShell';
import { SettingsProvider } from '@/utils/use-settings';

import { NEW_TAB_PAGES } from './pages';
import PageView from './pages/PageView';

export default function App() {
    const [index, setIndex] = createSignal(0);
    const [direction, setDirection] = createSignal(1);
    const page = () => NEW_TAB_PAGES[index()] ?? NEW_TAB_PAGES[0]!;

    const changePage = (next: number) => {
        if (next === index() || next < 0 || next >= NEW_TAB_PAGES.length) return;
        setDirection(next > index() ? 1 : -1);
        setIndex(next);
    };

    return (
        <SettingsProvider>
            <NewTabShell
                pages={NEW_TAB_PAGES}
                index={index()}
                direction={direction()}
                onIndexChange={changePage}
            >
                <PageView page={page()} />
            </NewTabShell>
        </SettingsProvider>
    );
}
