import { ChevronLeft, Link, Tag } from '@lucide/solid';
import { For, Show, createSignal, onSettled } from 'solid-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Cell, IconSource } from '@/types/dashboard';

import { readableTextColor } from '../cells/CellIcon';
import { resolveIconCandidates } from '../icons/resolve';
import type { IconCandidate } from '../icons/types';
import { parseWebUrl } from '../icons/url';

type IconTab = 'online' | 'solid' | 'upload';

/**
 * solid-ui 里有 color-picker，但 `components/ui` 没有对应的源码组件，
 * 先按约定给一排预设色，不引第三方色板。
 */
const PALETTE = [
    '#4f8cff',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#a855f7',
    '#06b6d4',
    '#ec4899',
    '#64748b',
] as const;

export interface CustomIconDraft {
    title: string;
    url: string;
    icon?: IconSource;
}

interface CustomIconPageProps {
    mode: 'add' | 'edit';
    /** 编辑时带着原 cell；添加时不传。 */
    cell?: Cell;
    onBack: () => void;
    onSubmit: (draft: CustomIconDraft) => void;
}

function initialIconState(cell?: Cell): {
    tab: IconTab;
    color: string;
    text: string;
    picked: string | null;
} {
    const icon = cell?.icon;

    if (icon?.kind === 'solid') {
        return { tab: 'solid', color: icon.color, text: icon.text ?? '', picked: null };
    }

    if (icon?.kind === 'favicon' && icon.url) {
        return { tab: 'online', color: PALETTE[0], text: '', picked: icon.url };
    }

    return { tab: 'online', color: PALETTE[0], text: '', picked: null };
}

/**
 * 抽屉里的「自定义添加 / 编辑图标」二级页面。
 *
 * 地址用来查在线图标；纯色页签给一排颜色和一个"图标位文字"输入；
 * 本地上传还没做。完成时只往上抛一个 draft，由页面层决定新建还是更新 cell。
 */
