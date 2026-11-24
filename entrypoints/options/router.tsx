import { createRouter, hashHistory } from '@solidjs/router';

import GeneralPage from './pages/GeneralPage';
import NewTabPage from './pages/NewTabPage';

export const Router = createRouter({
    routes: [
        { path: '/', component: GeneralPage },
        { path: '/newtab', component: NewTabPage },
        // Extension routes are fixed; an unknown hash just falls back to general settings.
        { path: '*', component: GeneralPage },
    ],
    history: hashHistory(),
});

export const { paths } = Router;
