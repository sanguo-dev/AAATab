import OptionsShell, { type SettingsTab } from '@/components/options/OptionsShell';
import { SettingsProvider } from '@/lib/use-settings';

import { Router } from './router';

const TABS: SettingsTab[] = [
    { path: '/', label: '常规' },
    { path: '/newtab', label: '新标签页' },
];

export default function App() {
    return (
        <SettingsProvider>
            <Router>
                {(props) => <OptionsShell tabs={TABS}>{props.children}</OptionsShell>}
            </Router>
        </SettingsProvider>
    );
}
