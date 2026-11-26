import { Settings } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { animate } from 'animejs';
import { For, Show, createEffect, createSignal, onSettled } from 'solid-js';
import { browser } from 'wxt/browser';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/lib/use-settings';

export interface ShellPage {
    id: string;
    title: string;
}

interface NewTabShellProps {
    pages: readonly ShellPage[];
    index: number;
    direction: number;
    editing: boolean;
    onIndexChange: (index: number) => void;
    children: JSX.Element;
}

export default function NewTabShell(props: NewTabShellProps) {
    const { settings } = useSettings();
    let scrollRef: HTMLDivElement | undefined;
    let contentRef: HTMLDivElement | undefined;
    let wheelLocked = false;
    let dotsTimer: number | undefined;

    const [dotsVisible, setDotsVisible] = createSignal(false);
    let lastIndex = props.index;

    const flashDots = () => {
        setDotsVisible(true);
        window.clearTimeout(dotsTimer);
        dotsTimer = window.setTimeout(() => setDotsVisible(false), 1400);
    };

    createEffect(
        () => props.index,
        () => {
            if (scrollRef) scrollRef.scrollTop = 0;
            if (contentRef) {
                animate(contentRef, {
                    opacity: [0, 1],
                    x: [props.direction * 32, 0],
                    duration: 420,
                    ease: 'outCubic',
                });
            }
            if (props.index !== lastIndex) {
                lastIndex = props.index;
                flashDots();
            }
        },
    );

    onSettled(() => {
        const element = scrollRef;
        if (!element) {
            return () => window.clearTimeout(dotsTimer);
        }

        const goTo = (next: number) => {
            if (next === props.index || next < 0 || next >= props.pages.length) return;
            wheelLocked = true;
            props.onIndexChange(next);
            window.setTimeout(() => {
                wheelLocked = false;
            }, 480);
        };

        const onWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaY) < 16) return;
            flashDots();
            if (props.editing || wheelLocked) return;

            // 先让页面自己滚；滚到边界后再翻页。
            const atTop = element.scrollTop <= 0;
            const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;

            if (event.deltaY > 0 && atBottom) {
                event.preventDefault();
                goTo(props.index + 1);
            } else if (event.deltaY < 0 && atTop) {
                event.preventDefault();
                goTo(props.index - 1);
            }
        };

        element.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            element.removeEventListener('wheel', onWheel);
            window.clearTimeout(dotsTimer);
        };
    });

    const openSettings = () => {
        void browser.runtime.openOptionsPage().catch(() => {
            void browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
        });
    };

    return (
        <main class="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
            <div class="tab-surface pointer-events-none absolute inset-0" aria-hidden="true" />

            <div class="fixed inset-x-0 top-4 z-40 flex justify-center px-[100px]">
                <Input
                    class="h-10 w-full max-w-xl bg-card/60"
                    placeholder="搜索"
                    aria-label="搜索"
                />
            </div>

            <div class="absolute right-4 top-4 z-40">
                <Button
                    variant="ghost"
                    size="icon"
                    class="size-11 rounded-full border border-border bg-card/40 backdrop-blur-sm"
                    title="设置"
                    aria-label="打开设置"
                    onClick={openSettings}
                >
                    <Settings size={20} />
                </Button>
            </div>

            <div
                ref={(element) => {
                    scrollRef = element;
                }}
                class="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24 pt-24 no-scrollbar"
            >
                <div
                    ref={(element) => {
                        contentRef = element;
                    }}
                    class="min-h-full"
                >
                    {props.children}
                </div>
            </div>

            <Show when={settings().showPageDots && dotsVisible()}>
                <div class="absolute inset-x-0 bottom-4 z-30 flex justify-center">
                    <div class="flex items-center gap-2 rounded-full px-3 py-2">
                        <For each={props.pages}>
                            {(page, index) => (
                                <button
                                    class={`h-2 rounded-full transition-all duration-300 ${
                                        index() === props.index
                                            ? 'w-7 bg-primary'
                                            : 'w-2 bg-foreground/25 hover:bg-foreground/40'
                                    }`}
                                    type="button"
                                    aria-label={page.title}
                                    aria-current={index() === props.index ? 'page' : undefined}
                                    onClick={() => props.onIndexChange(index())}
                                />
                            )}
                        </For>
                    </div>
                </div>
            </Show>
        </main>
    );
}
