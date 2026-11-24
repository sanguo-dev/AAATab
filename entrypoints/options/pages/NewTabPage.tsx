import { AppWindow, CircleCheck, Clock3, ExternalLink } from '@lucide/solid';
import { browser } from 'wxt/browser';

import Toggle from '@/components/Toggle';
import { useSettings } from '@/utils/use-settings';

export default function NewTabPage() {
    const { settings, update } = useSettings();

    const openNewTab = () => {
        void browser.tabs.create({ url: browser.runtime.getURL('/newtab.html') });
    };

    return (
        <div class="flex flex-col gap-5">
            <section class="card border border-base-content/10 bg-base-100/70 shadow-xl backdrop-blur">
                <div class="card-body gap-5">
                    <h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">
                        <Clock3 size={16} class="text-primary" />
                        时间
                    </h2>
                    <Toggle
                        label="显示时钟"
                        description="在新标签页中央显示当前时间。"
                        checked={settings().showClock}
                        onChange={(showClock) => update({ showClock })}
                    />
                    <Toggle
                        label="显示日期"
                        description="在时钟下方显示日期和星期。"
                        checked={settings().showDate}
                        onChange={(showDate) => update({ showDate })}
                    />
                </div>
            </section>

            <section class="card border border-base-content/10 bg-base-100/70 shadow-xl backdrop-blur">
                <div class="card-body gap-4">
                    <h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">
                        <AppWindow size={16} class="text-primary" />
                        新标签页
                    </h2>
                    <div class="alert alert-success alert-soft">
                        <CircleCheck size={18} />
                        <span>已启用：打开新标签页时会显示 AAATab。</span>
                    </div>
                    <p class="text-xs leading-relaxed text-base-content/50">
                        新标签页由扩展清单设置，浏览器不允许扩展在运行时切换。如需停用，请在浏览器的扩展管理页中关闭本扩展。
                    </p>
                    <button class="btn btn-primary btn-sm self-start" type="button" onClick={openNewTab}>
                        <ExternalLink size={16} />
                        预览新标签页
                    </button>
                </div>
            </section>
        </div>
    );
}
