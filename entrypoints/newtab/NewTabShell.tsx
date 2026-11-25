import { Check, Pencil, Settings } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { animate } from 'animejs';
import { For, Show, createEffect, onSettled } from 'solid-js';
import { browser } from 'wxt/browser';

import { Button } from '@/components/ui/button';

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
    onToggleEditing: () => void;
    children: JSX.Element;
}

export default function NewTabShell(props: NewTabShellProps) {
    let scrollRef: HTMLDivElement | undefined;
    let contentRef: HTMLDivElement | undefined;
    let wheelLocked = false;

    createEffect(
        () => props.index,
        () => {
            if (scrollRef) scrollRef.scrollTop = 0;
            if (!contentRef) return;

            animate(contentRef, {
                opacity: [0, 1],
                x: [props.direction * 32, 0],
                duration: 420,
                ease: 'outCubic',
            });
        },
    );

    onSettled(() => {
        const element = scrollRef;
        if (!element) return;

        const goTo = (next: number) => {
            if (next === props.index || next < 0 || next >= props.pages.length) return;
            wheelLocked = true;
            props.onIndexChange(next);
            window.setTimeout(() => {
                wheelLocked = false;
            }, 480);
        };

        const onWheel = (event: WheelEvent) => {
            if (props.editing || wheelLocked || Math.abs(event.deltaY) < 16) return;

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
        return () => element.removeEventListener('wheel', onWheel);
    });

    const openSettings = () => {
        void browser.runtime.openOptionsPage().catch(() => {
            void browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
        });
    };

    return (
        <main class="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
            <div class="tab-surface pointer-events-none absolute inset-0" aria-hidden="true" />

            <div class="absolute right-4 top-4 z-30 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    class="size-11 rounded-full border border-border bg-card/40 backdrop-blur-sm"
                    title={props.editing ? '完成编辑' : '编辑页面'}
                    aria-label={props.editing ? '完成编辑' : '编辑页面'}
                    aria-pressed={props.editing ? 'true' : 'false'}
                    onClick={props.onToggleEditing}
                >
                    <Show when={props.editing} fallback={<Pencil size={20} />}>
                        <Check size={20} />
                    </Show>
                </Button>
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
                class="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
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

            <div class="relative z-20 flex flex-none flex-col items-center gap-2 pb-4">
                <div class="flex items-center gap-2">
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

                <p class="text-[0.7rem] tracking-[0.12em] text-muted-foreground/60">
                    AAATab · 滚轮翻页 · 齿轮设置
                </p>
            </div>
        </main>
    );
}
