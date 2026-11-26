import { Show, createSignal, onSettled } from 'solid-js';

import { useSettings } from '@/lib/use-settings';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function formatTime(date: Date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDate(date: Date) {
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${WEEKDAYS[date.getDay()]}`;
}

function greeting(hour: number) {
    if (hour < 5) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
}

export default function ClockTile(props: { compact?: boolean }) {
    const { settings } = useSettings();
    const [now, setNow] = createSignal(new Date());

    onSettled(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    });

    return (
        <section class="flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 text-center">
            <Show when={settings().showClock}>
                <p
                    class={`time m-0 bg-gradient-to-b from-white to-blue-200 bg-clip-text font-extralight leading-none tracking-tighter text-transparent tabular-nums ${
                        props.compact
                            ? 'text-[clamp(1.5rem,26cqmin,3.5rem)]'
                            : 'text-[clamp(2.5rem,20cqmin,10rem)]'
                    }`}
                >
                    {formatTime(now())}
                </p>
            </Show>

            <Show when={!props.compact}>
                <Show when={settings().showDate}>
                    <p class="date m-0 mt-[0.75em] text-[clamp(0.65rem,2.2cqmin,1rem)] font-light tracking-wide text-muted-foreground">
                        {formatDate(now())}
                    </p>
                </Show>
                <Show when={settings().showGreeting}>
                    <h1 class="greeting m-0 mt-[0.35em] text-[clamp(0.85rem,3.2cqmin,1.875rem)] font-medium tracking-tight text-foreground">
                        {greeting(now().getHours())}，
                        <span class="text-primary">{settings().displayName.trim() || '朋友'}</span>
                    </h1>
                </Show>
            </Show>
        </section>
    );
}
