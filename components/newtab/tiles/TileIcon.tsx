import { Clock, LayoutGrid, Link as LinkIcon, Sparkles } from '@lucide/solid';

import type { IconName, IconSource } from '@/lib/dashboard/types';

const LUCIDE_ICONS = {
    clock: Clock,
    'layout-grid': LayoutGrid,
    link: LinkIcon,
    sparkles: Sparkles,
} satisfies Record<IconName, typeof Clock>;

export default function TileIcon(props: { icon?: IconSource; size?: number }) {
    const size = () => props.size ?? 28;
    const icon = () => props.icon;

    if (!icon()) return <LayoutGrid size={size()} />;

    const source = icon()!;

    if (source.kind === 'emoji') {
        return <span style={`font-size: ${size()}px; line-height: 1;`}>{source.value}</span>;
    }

    if (source.kind === 'image') {
        return <img class="h-full w-full object-contain" src={source.src} alt="" />;
    }

    const Icon = LUCIDE_ICONS[source.name] ?? LayoutGrid;
    return <Icon size={size()} />;
}
