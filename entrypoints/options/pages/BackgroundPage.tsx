import { Image as ImageIcon, Link2, Upload } from '@lucide/solid';
import { For, Show, createEffect, createSignal, onSettled } from 'solid-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeImageUrl, resolveBackground } from '@/lib/background';
import { useSettings } from '@/lib/use-settings';
import { MAX_UPLOAD_BYTES, pruneUploads, saveUpload, validateUpload } from '@/lib/uploads';
import { cn } from '@/lib/utils';
import type { BackgroundSource, ResolvedBackground } from '@/types/background';

type SourceKind = BackgroundSource['kind'];

/**
 * 预设色：前五个是主题里的深色，后面几个沿用图标页的强调色。
 * solid-ui 带 color-picker，但 `components/ui` 里没有对应源码组件，先按约定给一排预设色。
 */
const PALETTE = [
    '#060810',
    '#0b1119',
    '#101722',
    '#172436',
    '#1e293b',
    '#4f8cff',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#a855f7',
    '#06b6d4',
    '#ec4899',
] as const;

const TABS: { value: SourceKind; label: string }[] = [
    { value: 'default', label: '默认' },
    { value: 'solid', label: '纯色' },
    { value: 'bing', label: '必应' },
    { value: 'url', label: '地址' },
    { value: 'upload', label: '上传' },
];

function errorMessage(cause: unknown, fallback: string): string {
    if (cause instanceof Error && cause.message) return cause.message;
    return fallback;
}