export default function CustomIconPage(props: CustomIconPageProps) {
    const cell = props.cell;
    const initial = initialIconState(cell);

    const [url, setUrl] = createSignal(cell?.kind === 'link' ? cell.url : '');
    const [title, setTitle] = createSignal(cell?.title ?? '');
    const [tab, setTab] = createSignal<IconTab>(initial.tab);
    const [color, setColor] = createSignal(initial.color);
    const [iconText, setIconText] = createSignal(initial.text);
    const [picked, setPicked] = createSignal<string | null>(initial.picked);

    const [candidates, setCandidates] = createSignal<IconCandidate[]>([]);
    const [loading, setLoading] = createSignal(false);

    let request = 0;
    let timer: number | undefined;

    const loadIcons = (value: string) => {
        const id = ++request;

        if (!parseWebUrl(value)) {
            setCandidates([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        void resolveIconCandidates(value)
            .then((list) => {
                if (id === request) setCandidates(list);
            })
            .finally(() => {
                if (id === request) setLoading(false);
            });
    };

    const changeUrl = (value: string) => {
        setUrl(value);
        setPicked(null);

        window.clearTimeout(timer);
        timer = window.setTimeout(() => loadIcons(value), 400);
    };

    onSettled(() => {
        if (url().trim()) loadIcons(url());
        return () => window.clearTimeout(timer);
    });

    const canSubmit = () => {
        const valid = parseWebUrl(url().trim()) !== null;
        // 添加必须有地址；编辑时只有链接 cell 才强制地址（自定义 cell 本来就没有）。
        return props.mode === 'add' ? valid : cell?.kind === 'link' ? valid : true;
    };

    const submit = () => {
        const value = url().trim();
        const parsed = parseWebUrl(value);

        let icon: IconSource | undefined;
        if (tab() === 'solid') {
            icon = { kind: 'solid', color: color(), text: iconText().trim() || undefined };
        } else if (tab() === 'online') {
            icon = picked() ? { kind: 'favicon', url: picked()! } : { kind: 'favicon' };
        }

        props.onSubmit({
            title: title().trim() || parsed?.hostname || '未命名',
            url: value,
            icon,
        });
    };

    return (
        <div
            class="flex min-h-0 flex-1 flex-col p-4"
            /* 抽屉里滚轮只归抽屉用，别传出去触发外壳的"滚到底翻页"。 */
            onWheel={(event) => event.stopPropagation()}
        >
            <div class="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" aria-label="返回" onClick={props.onBack}>
                    <ChevronLeft size={16} />
                </Button>
                <span class="flex-1 truncate text-base font-medium">
                    {props.mode === 'add' ? '自定义添加' : '编辑图标'}
                </span>
                <Button size="sm" disabled={!canSubmit()} onClick={submit}>
                    完成
                </Button>
            </div>

            <div class="mt-6 flex flex-col gap-6">
                <div class="relative">
                    <Link class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        class="pl-8 focus-visible:ring-1"
                        value={url()}
                        placeholder="https://example.com"
                        aria-label="链接地址"
                        onInput={(event) => changeUrl(event.currentTarget.value)}
                    />
                </div>
                <div class="relative">
                    <Tag class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        class="pl-8 focus-visible:ring-1"
                        value={title()}
                        placeholder="名称"
                        aria-label="名称"
                        onInput={(event) => setTitle(event.currentTarget.value)}
                    />
                </div>
            </div>

            <Tabs
                value={tab()}
                onValueChange={(value) => setTab((value ?? 'online') as IconTab)}
                class="mt-6 min-h-0 flex-1 gap-2"
            >
                <TabsList class="w-full">
                    <TabsTrigger value="online" class="flex-1">
                        在线图标
                    </TabsTrigger>
                    <TabsTrigger value="solid" class="flex-1">
                        纯色图标
                    </TabsTrigger>
                    <TabsTrigger value="upload" class="flex-1">
                        本地上传
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="online" class="min-h-0 flex-1 overflow-y-auto pt-4 scrollbar-thin">
                    <Show
                        when={!loading()}
                        fallback={
                            <p class="py-8 text-center text-xs text-muted-foreground">
                                正在查找图标…
                            </p>
                        }
                    >
                        <Show
                            when={candidates().length > 0}
                            fallback={
                                <p class="py-8 text-center text-xs text-muted-foreground">
                                    {url().trim()
                                        ? '没有找到图标，保存后会按地址自动解析'
                                        : '输入地址后自动查找图标'}
                                </p>
                            }
                        >
                            <div class="grid grid-cols-5 gap-2">
                                <For each={candidates()}>
                                    {(candidate) => (
                                        <button
                                            type="button"
                                            class={cn(
                                                'grid aspect-square place-items-center rounded-xl border bg-foreground/5 transition-colors hover:bg-foreground/10',
                                                picked() === candidate.url
                                                    ? 'border-primary'
                                                    : 'border-transparent',
                                            )}
                                            title={candidate.url}
                                            onClick={() =>
                                                setPicked(
                                                    picked() === candidate.url
                                                        ? null
                                                        : candidate.url,
                                                )
                                            }
                                        >
                                            <img
                                                src={candidate.url}
                                                alt=""
                                                class="size-7 object-contain"
                                                referrerpolicy="no-referrer"
                                                draggable={false}
                                            />
                                        </button>
                                    )}
                                </For>
                            </div>
                            <p class="mt-3 text-[11px] text-muted-foreground">
                                不选的话，保存后按地址自动取图标。
                            </p>
                        </Show>
                    </Show>
                </TabsContent>

                <TabsContent value="solid" class="min-h-0 flex-1 overflow-y-auto pt-4 scrollbar-thin">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <Label class="text-xs text-muted-foreground">颜色</Label>
                            <div class="flex flex-wrap gap-2">
                                <For each={PALETTE}>
                                    {(value) => (
                                        <button
                                            type="button"
                                            class={cn(
                                                'size-7 rounded-full border-2 transition-transform hover:scale-105',
                                                color() === value
                                                    ? 'border-foreground'
                                                    : 'border-transparent',
                                            )}
                                            style={`background: ${value}`}
                                            title={value}
                                            aria-label={`颜色 ${value}`}
                                            onClick={() => setColor(value)}
                                        />
                                    )}
                                </For>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Label class="text-xs text-muted-foreground">图标位文字</Label>
                            <Input
                                class="w-24 focus-visible:ring-1"
                                value={iconText()}
                                maxlength={2}
                                placeholder="例如 G"
                                aria-label="图标位文字"
                                onInput={(event) => setIconText(event.currentTarget.value)}
                            />
                        </div>

                        <div class="flex items-center gap-3">
                            <span
                                class="grid size-12 place-items-center overflow-hidden rounded-lg font-semibold leading-none"
                                style={`background: ${color()}; color: ${readableTextColor(color())}; font-size: 20px;`}
                            >
                                {iconText().trim()}
                            </span>
                            <span class="text-xs text-muted-foreground">预览</span>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" class="min-h-0 flex-1 overflow-y-auto pt-4 scrollbar-thin">
                    <p class="py-8 text-center text-xs text-muted-foreground">本地上传暂未支持</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}

