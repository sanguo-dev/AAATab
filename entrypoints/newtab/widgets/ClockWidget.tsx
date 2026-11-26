import { Show, createSignal, onSettled } from 'solid-js';

import { useSettings } from '@/lib/use-settings';

import type { WidgetProps } from './index';

function formatTime(date: Date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/** 系统小组件：时间。1×1 的格子里只放时间。 */
export default function ClockWidget(_props: WidgetProps) {
    const { settings } = useSettings();
    const [now, setNow] = createSignal(new Date());

    onSettled(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    });

    return (
        <section class="flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 text-center">
            <Show when={settings().showClock}>
                <p class="time m-0 bg-gradient-to-b from-white to-blue-200 bg-clip-text font-extralight leading-none tracking-tighter text-transparent tabular-nums text-[clamp(1.5rem,26cqmin,3.5rem)]">
                    {formatTime(now())}
                </p>
            </Show>
        </section>
    );
}
