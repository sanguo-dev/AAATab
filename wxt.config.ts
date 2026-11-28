import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
    manifest: {
        // Used by the new tab page and options page to persist settings.
        permissions: ["storage"],
        // 解析站点图标要抓首页 HTML，扩展页 fetch 跨域需要全站 host 权限。
        // MV2（Firefox）没有这个字段，WXT 会把它并进 permissions。
        host_permissions: ["*://*/*"],
    },
    vite: () => ({
        // @solidjs/vite-plugin is the Solid 2 replacement for vite-plugin-solid.
        plugins: [solid(), tailwindcss()],
        // UI SDK core must not be pre-bundled separately from @ui-sdk/solid.
        optimizeDeps: { exclude: ["@ui-sdk/core"] },
        build: {
            // Solid 2 compiles to modern syntax.
            target: "esnext",
        },
    }),
    webExt: {
        binaries: {
            edge: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
            firefox: "firefoxdeveloperedition",
        },
    },
});
