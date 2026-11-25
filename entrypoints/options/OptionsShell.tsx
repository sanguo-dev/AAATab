import { Menu, Sparkles, X } from '@lucide/solid';
import { useLocation } from '@solidjs/router';
import type { JSX } from '@solidjs/web';
import { For, Show, createSignal } from 'solid-js';

import { Button } from '@/components/ui/button';

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
    const [open, setOpen] = createSignal(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div class="min-h-screen bg-background text-foreground">
            <Show when={open()}>
                <div
                    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    aria-hidden="true"
                    onClick={() => setOpen(false)}
                />
            </Show>

            <aside
                class={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card p-4 transition-transform duration-200 lg:translate-x-0 ${
                    open() ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div class="flex items-center gap-2 px-2 py-2">
                    <Sparkles size={18} class="text-primary" />
                    <span class="text-sm font-semibold tracking-wide">AAATab</span>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        class="ml-auto lg:hidden"
                        aria-label="关闭菜单"
                        onClick={() => setOpen(false)}
                    >
                        <X size={18} />
                    </Button>
                </div>

                <nav class="mt-4 flex flex-col gap-1" aria-label="设置导航">
                    <For each={props.tabs}>
                        {(tab) => (
                            <a
                                href={`#${tab.path}`}
                                class={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                                    isActive(tab.path)
                                        ? 'bg-accent font-medium text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                }`}
                                aria-current={isActive(tab.path) ? 'page' : undefined}
                                onClick={() => setOpen(false)}
                            >
                                {tab.label}
                            </a>
                        )}
                    </For>
                </nav>

                <p class="mt-auto px-2 text-[0.7rem] tracking-wider text-muted-foreground/60">
                    WXT + Solid 2
                </p>
            </aside>

            <div class="flex min-h-screen flex-col lg:pl-64">
                <header class="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="打开菜单"
                        onClick={() => setOpen(true)}
                    >
                        <Menu size={18} />
                    </Button>
                    <span class="text-sm font-medium">设置</span>
                </header>

                <main class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-10 sm:py-14">
                    <header class="mb-1">
                        <h1 class="text-3xl font-semibold tracking-tight">
                            {props.tabs.find((tab) => tab.path === location.pathname)?.label ??
                                '设置'}
                        </h1>
                        <p class="mt-2 text-sm text-muted-foreground">
                            自定义你的新标签页。修改会自动保存。
                        </p>
                    </header>

                    {props.children}

                    <footer class="mt-2 text-center text-xs tracking-wider text-muted-foreground/50">
                        AAATab · WXT + Solid 2
                    </footer>
                </main>
            </div>
        </div>
    );
}
