import type { IconSource } from '@/types/dashboard';

export interface CellIconProps {
    /** 没指定时：cell 有地址就按 favicon 处理，否则留空占位。 */
    icon?: IconSource;
    /** cell 的地址。favicon 来源要靠它取图标，目前还没实现，只参与来源判定。 */
    url?: string;
    size?: number;
}

/** 取不到图标、`favicon` 未实现、`upload` 未实现时的占位。 */
function IconPlaceholder(props: { size: number }) {
    return (
        <span
            class="block rounded-lg border border-dashed border-foreground/20"
            style={`width: ${props.size}px; height: ${props.size}px;`}
            aria-hidden="true"
        />
    );
}

/** 纯色块，占满图标槽位。 */
function SolidIcon(props: { color: string; size: number }) {
    return (
        <span
            class="block rounded-lg"
            style={`width: ${props.size}px; height: ${props.size}px; background: ${props.color};`}
            aria-hidden="true"
        />
    );
}

/**
 * cell 图标的唯一渲染点：按三种来源分派。
 *
 * 还没实现的部分（见 Todo「网络搜索展示功能」）：
 * - `favicon`：抓取地址对应的图标 + 网络搜索候选 + 剪裁缩放；
 * - `upload`：用户上传。
 * 现在这两者都渲染占位，等抽屉里的图标编辑做完再接。
 */
export default function CellIcon(props: CellIconProps) {
    const size = () => props.size ?? 28;
    const source = () => props.icon ?? (props.url ? ({ kind: 'favicon' } as const) : undefined);
    const icon = source();

    if (icon?.kind === 'solid') return <SolidIcon color={icon.color} size={size()} />;

    return <IconPlaceholder size={size()} />;
}
