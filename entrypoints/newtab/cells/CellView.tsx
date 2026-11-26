import type { Cell } from '@/types/dashboard';

import CustomCell from './CustomCell';
import LinkCell from './LinkCell';
import WidgetCell from './WidgetCell';

/**
 * 三种 cell 的唯一分发点：
 * - `link` → `LinkCell`
 * - `widget` → `WidgetCell`（系统小组件，按 id 查注册表）
 * - `custom` → `CustomCell`（按 template 查模板注册表）
 */
export default function CellView(props: { cell: Cell; iconOnly?: boolean }) {
    const cell = props.cell;

    // 「只显示图标」只对真的有图标的 cell 生效；没有图标就保持原样。
    const iconOnly = () => !!props.iconOnly && !!cell.icon;

    switch (cell.kind) {
        case 'link':
            return <LinkCell cell={cell} iconOnly={iconOnly()} />;
        case 'widget':
            return <WidgetCell cell={cell} iconOnly={iconOnly()} />;
        default:
            return <CustomCell cell={cell} iconOnly={iconOnly()} />;
    }
}
