import { Menu, Sparkles } from '@lucide/solid';
import { useLocation } from '@solidjs/router';
import type { JSX } from '@solidjs/web';
import { For } from 'solid-js';

export interface SettingsTab {
    path: string;
    label: string;
}

interface OptionsShellProps {
    tabs: readonly SettingsTab[];
    children: JSX.Element;
}

const DRAWER_ID = 'options-drawer';

export default function OptionsShell(props: OptionsShellProps) {
    const location = useLocation();

    const closeDrawer = () => {
        const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement | null;
        if (toggle) toggle.checked = false;
    };

    return (
        <div class="drawer min-h-screen lg:drawer-open">
            <input id={DRAWER_ID} type="checkbox" class="drawer-toggle" />

            <div class="drawer-content flex min-h-screen flex-col bg-gradient-to-br from-base-300 via-base-200 to-base-100">
                <header class="navbar sticky top-0 z-10 border-b border-base-content/10 bg-base-100/80 backdrop-blur lg:hidden">
                    <label for={DRAWER_ID} class="btn btn-square btn-ghost btn-sm" aria-label="打开菜单">
                        <Menu size={18} />
                    </label>
                    <span class="ml-2 text-sm font-semibold">设置</span>
                </header>

                <main class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-10 sm:py-14">
                    <header class="mb-1">
                        <h1 class="text-3xl font-semibold tracking-tight">
                            {props.tabs.find((tab) => tab.path === location.pathname)?.label ?? '设置'}
                        </h1>
                        <p class="mt-2 text-sm text-base-content/60">自定义你的新标签页。修改会自动保存。</p>
                    </header>

                    {props.children}

                    <footer class="mt-2 text-center text-xs tracking-wider text-base-content/40">
                        AAATab · WXT + Solid 2
                    </footer>
                </main>
            </div>

            <div class="drawer-side z-20">
                <label for={DRAWER_ID} aria-label="关闭菜单" class="drawer-overlay" />
                <aside class="flex min-h-full w-64 flex-col border-r border-base-content/10 bg-base-200 p-4">
                    <div class="flex items-center gap-2 px-2 py-2">
                        <Sparkles size={18} class="text-primary" />
                        <span class="text-sm font-semibold tracking-wide">AAATab</span>
                    </div>

                    <ul class="menu mt-4 w-full gap-1">
                        <For each={props.tabs}>
                            {(tab) => (
                                <li>
                                    <a
                                        href={`#${tab.path}`}
                                        class={location.pathname === tab.path ? 'menu-active' : ''}
                                        aria-current={location.pathname === tab.path ? 'page' : undefined}
                                        onClick={closeDrawer}
                                    >
                                        {tab.label}
                                    </a>
                                </li>
                            )}
                        </For>
                    </ul>

                    <p class="mt-auto px-2 text-[0.7rem] tracking-wider text-base-content/40">
                        WXT + Solid 2
                    </p>
                </aside>
            </div>
        </div>
    );
}
