import { Show, createSignal, onSettled } from 'solid-js';

import { useSettings } from '@/utils/use-settings';

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

export default function ClockPage() {
    const { settings } = useSettings();
    const [now, setNow] = createSignal(new Date());

    onSettled(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    });

    return (
        <section class="flex flex-col items-center text-center">
            <Show when={settings().showClock}>
                <p class="time m-0 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-[clamp(4.5rem,16vw,11rem)] font-extralight leading-none tracking-tighter text-transparent tabular-nums">
                    {formatTime(now())}
                </p>
            </Show>
            <Show when={settings().showDate}>
                <p class="date m-0 mt-4 text-sm font-light tracking-wide text-base-content/60 sm:text-base">
                    {formatDate(now())}
                </p>
            </Show>
            <Show when={settings().showGreeting}>
                <h1 class="greeting m-0 mt-2 text-xl font-medium tracking-tight text-base-content md:text-3xl">
                    {greeting(now().getHours())}，<span class="text-primary">{settings().displayName.trim() || '朋友'}</span>
                </h1>
            </Show>
        </section>
    );
}
