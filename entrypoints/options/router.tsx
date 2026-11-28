import { createRouter, hashHistory } from '@solidjs/router';

import DataPage from './pages/DataPage';
import GeneralPage from './pages/GeneralPage';
import NewTabPage from './pages/NewTabPage';

export const Router = createRouter({
    routes: [
        { path: '/', component: GeneralPage },
        { path: '/newtab', component: NewTabPage },
        { path: '/data', component: DataPage },
        // Extension routes are fixed; an unknown hash just falls back to general settings.
        { path: '*', component: GeneralPage },
    ],
    history: hashHistory(),
});

export const { paths } = Router;
