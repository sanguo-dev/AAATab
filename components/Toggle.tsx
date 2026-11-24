import { Show } from 'solid-js';

export interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

export default function Toggle(props: ToggleProps) {
    return (
        <label class="flex cursor-pointer items-center justify-between gap-6 py-1">
            <span class="flex flex-col gap-1">
                <span class="text-sm text-base-content/90">{props.label}</span>
                <Show when={props.description}>
                    <span class="text-xs leading-relaxed text-base-content/50">{props.description}</span>
                </Show>
            </span>
            <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={props.checked}
                onChange={(event) => props.onChange(event.currentTarget.checked)}
            />
        </label>
    );
}
