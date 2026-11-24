import { UserRound } from '@lucide/solid';

import Toggle from '@/components/Toggle';
import { useSettings } from '@/utils/use-settings';

export default function GeneralPage() {
    const { settings, update } = useSettings();

    return (
        <section class="card border border-base-content/10 bg-base-100/70 shadow-xl backdrop-blur">
            <div class="card-body gap-5">
                <h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">
                    <UserRound size={16} class="text-primary" />
                    问候
                </h2>
                <label class="flex flex-col gap-2">
                    <span class="text-sm text-base-content/80">你的名字</span>
                    <input
                        class="input w-full"
                        type="text"
                        value={settings().displayName}
                        maxlength="24"
                        placeholder="朋友"
                        autocomplete="off"
                        onInput={(event) => update({ displayName: event.currentTarget.value })}
                    />
                    <span class="text-xs text-base-content/50">留空时，新标签页会称呼你为“朋友”。</span>
                </label>
                <Toggle
                    label="显示问候语"
                    description="根据当前时间显示“早上好”“下午好”等问候。"
                    checked={settings().showGreeting}
                    onChange={(showGreeting) => update({ showGreeting })}
                />
            </div>
        </section>
    );
}
