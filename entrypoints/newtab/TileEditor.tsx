import { For, createSignal } from 'solid-js';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { IconName, Tile } from './dashboard/types';
import type { TilePatch } from './dashboard/use-dashboard';
import TileIcon from './tiles/TileIcon';
import { resolveTileTemplate, TILE_REGISTRY } from './tiles/registry';

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
    const [template, setTemplate] = createSignal(props.tile.template ?? '');

    const templates = () => TILE_REGISTRY[props.tile.type].templates;

    const templateOptions = () => [
        {
            value: 'auto',
            label: `自动 · 当前为「${resolveTileTemplate(props.tile).label}」`,
        },
        ...templates().map((candidate) => ({
            value: candidate.name,
            label: `${candidate.label} · 至少 ${candidate.minW}×${candidate.minH} 格`,
        })),
    ];

    const save = () => {
        const patch: TilePatch = {
            title: title().trim() || '未命名',
            icon: { kind: 'lucide', name: iconName() },
            template: template() || undefined,
        };

        if (props.tile.type === 'link') patch.url = url().trim();
        if (props.tile.type === 'note') patch.text = text();

        props.onSave(patch);
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) props.onClose();
            }}
        >
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>编辑{TILE_LABELS[props.tile.type]}</DialogTitle>
                    <DialogDescription>
                        当前占用 {props.tile.grid.w}×{props.tile.grid.h} 格 ·
                        编辑模式下拖动右下角可调整大小
                    </DialogDescription>
                </DialogHeader>

                <form
                    class="flex flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        save();
                    }}
                >
                    <div class="flex flex-col gap-2">
                        <Label for="tile-title" class="text-sm font-medium text-foreground">
                            标题
                        </Label>
                        <Input
                            id="tile-title"
                            value={title()}
                            autocomplete="off"
                            onInput={(event) => setTitle(event.currentTarget.value)}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-medium text-foreground">图标</span>
                        <div class="flex items-center gap-3">
                            <span class="grid size-9 flex-none place-items-center rounded-xl border border-border bg-card/60 text-primary">
                                <TileIcon icon={{ kind: 'lucide', name: iconName() }} size={18} />
                            </span>
                            <Select
                                value={iconName()}
                                onValueChange={(value) => {
                                    if (value) setIconName(value as IconName);
                                }}
                            >
                                <SelectTrigger class="w-full" aria-label="选择图标">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <For each={ICON_OPTIONS}>
                                        {(option) => (
                                            <SelectItem value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        )}
                                    </For>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-medium text-foreground">样式模板</span>
                        <Select
                            value={template() || 'auto'}
                            onValueChange={(value) =>
                                setTemplate(!value || value === 'auto' ? '' : value)
                            }
                        >
                            <SelectTrigger class="w-full" aria-label="选择样式模板">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <For each={templateOptions()}>
                                    {(option) => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    )}
                                </For>
                            </SelectContent>
                        </Select>
                        <span class="text-xs leading-relaxed text-muted-foreground">
                            自动模式会按 tile 的实际尺寸挑选模板；显式选择后尺寸变化不再切换。
                        </span>
                    </div>

                    {props.tile.type === 'link' && (
                        <div class="flex flex-col gap-2">
                            <Label for="tile-url" class="text-sm font-medium text-foreground">
                                链接地址
                            </Label>
                            <Input
                                id="tile-url"
                                type="url"
                                value={url()}
                                placeholder="https://"
                                onInput={(event) => setUrl(event.currentTarget.value)}
                            />
                        </div>
                    )}

                    {props.tile.type === 'note' && (
                        <div class="flex flex-col gap-2">
                            <Label for="tile-text" class="text-sm font-medium text-foreground">
                                文本
                            </Label>
                            <Textarea
                                id="tile-text"
                                rows={4}
                                value={text()}
                                onInput={(event) => setText(event.currentTarget.value)}
                            />
                        </div>
                    )}

                    <DialogFooter class="mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            class="text-destructive hover:text-destructive"
                            type="button"
                            onClick={props.onDelete}
                        >
                            删除
                        </Button>
                        <Button variant="ghost" size="sm" type="button" onClick={props.onClose}>
                            取消
                        </Button>
                        <Button size="sm" type="submit">
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
