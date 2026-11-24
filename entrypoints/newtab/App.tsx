import NewTabShell from '@/components/layout/NewTabShell';
import { SettingsProvider } from '@/utils/use-settings';

import { NEW_TAB_PAGES } from './pages';
import { Router } from './router';

export default function App() {
    return (
        <SettingsProvider>
            <Router>
                {(props) => <NewTabShell pages={NEW_TAB_PAGES}>{props.children}</NewTabShell>}
            </Router>
        </SettingsProvider>
    );
}
