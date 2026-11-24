import { Settings } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { animate } from 'animejs';
import { For, createEffect } from 'solid-js';
import { browser } from 'wxt/browser';

export interface ShellPage {
    id: string;
    label: string;
}

interface NewTabShellProps {
    pages: readonly ShellPage[];
    index: number;
    direction: number;
    onIndexChange: (index: number) => void;
    children: JSX.Element;
}

export default function NewTabShell(props: NewTabShellProps) {
    let wheelLocked = false;
    let contentRef: HTMLDivElement | undefined;

    createEffect(
        () => props.index,
        () => {
            if (!contentRef) return;
            animate(contentRef, {
                opacity: [0, 1],
                x: [props.direction * 32, 0],
                duration: 420,
                ease: 'outCubic',
            });
        },
    );

    const goTo = (next: number) => {
        if (next === props.index || next < 0 || next >= props.pages.length) return;
        wheelLocked = true;
        props.onIndexChange(next);
        window.setTimeout(() => {
            wheelLocked = false;
        }, 450);
    };

    const onWheel = (event: WheelEvent) => {
        if (wheelLocked || Math.abs(event.deltaY) < 20) return;
        goTo(props.index + (event.deltaY > 0 ? 1 : -1));
    };

    const openSettings = () => {
        void browser.runtime.openOptionsPage().catch(() => {
            void browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
        });
    };

    return (
        <main
            class="relative min-h-screen overflow-hidden bg-base-100 text-base-content"
            onWheel={onWheel}
        >
            <div class="tab-surface pointer-events-none absolute inset-0" aria-hidden="true" />

            <button
                class="btn btn-circle btn-ghost absolute right-4 top-4 z-20 border border-base-content/10 bg-base-100/30 backdrop-blur-sm"
                type="button"
                title="设置"
                aria-label="打开设置"
                onClick={openSettings}
            >
                <Settings size={20} />
            </button>

            <div
                ref={(element) => {
                    contentRef = element;
                }}
                class="relative z-10 flex min-h-screen items-center justify-center px-6 py-24"
            >
                {props.children}
            </div>

            <div class="absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                <For each={props.pages}>
                    {(page, index) => (
                        <button
                            class={`h-2 rounded-full transition-all duration-300 ${
                                index() === props.index
                                    ? 'w-7 bg-primary'
                                    : 'w-2 bg-base-content/30 hover:bg-base-content/50'
                            }`}
                            type="button"
                            aria-label={page.label}
                            aria-current={index() === props.index ? 'page' : undefined}
                            onClick={() => goTo(index())}
                        />
                    )}
                </For>
            </div>

            <p class="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[0.7rem] tracking-[0.12em] text-base-content/40">
                AAATab · 滚轮翻页 · 齿轮设置
            </p>
        </main>
    );
}
