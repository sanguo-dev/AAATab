import { Sparkles } from '@lucide/solid';
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

export default function OptionsShell(props: OptionsShellProps) {
    const location = useLocation();

    return (
        <main class="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-100 px-4 py-14 text-base-content sm:py-20">
            <div class="mx-auto flex w-full max-w-2xl flex-col gap-5">
                <header class="mb-1">
                    <p class="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
                        <Sparkles size={14} />
                        AAATab
                    </p>
                    <h1 class="mt-3 text-3xl font-semibold tracking-tight">设置</h1>
                    <p class="mt-2 text-sm text-base-content/60">自定义你的新标签页。修改会自动保存。</p>
                </header>

                <div role="tablist" class="tabs tabs-box w-fit">
                    <For each={props.tabs}>
                        {(tab) => (
                            <a
                                role="tab"
                                class={`tab ${location.pathname === tab.path ? 'tab-active' : ''}`}
                                href={`#${tab.path}`}
                            >
                                {tab.label}
                            </a>
                        )}
                    </For>
                </div>

                {props.children}

                <footer class="mt-2 text-center text-xs tracking-wider text-base-content/40">
                    AAATab · WXT + Solid 2
                </footer>
            </div>
        </main>
    );
}
