import { Plus, Sparkles } from '@lucide/solid';
import { For, Show, createSignal, onSettled } from 'solid-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GRID_CELL_SIZE } from '@/types/dashboard';
import CellIcon from '../cells/CellIcon';
import {
    ALL_ITEMS,
    CATEGORIES,
    FAVORITE_ITEMS,
    type CatalogCategory,
    type CatalogItem,
} from './catalog';

const ALL_TAB = 'all';
const FAVORITE_TAB = 'favorite';

interface TabGroup {
    id: string;
    title: string;
    items: CatalogItem[];
}

/** 页签 = 「全部」+「最受喜爱」+ 各分类。 */
const TAB_GROUPS: TabGroup[] = [
    { id: ALL_TAB, title: '全部', items: ALL_ITEMS },
    { id: FAVORITE_TAB, title: '最受喜爱', items: FAVORITE_ITEMS },
    ...CATEGORIES.map((category: CatalogCategory) => ({
        id: category.id,
        title: category.title,
        items: category.items,
    })),
];

interface AddCellDrawerProps {
    /** 点某个图标：把它作为一个 link cell 加到当前页。 */
    onAddLink: (item: CatalogItem) => void;
}

/**
 * 「添加」抽屉的内容：两个入口按钮 + 搜索 + 分类页签 + 图标网格。
 *
 * 滚动由图标网格自己负责（抽屉本身不滚），符合"抽屉不要滚动条"的约束。
 */
