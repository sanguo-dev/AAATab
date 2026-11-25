# AAATab 项目约束

本文件由 DSH 在每次会话首次请求时自动读取；修改后会在后续请求中重新加载。

## 工作方式

- **不要修改 `README.md`**，除非用户明确要求。
- **不要在 `C:\Users\v\AppData\Local\` 下创建临时工程、安装依赖或跑测试**。构建、类型检查和测试只在项目目录内执行；临时文件放项目内并在完成后清理。除非用户明确要求
- **不要自行发明布局、列数、尺寸、间距等规格**。用户没有明确给出的，先问，不要写进代码或约束文件。
- 不要为了验证而擅自搭脚手架或跑与本任务无关的测试。

## UI 组件

- 只使用 solid-ui-next 的源码组件（`components/ui/`）和其主题（`components/ui/styles/`）；不要引入 daisyUI、Kobalte、Corvu。
- `cn` 统一从 `@/lib/utils` 导入（`clsx` + `tailwind-merge`）。
- `@ui-sdk/solid` 与 `@ui-sdk/core` 必须保持同一版本 `0.1.0-beta.10`，升级时一起改。
- `components/` 只放 solid-ui-next 的 vendored 组件；页面专用组件放在对应 `entrypoints/` 目录。
