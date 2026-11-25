import { AppWindow, CircleCheck, Clock3, ExternalLink } from '@lucide/solid';
import { browser } from 'wxt/browser';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/utils/use-settings';

import Toggle from '../Toggle';

export default function NewTabPage() {
    const { settings, update } = useSettings();

    const openNewTab = () => {
        void browser.tabs.create({ url: browser.runtime.getURL('/newtab.html') });
    };

    return (
        <div class="flex flex-col gap-5">
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Clock3 size={16} class="text-primary" />
                        时间
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-3">
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
                    <Toggle
                        label="显示页码"
                        description="滚动或切换页面时短暂显示底部的页码指示器。"
                        checked={settings().showPageDots}
                        onChange={(showPageDots) => update({ showPageDots })}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <AppWindow size={16} class="text-primary" />
                        新标签页
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-4">
                    <Alert class="border-primary/30 bg-primary/10">
                        <CircleCheck size={18} />
                        <AlertTitle>已启用</AlertTitle>
                        <AlertDescription>打开新标签页时会显示 AAATab。</AlertDescription>
                    </Alert>
                    <p class="text-xs leading-relaxed text-muted-foreground">
                        新标签页由扩展清单设置，浏览器不允许扩展在运行时切换。如需停用，请在浏览器的扩展管理页中关闭本扩展。
                    </p>
                    <Button size="sm" class="self-start" onClick={openNewTab}>
                        <ExternalLink size={16} />
                        预览新标签页
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