export default function BackgroundPage() {
    const { settings, update } = useSettings();

    const initial = settings().background;
    const [tab, setTab] = createSignal<SourceKind>(initial.kind);
    const [resolved, setResolved] = createSignal<ResolvedBackground>();
    const [urlDraft, setUrlDraft] = createSignal(initial.kind === 'url' ? initial.url : '');
    const [status, setStatus] = createSignal('');
    const [error, setError] = createSignal('');
    const [busy, setBusy] = createSignal(false);

    let fileInput: HTMLInputElement | undefined;
    /** 异步解析的代号：只让最后一次的结果落地，顺便释放过期的 `blob:`。 */
    let generation = 0;
    let disposePreview: (() => void) | undefined;
    /** 同一份来源只解析一次：挂载时 onSettled 和 effect 会各触发一次，别重复请求。 */
    let lastSource: BackgroundSource | undefined;
    const [settled, setSettled] = createSignal(false);

    const refresh = () => {
        const source = settings().background;
        if (source === lastSource) return;
        lastSource = source;

        const id = ++generation;
        setSettled(false);

        void resolveBackground(source)
            .then((next) => {
                if (id !== generation) {
                    next.dispose?.();
                    return;
                }
                disposePreview?.();
                disposePreview = next.dispose;
                setResolved(next);
                setSettled(true);
            })
            .catch(() => {
                if (id !== generation) return;
                setResolved(undefined);
                setSettled(true);
            });
    };

    onSettled(() => {
        refresh();
        return () => disposePreview?.();
    });

    createEffect(
        () => settings().background,
        () => refresh(),
    );

    // 设置是异步读回来的：加载完成（或别处改了背景）之后把页签和地址框对齐。
    createEffect(
        () => settings().background,
        (source) => {
            setTab(source.kind);
            if (source.kind === 'url') setUrlDraft(source.url);
        },
    );

    const apply = (background: BackgroundSource) => {
        setError('');
        setStatus('');
        update({ background });
        setTab(background.kind);
    };

    const selectTab = (kind: SourceKind) => {
        setTab(kind);
        setStatus('');
        setError('');

        if (kind === 'default') update({ background: { kind: 'default' } });
        if (kind === 'bing') update({ background: { kind: 'bing', market: 'zh-CN' } });
    };

    const applyUrl = () => {
        const url = normalizeImageUrl(urlDraft());
        if (!url) {
            setError('请填一个 http(s) 开头的图片地址');
            return;
        }
        apply({ kind: 'url', url });
    };

    const onFileChange = async (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;

        const problem = validateUpload(file);
        if (problem) {
            setError(problem);
            return;
        }

        setError('');
        setStatus('');
        setBusy(true);
        try {
            const ref = await saveUpload(file);
            // 背景只有一个槽位：换新图时把库里的旧图清掉。
            await pruneUploads([ref]);
            apply({ kind: 'upload', ref });
            setStatus(`已使用 ${file.name}`);
        } catch (cause) {
            setError(errorMessage(cause, '上传失败'));
        } finally {
            setBusy(false);
        }
    };

    const isSolid = (color: string) => {
        const source = settings().background;
        return source.kind === 'solid' && source.color === color;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <ImageIcon size={16} class="text-primary" />
                    新标签页背景
                </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
                <Tabs
                    value={tab()}
                    onValueChange={(value) => selectTab((value ?? 'default') as SourceKind)}
                    class="gap-3"
                >
                    <TabsList class="w-full">
                        <For each={TABS}>
                            {(item) => (
                                <TabsTrigger value={item.value} class="flex-1">
                                    {item.label}
                                </TabsTrigger>
                            )}
                        </For>
                    </TabsList>

                    <TabsContent value="default" class="flex flex-col gap-3">
                        <p class="text-xs leading-relaxed text-muted-foreground">
                            沿用内置的深色渐变背景，不做任何覆盖。
                        </p>
                    </TabsContent>

                    <TabsContent value="solid" class="flex flex-col gap-3">
                        <div class="flex flex-wrap gap-2">
                            <For each={PALETTE}>
                                {(color) => (
                                    <button
                                        type="button"
                                        class={cn(
                                            'size-8 rounded-full border-2 transition-transform hover:scale-105',
                                            isSolid(color)
                                                ? 'border-foreground'
                                                : 'border-transparent',
                                        )}
                                        style={`background: ${color}`}
                                        title={color}
                                        aria-label={`背景色 ${color}`}
                                        onClick={() => apply({ kind: 'solid', color })}
                                    />
                                )}
                            </For>
                        </div>
                        <p class="text-[11px] text-muted-foreground">
                            选中的颜色会铺满整个新标签页，cell 和搜索框浮在上面。
                        </p>
                    </TabsContent>

                    <TabsContent value="bing" class="flex flex-col gap-3">
                        <Show
                            when={resolved()?.url}
                            fallback={
                                <p class="py-6 text-center text-xs text-muted-foreground">
                                    {settled()
                                        ? '暂时取不到必应壁纸，稍后再试'
                                        : '正在取今天的必应壁纸…'}
                                </p>
                            }
                        >
                            <Preview url={resolved()!.url!} />
                        </Show>
                        <p class="text-[11px] leading-relaxed text-muted-foreground">
                            每天自动换成必应首页的每日一图。图片下载一次后本地也留一份，断网时仍能显示。
                        </p>
                        <Show when={resolved()?.copyright}>
                            <p class="text-[11px] leading-relaxed text-muted-foreground">
                                {resolved()!.title ? `${resolved()!.title} · ` : ''}
                                <Show when={resolved()?.sourceUrl} fallback={resolved()!.copyright}>
                                    <a
                                        class="underline underline-offset-2 hover:text-foreground"
                                        href={resolved()!.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {resolved()!.copyright}
                                    </a>
                                </Show>
                            </p>
                        </Show>
                    </TabsContent>

                    <TabsContent value="url" class="flex flex-col gap-3">
                        <div class="flex gap-2">
                            <Input
                                class="flex-1 focus-visible:ring-1"
                                value={urlDraft()}
                                placeholder="https://example.com/bg.jpg"
                                aria-label="背景图片地址"
                                onInput={(event) => setUrlDraft(event.currentTarget.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyUrl();
                                }}
                            />
                            <Button size="sm" onClick={applyUrl}>
                                <Link2 size={16} />
                                应用
                            </Button>
                        </div>
                        <Show when={resolved()?.url}>
                            <Preview url={resolved()!.url!} />
                        </Show>
                        <p class="text-[11px] leading-relaxed text-muted-foreground">
                            支持 http(s) 直链。图片同样会在本地留一份，地址失效时还能看到旧图。
                        </p>
                    </TabsContent>

                    <TabsContent value="upload" class="flex flex-col gap-3">
                        <div class="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => fileInput?.click()}
                                disabled={busy()}
                            >
                                <Upload size={16} />
                                选择图片
                            </Button>
                            <span class="text-[11px] text-muted-foreground">
                                PNG / JPEG / WebP / GIF / AVIF，20MB 以内
                            </span>
                        </div>
                        <input
                            ref={(element) => {
                                fileInput = element;
                            }}
                            type="file"
                            accept="image/*"
                            class="hidden"
                            aria-hidden="true"
                            tabindex={-1}
                            onChange={onFileChange}
                        />
                        <Show when={resolved()?.url}>
                            <Preview url={resolved()!.url!} />
                        </Show>
                        <p class="text-[11px] leading-relaxed text-muted-foreground">
                            图片只存在这台设备上（IndexedDB），不上传、不联网。
                            {` 单张上限 ${MAX_UPLOAD_BYTES / 1024 / 1024}MB。`}
                        </p>
                    </TabsContent>
                </Tabs>

                <Show when={status()}>
                    <p class="text-xs text-muted-foreground" role="status">
                        {status()}
                    </p>
                </Show>
                <Show when={error()}>
                    <p class="text-xs text-destructive" role="alert">
                        {error()}
                    </p>
                </Show>
            </CardContent>
        </Card>
    );
}

function Preview(props: { url: string }) {
    return (
        <div class="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
            <img src={props.url} alt="" class="h-full w-full object-cover" />
        </div>
    );
}
