# AAATab 项目约束

本文件由 DSH 在每次会话首次请求时自动读取；修改后会在后续请求中重新加载。

## 工作方式

- **不要修改 `README.md`**，除非用户明确要求。
- **不要在 `C:\Users\v\AppData\Local\` 下创建临时工程、安装依赖或跑测试**。构建、类型检查和测试只在项目目录内执行；临时文件放项目内并在完成后清理。除非用户明确要求
- **不要自行发明布局、列数、尺寸、间距等规格**。用户没有明确给出的，先问，不要写进代码或约束文件。
- 不要为了验证而擅自搭脚手架或跑与本任务无关的测试。

## UI 组件

- UI 组件只用 solid-ui 的源码组件（`components/ui/`，由 `solidui-cli` 安装的 copy-and-own 源码），主题只用 `assets/solid-ui.css`（CLI 生成，勿手改）；不要再往项目里加 `style-nova.css` / `.style-nova`，也不要在组件里写 `cn-*` 语义类名。不要引入 daisyUI、Kobalte、Corvu。
- `cn` 统一从 `@/lib/utils` 导入（`clsx` + `tailwind-merge`）。
- `@ui-sdk/solid` 与 `@ui-sdk/core` 必须保持同一版本 `0.1.0-beta.17`，升级时一起改。
- `components/` 只放 `ui/`（solid-ui 源码）和跨页面通用的 `layout/`；页面布局外壳放 `entrypoints/<page>/layout/`，其余页面专用组件放对应 `entrypoints/<page>/`。
- `entrypoints/` 放各页面的入口文件（`main.tsx`、`App.tsx`、`index.html`）、路由与页面、页面专用组件以及页面逻辑。
- 不再使用 `utils/` 目录：共享代码放 `lib/`（如 `lib/settings.ts`、`lib/use-settings.tsx`），共享类型放 `types/`。
- 只服务单个页面的逻辑放对应 `entrypoints/<page>/`：例如 dashboard 的 store/归一化/grid 计算都在 `entrypoints/newtab/dashboard/`，只有被两个及以上页面用到的才上提到 `lib/`。
