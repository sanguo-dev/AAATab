import { LayoutGrid, Link as LinkIcon, Sparkles } from '@lucide/solid';
import { useNavigate } from '@solidjs/router';
import { Match, Switch } from 'solid-js';

import type { NewTabPageConfig, NewTabPageIcon } from '../pages';

function PageIcon(props: { icon?: NewTabPageIcon }) {
    return (
        <Switch fallback={<LayoutGrid size={30} />}>
            <Match when={props.icon === 'layout-grid'}>
                <LayoutGrid size={30} />
            </Match>
            <Match when={props.icon === 'link'}>
                <LinkIcon size={30} />
            </Match>
            <Match when={props.icon === 'sparkles'}>
                <Sparkles size={30} />
            </Match>
        </Switch>
    );
}

export default function ContentPage(props: { page: NewTabPageConfig }) {
    const navigate = useNavigate();

    return (
        <section class="flex max-w-lg flex-col items-center text-center">
            <div class="grid size-16 place-items-center rounded-2xl border border-base-content/10 bg-base-100/40 text-primary backdrop-blur">
                <PageIcon icon={props.page.icon} />
            </div>
            <h1 class="mt-5 text-2xl font-semibold tracking-tight">{props.page.title ?? props.page.label}</h1>
            <p class="mt-2 text-sm leading-relaxed text-base-content/60">{props.page.description}</p>
            <button class="btn btn-ghost btn-sm mt-2" type="button" onClick={() => void navigate('/')}>
                返回第一页
            </button>
        </section>
    );
}
