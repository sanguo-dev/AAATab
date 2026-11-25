# AAATab 项目约束

本文件由 DSH 在每次会话首次请求时自动读取；修改后会在后续请求中重新加载。

## 新标签页网格（硬性约束）

- 网格固定 12 列，单元格固定 **120×120 px**，格间距 **12 px**。
- **禁止**按窗口宽度计算 cell，也**禁止**把 cell clamp 到 40–120 之类的区间；cell 永远是 120。
- 12 列总宽为 `12 × 120 + 11 × 12 = 1572 px`。窗口不足 1572 px 时横向滚动，不压缩格子。
- 行高 120 px，行数随 tile 内容增长，页面纵向滚动。
- 网格常量只允许定义在 `entrypoints/newtab/dashboard/types.ts` 的 `GRID_COLUMNS`、`GRID_CELL_SIZE`、`GRID_GAP`；`PageGrid.tsx` 必须复用这些常量，不得重新推导。
- 拖拽和缩放的步长是 `GRID_CELL_SIZE + GRID_GAP`，不要另写数值。

## UI 组件（硬性约束）

- 只使用 solid-ui-next 的源码组件（`components/ui/`）和其主题（`components/ui/styles/`）；不要引入 daisyUI、Kobalte、Corvu。
- `cn` 统一从 `@/lib/utils` 导入（`clsx` + `tailwind-merge`）。
- `@ui-sdk/solid` 与 `@ui-sdk/core` 必须保持同一版本 `0.1.0-beta.10`，升级时一起改。
- `components/` 只放 solid-ui-next 的 vendored 组件；页面专用组件放在对应 `entrypoints/` 目录。