export default function AddCellDrawer(props: AddCellDrawerProps) {
    const [query, setQuery] = createSignal('');
    const [tab, setTab] = createSignal(ALL_TAB);

    /** 页签条左右两边还有没有没露出来的内容，决定要不要画边缘阴影。 */
    const [edges, setEdges] = createSignal({ left: false, right: false });

    /** 页签条：隐藏滚动条，但可以按住拖动来滑动。 */
    let tabStrip: HTMLDivElement | undefined;
    let sliding: { startX: number; startLeft: number; moved: boolean } | null = null;

    const scroller = () => tabStrip?.firstElementChild as HTMLElement | undefined;

    const updateEdges = () => {
        const list = scroller();
        if (!list) return;

        const remaining = list.scrollWidth - list.clientWidth - list.scrollLeft;
        setEdges({ left: list.scrollLeft > 1, right: remaining > 1 });
    };

    onSettled(() => {
        const list = scroller();
        if (!list) return;

        list.addEventListener('scroll', updateEdges, { passive: true });

        // 抽屉宽度变化（打开、窗口缩放）会改变可滚动量，阴影跟着重算。
        const observer = new ResizeObserver(updateEdges);
        observer.observe(list);
        updateEdges();

        return () => {
            list.removeEventListener('scroll', updateEdges);
            observer.disconnect();
        };
    });

    const startSlide = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const element = scroller();
        if (!element) return;

        sliding = { startX: event.clientX, startLeft: element.scrollLeft, moved: false };
    };

    const slide = (event: PointerEvent) => {
        if (!sliding) return;
        const element = scroller();
        if (!element) return;

        const delta = event.clientX - sliding.startX;
        if (Math.abs(delta) > 4) sliding.moved = true;
        element.scrollLeft = sliding.startLeft - delta;
    };

    const endSlide = () => {
        // 拖动过的那一次，不要在 pointerup 之后的 click 里切换页签。
        // 加一个自解除：拖动没有产生 click 时，别把这个拦截留到下一次点击。
        if (sliding?.moved) {
            const swallow = (event: Event) => {
                event.stopPropagation();
                event.preventDefault();
            };
            document.addEventListener('click', swallow, { capture: true, once: true });
            window.setTimeout(
                () => document.removeEventListener('click', swallow, { capture: true }),
                300,
            );
        }
        sliding = null;
    };

    /**
     * 点击页签时把它滚到中间（类似 swiper）。
     *
     * 一律居中，靠 clamp 收边：左边的页签没有足够的滚动余量，自然就停在
     * scrollLeft = 0，不会硬挤出空白。
     */
    const tabAt = (value: string) => {
        const list = scroller();
        if (!list) return null;

        const index = TAB_GROUPS.findIndex((group) => group.id === value);
        const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[index];
        if (!tab) return null;

        return { list, tab, listBox: list.getBoundingClientRect(), tabBox: tab.getBoundingClientRect() };
    };

    const applyCenter = (value: string) => {
        const hit = tabAt(value);
        if (!hit) return;

        const { list, listBox, tabBox } = hit;
        const centered =
            list.scrollLeft + (tabBox.left - listBox.left) - (listBox.width - tabBox.width) / 2;

        list.scrollTo({
            left: Math.min(Math.max(centered, 0), list.scrollWidth - list.clientWidth),
            behavior: 'smooth',
        });
    };

    const visible = (items: CatalogItem[]) => {
        const keyword = query().trim().toLowerCase();
        if (!keyword) return items;

        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(keyword) ||
                item.url.toLowerCase().includes(keyword),
        );
    };

    return (
        <div
            class="flex min-h-0 flex-1 flex-col gap-3 p-4"
            /* 抽屉里滚轮只归抽屉用，别传出去触发外壳的"滚到底翻页"。 */
            onWheel={(event) => event.stopPropagation()}
        >
            <div class="grid grid-cols-2 gap-2">
                {/* 两个入口都还没实现，先占位。 */}
                <Button variant="outline" size="sm" disabled title="自定义（待实现）">
                    <Sparkles size={14} />
                    自定义
                </Button>
                <Button variant="outline" size="sm" disabled title="添加组件（待实现）">
                    <Plus size={14} />
                    添加组件
                </Button>
            </div>

            <Input
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
                placeholder="搜索图标"
                aria-label="搜索图标"
                class="h-9"
            />

            <Tabs
                value={tab()}
                onValueChange={(value) => setTab(value ?? ALL_TAB)}
                class="min-h-0 flex-1 gap-0"
            >
                {/*
                 * 页签条横向滑动：no-scrollbar 隐藏滚动条，pointer 拖动带动 scrollLeft。
                 * 不 setPointerCapture，否则普通点击会被劫持、页签选不中。
                 */}
                <div
                    ref={(element) => {
                        tabStrip = element;
                    }}
                    class="relative w-full select-none"
                    onPointerDown={startSlide}
                    onPointerMove={slide}
                    onPointerUp={endSlide}
                    onPointerLeave={endSlide}
                >
                    <TabsList class="tab-strip w-full justify-start gap-0 overflow-x-auto no-scrollbar rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-9">
                        <For each={TAB_GROUPS}>
                            {(group) => (
                                <TabsTrigger
                                    value={group.id}
                                    class="cell-tab"
                                    onClick={() => {
                                        // 等 SDK 自己那次"滚进视野"结束后再居中，免得被它覆盖。
                                        window.setTimeout(() => applyCenter(group.id), 0);
                                    }}
                                >
                                    {group.title}
                                </TabsTrigger>
                            )}
                        </For>
                    </TabsList>

                    {/* 左右还有内容时压一层深色渐隐，提示可以继续滑。 */}
                    <Show when={edges().left}>
                        <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent" />
                    </Show>
                    <Show when={edges().right}>
                        <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent" />
                    </Show>
                </div>

                <For each={TAB_GROUPS}>
                    {(group) => (
                        <TabsContent value={group.id} class="min-h-0 overflow-y-auto scrollbar-thin">
                            <Show
                                when={visible(group.items).length > 0}
                                fallback={
                                    <p class="px-1 py-6 text-center text-xs text-muted-foreground">
                                        没有匹配的图标
                                    </p>
                                }
                            >
                                <div class="grid grid-cols-2 gap-3 pt-4">
                                    <For each={visible(group.items)}>
                                        {(item) => (
                                            <button
                                                type="button"
                                                class="flex w-full flex-col items-center justify-center gap-1 rounded-3xl bg-foreground/5 p-2 text-center transition-colors hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:outline-none"
                                                style={`height: ${GRID_CELL_SIZE}px`}
                                                title={item.url}
                                                onClick={() => props.onAddLink(item)}
                                            >
                                                <span class="grid size-[60px] flex-none place-items-center text-primary">
                                                    <CellIcon
                                                        icon={{ kind: 'favicon' }}
                                                        url={item.url}
                                                        size={60}
                                                        preview
                                                    />
                                                </span>
                                                <span class="block h-[20px] w-full mt-1 truncate text-xs font-medium leading-5 text-foreground">
                                                    {item.title}
                                                </span>
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </TabsContent>
                    )}
                </For>
            </Tabs>
        </div>
    );
}
