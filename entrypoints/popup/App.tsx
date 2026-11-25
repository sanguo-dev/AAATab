import { ExternalLink, Settings, Sparkles } from '@lucide/solid';
import { browser } from 'wxt/browser';

import { Button } from '@/components/ui/button';

export default function App() {
    const openNewTab = async () => {
        await browser.tabs.create({ url: browser.runtime.getURL('/newtab.html') });
        window.close();
    };

    const openSettings = async () => {
        try {
            await browser.runtime.openOptionsPage();
        } catch {
            await browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
        }
        window.close();
    };

    return (
        <main class="w-72 bg-card p-4 text-card-foreground">
            <header class="mb-4 flex items-center gap-2">
                <Sparkles size={18} class="text-primary" />
                <span class="text-sm font-semibold tracking-wide">AAATab</span>
            </header>

            <div class="flex flex-col gap-2">
                <Button size="sm" class="w-full justify-start" onClick={openNewTab}>
                    <ExternalLink size={16} />
                    打开新标签页
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    class="w-full justify-start"
                    onClick={openSettings}
                >
                    <Settings size={16} />
                    设置
                </Button>
            </div>

            <p class="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
                新标签页已启用 AAATab。
            </p>
        </main>
    );
}
