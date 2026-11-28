import { Plus, Sparkles } from '@lucide/solid';
import { For, Show, createSignal } from 'solid-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

    /** 页签条：隐藏滚动条，但可以按住拖动来滑动。 */
    let tabStrip: HTMLDivElement | undefined;
    let sliding: { startX: number; startLeft: number; moved: boolean } | null = null;

    const scroller = () => tabStrip?.firstElementChild as HTMLElement | undefined;

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
     * 是否"需要居中"必须在 SDK 自己那次"滚进视野"之前判断：先按下时页签被裁切了才居中，
     * 否则（前几个、本来就看得到）什么都不做。
     */
    let pendingCenter: string | null = null;

    const tabAt = (value: string) => {
        const list = scroller();
        if (!list) return null;

        const index = TAB_GROUPS.findIndex((group) => group.id === value);
        const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[index];
        if (!tab) return null;

        return { list, tab, listBox: list.getBoundingClientRect(), tabBox: tab.getBoundingClientRect() };
    };

    /** pointerdown 时快照：当时被裁切才记下来，等 click 之后居中。 */
    const noteCenterNeed = (value: string) => {
        pendingCenter = null;

        const hit = tabAt(value);
        if (!hit) return;

        const { listBox, tabBox } = hit;
        if (tabBox.left < listBox.left || tabBox.right > listBox.right) pendingCenter = value;
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
                class="min-h-0 flex-1"
            >
                {/*
                 * 页签条横向滑动：no-scrollbar 隐藏滚动条，pointer 拖动带动 scrollLeft。
                 * 不 setPointerCapture，否则普通点击会被劫持、页签选不中。
                 */}
                <div
                    ref={(element) => {
                        tabStrip = element;
                    }}
                    class="w-full select-none"
                    onPointerDown={startSlide}
                    onPointerMove={slide}
                    onPointerUp={endSlide}
                    onPointerLeave={endSlide}
                >
                    <TabsList class="w-full justify-start gap-1 overflow-x-auto no-scrollbar group-data-horizontal/tabs:h-11">
                        <For each={TAB_GROUPS}>
                            {(group) => (
                                <TabsTrigger
                                    value={group.id}
                                    class="px-5 text-sm"
                                    onPointerDown={() => noteCenterNeed(group.id)}
                                    onClick={() => {
                                        // 按下时被裁切过才居中；等 SDK 选完再动，免得被它覆盖。
                                        const value = pendingCenter;
                                        pendingCenter = null;
                                        if (value === group.id) {
                                            window.setTimeout(() => applyCenter(value), 0);
                                        }
                                    }}
                                >
                                    {group.title}
                                </TabsTrigger>
                            )}
                        </For>
                    </TabsList>
                </div>

                <For each={TAB_GROUPS}>
                    {(group) => (
                        <TabsContent value={group.id} class="min-h-0 overflow-y-auto">
                            <Show
                                when={visible(group.items).length > 0}
                                fallback={
                                    <p class="px-1 py-6 text-center text-xs text-muted-foreground">
                                        没有匹配的图标
                                    </p>
                                }
                            >
                                <div class="grid grid-cols-4 gap-1 pt-1">
                                    <For each={visible(group.items)}>
                                        {(item) => (
                                            <button
                                                type="button"
                                                class="flex flex-col items-center gap-1 rounded-lg px-1 py-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                                title={item.url}
                                                onClick={() => props.onAddLink(item)}
                                            >
                                                <span class="grid size-9 place-items-center rounded-lg bg-muted/60">
                                                    <CellIcon
                                                        icon={{ kind: 'favicon' }}
                                                        url={item.url}
                                                        size={22}
                                                        preview
                                                    />
                                                </span>
                                                <span class="w-full truncate text-center text-[11px] text-foreground">
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
