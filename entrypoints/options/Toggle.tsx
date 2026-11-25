import { Show } from 'solid-js';

import { Switch } from '@/components/ui/switch';

export interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

export default function Toggle(props: ToggleProps) {
    return (
        <div class="flex items-center justify-between gap-6 py-1">
            <div class="flex flex-col gap-1">
                <span class="text-sm font-medium text-foreground">{props.label}</span>
                <Show when={props.description}>
                    <span class="text-xs leading-relaxed text-muted-foreground">
                        {props.description}
                    </span>
                </Show>
            </div>
            <Switch
                checked={props.checked}
                onCheckedChange={(checked) => props.onChange(checked)}
                aria-label={props.label}
            />
        </div>
    );
}
