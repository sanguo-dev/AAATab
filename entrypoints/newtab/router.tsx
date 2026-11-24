import { createRouter, hashHistory } from '@solidjs/router';

import ContentPage from './pages/ContentPage';
import ClockPage from './pages/ClockPage';
import { NEW_TAB_PAGES } from './pages';

const routes = [
    { path: '/', component: ClockPage },
    ...NEW_TAB_PAGES.filter((page) => page.slug !== '').map((page) => ({
        path: `/${page.slug}`,
        component: () => <ContentPage page={page} />,
    })),
    // Extension routes are fixed; an unknown hash just falls back to the first page.
    { path: '*', component: ClockPage },
];

export const Router = createRouter({
    routes,
    history: hashHistory(),
});

export const { paths } = Router;
