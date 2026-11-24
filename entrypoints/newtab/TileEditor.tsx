import type { IconName, Tile } from '@/utils/dashboard/types';
import type { TilePatch } from '@/utils/dashboard/use-dashboard';
import { createSignal } from 'solid-js';

import TileIcon from '@/components/tiles/TileIcon';

const ICON_OPTIONS: { value: IconName; label: string }[] = [
    { value: 'layout-grid', label: '宫格' },
    { value: 'link', label: '链接' },
    { value: 'sparkles', label: '闪光' },
    { value: 'clock', label: '时钟' },
];

const TILE_LABELS = {
    clock: '时钟',
    link: '链接',
    note: '便签',
} as const;

interface TileEditorProps {
    tile: Tile;
    onSave: (patch: TilePatch) => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function TileEditor(props: TileEditorProps) {
    const [title, setTitle] = createSignal(props.tile.title);
    const [iconName, setIconName] = createSignal<IconName>(
        props.tile.icon?.kind === 'lucide' ? props.tile.icon.name : 'layout-grid',
    );
    const [url, setUrl] = createSignal(props.tile.type === 'link' ? props.tile.url : '');
    const [text, setText] = createSignal(props.tile.type === 'note' ? props.tile.text : '');

    const save = () => {
        const patch: TilePatch = {
            title: title().trim() || '未命名',
            icon: { kind: 'lucide', name: iconName() },
        };

        if (props.tile.type === 'link') patch.url = url().trim();
        if (props.tile.type === 'note') patch.text = text();

        props.onSave(patch);
    };

    return (
        <div class="modal modal-open">
            <form
                class="modal-box max-w-lg"
                onSubmit={(event) => {
                    event.preventDefault();
                    save();
                }}
            >
                <h3 class="text-lg font-semibold">编辑{TILE_LABELS[props.tile.type]}</h3>

                <div class="mt-5 flex flex-col gap-4">
                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-base-content/80">标题</span>
                        <input
                            class="input w-full"
                            value={title()}
                            autocomplete="off"
                            onInput={(event) => setTitle(event.currentTarget.value)}
                        />
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-base-content/80">图标</span>
                        <div class="flex items-center gap-3">
                            <span class="grid size-10 flex-none place-items-center rounded-xl border border-base-content/10 bg-base-100/40 text-primary">
                                <TileIcon icon={{ kind: 'lucide', name: iconName() }} size={20} />
                            </span>
                            <select
                                class="select w-full"
                                value={iconName()}
                                onChange={(event) => setIconName(event.currentTarget.value as IconName)}
                            >
                                {ICON_OPTIONS.map((option) => (
                                    <option value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </label>

                    {props.tile.type === 'link' && (
                        <label class="flex flex-col gap-2">
                            <span class="text-sm text-base-content/80">链接地址</span>
                            <input
                                class="input w-full"
                                type="url"
                                value={url()}
                                placeholder="https://"
                                onInput={(event) => setUrl(event.currentTarget.value)}
                            />
                        </label>
                    )}

                    {props.tile.type === 'note' && (
                        <label class="flex flex-col gap-2">
                            <span class="text-sm text-base-content/80">文本</span>
                            <textarea
                                class="textarea w-full"
                                rows={4}
                                value={text()}
                                onInput={(event) => setText(event.currentTarget.value)}
                            />
                        </label>
                    )}
                </div>

                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm text-error" type="button" onClick={props.onDelete}>
                        删除
                    </button>
                    <button class="btn btn-ghost btn-sm" type="button" onClick={props.onClose}>
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" type="submit">
                        保存
                    </button>
                </div>
            </form>
            <div class="modal-backdrop bg-black/50" onClick={props.onClose} />
        </div>
    );
}
