import type { Component } from 'solid-js';

import type { CustomCell as CustomCellData } from '@/types/dashboard';

import { DEFAULT_CUSTOM_TEMPLATE } from '@/lib/dashboard/cell-kinds';
import DefaultCustomTemplate from './DefaultCustomTemplate';

export interface CustomTemplateProps {
    cell: CustomCellData;
    /** 拖拽期间为 true：只留图标，不渲染文字。 */
    iconOnly?: boolean;
}

export type CustomTemplate = Component<CustomTemplateProps>;

/**
 * 自定义 cell 的模板注册表。键就是数据里存的 `template` id；
 * 没注册的 id 会回退到默认模板，不会把 cell 弄丢。
 */
export const CUSTOM_TEMPLATES: Record<string, CustomTemplate> = {
    [DEFAULT_CUSTOM_TEMPLATE]: DefaultCustomTemplate,
};

export function resolveCustomTemplate(template: string): CustomTemplate {
    return CUSTOM_TEMPLATES[template] ?? CUSTOM_TEMPLATES[DEFAULT_CUSTOM_TEMPLATE]!;
}

/**
 * custom 类 cell：只负责按 template id 找到模板并渲染。
 */
export default function CustomCell(props: { cell: CustomCellData; iconOnly?: boolean }) {
    // template id 在 cell 生命周期内不变，所以这里取一次就够。
    const Template = resolveCustomTemplate(props.cell.template);

    return <Template cell={props.cell} iconOnly={props.iconOnly} />;
}
