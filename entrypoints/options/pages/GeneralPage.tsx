import { UserRound } from '@lucide/solid';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/lib/use-settings';

export default function GeneralPage() {
    const { settings, update } = useSettings();

    return (
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <UserRound size={16} class="text-primary" />
                    问候
                </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-5">
                <div class="flex flex-col gap-2">
                    <Label for="display-name" class="text-sm font-medium text-foreground">
                        你的名字
                    </Label>
                    <Input
                        id="display-name"
                        type="text"
                        class="focus-visible:ring-1"
                        value={settings().displayName}
                        maxlength="24"
                        placeholder="朋友"
                        autocomplete="off"
                        onInput={(event) => update({ displayName: event.currentTarget.value })}
                    />
                    <p class="text-xs text-muted-foreground">
                        留空时，新标签页会称呼你为“朋友”。
                    </p>
                </div>
                <div class="flex items-center justify-between gap-6 py-1">
                    <div class="flex flex-col gap-1">
                        <span class="text-sm font-medium text-foreground">显示问候语</span>
                        <span class="text-xs leading-relaxed text-muted-foreground">
                            根据当前时间显示“早上好”“下午好”等问候。
                        </span>
                    </div>
                    <Switch
                        checked={settings().showGreeting}
                        onCheckedChange={(showGreeting) => update({ showGreeting })}
                        aria-label="显示问候语"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
