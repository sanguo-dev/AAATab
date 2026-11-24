import { Match, Switch } from 'solid-js';

import type { NewTabPageConfig } from '../pages';
import ClockPage from './ClockPage';
import ContentPage from './ContentPage';

export default function PageView(props: { page: NewTabPageConfig }) {
    return (
        <Switch>
            <Match when={props.page.kind === 'clock'}>
                <ClockPage />
            </Match>
            <Match when={props.page.kind === 'content'}>
                <ContentPage page={props.page} />
            </Match>
        </Switch>
    );
}
