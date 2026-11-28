import { Database, Download, Upload } from '@lucide/solid';
import { Show, createSignal } from 'solid-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { exportDashboard, parseBackup, writeBackup, type ParsedBackup } from '@/lib/dashboard/backup';

function errorMessage(cause: unknown, fallback: string): string {
    if (cause instanceof Error && cause.message) return `${fallback}：${cause.message}`;
    return fallback;
}

/** 备份里的导出时间未必合法，别让 `toLocaleString` 吐出 Invalid Date。 */
function exportedLabel(iso: string): string | undefined {
    const at = new Date(iso);
    return Number.isNaN(at.getTime()) ? undefined : at.toLocaleString();
}

export default function DataPage() {
    const [status, setStatus] = createSignal('');
    const [error, setError] = createSignal('');
    /** 选好文件、解析通过、等用户确认的那一份；`null` 表示对话框关着。 */
    const [parsed, setParsed] = createSignal<ParsedBackup | null>(null);
    const [busy, setBusy] = createSignal(false);

    let fileInput: HTMLInputElement | undefined;

    const reset = () => {
        setStatus('');
        setError('');
    };

    const onExport = async () => {
        reset();
        try {
            const summary = await exportDashboard();
            setStatus(`已导出 ${summary.pages} 页、${summary.cells} 个图标。`);
        } catch (cause) {
            setError(errorMessage(cause, '导出失败'));
        }
    };

    const onPick = () => {
        reset();
        fileInput?.click();
    };

    const onFileChange = async (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        // 清空 value：改完同一个文件再选一次，也要能触发 change。
        input.value = '';
        if (!file) return;

        reset();
        try {
            setParsed(parseBackup(await file.text()));
        } catch (cause) {
            setError(errorMessage(cause, '导入失败'));
        }
    };

    const confirmImport = async () => {
        const target = parsed();
        if (!target) return;

        setParsed(null);
        setBusy(true);
        try {
            await writeBackup(target.data);
            setStatus(
                `已导入 ${target.summary.pages} 页、${target.summary.cells} 个图标，重新打开新标签页即可看到。`,
            );
        } catch (cause) {
            setError(errorMessage(cause, '导入失败'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Database size={16} class="text-primary" />
                        看板数据
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-4">
                    <p class="text-xs leading-relaxed text-muted-foreground">
                        看板只存在这台设备的浏览器里，卸载扩展或换设备就带不走。导出一份
                        JSON 作为备份，需要时再导入回来。
                    </p>

                    <div class="flex flex-wrap gap-2">
                        <Button size="sm" onClick={onExport} disabled={busy()}>
                            <Download size={16} />
                            导出备份
                        </Button>
                        <Button variant="outline" size="sm" onClick={onPick} disabled={busy()}>
                            <Upload size={16} />
                            导入备份
                        </Button>
                    </div>

                    {/* 隐藏的文件选择器，由「导入备份」按钮代点。 */}
                    <input
                        ref={(element) => {
                            fileInput = element;
                        }}
                        type="file"
                        accept="application/json,.json"
                        class="hidden"
                        aria-hidden="true"
                        tabindex={-1}
                        onChange={onFileChange}
                    />

                    <p class="text-[11px] leading-relaxed text-muted-foreground/80">
                        备份包含页面和图标；问候语、开关这类设置项不包含在内。
                    </p>

                    <Show when={status()}>
                        <p class="text-xs text-muted-foreground" role="status">
                            {status()}
                        </p>
                    </Show>
                    <Show when={error()}>
                        <p class="text-xs text-destructive" role="alert">
                            {error()}
                        </p>
                    </Show>
                </CardContent>
            </Card>

            <Dialog
                open={parsed() !== null}
                onOpenChange={(open) => {
                    if (!open) setParsed(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>导入这份备份？</DialogTitle>
                        <DialogDescription>
                            会覆盖当前的页面和图标，且无法撤销。建议先导出一份现在的看板。
                        </DialogDescription>
                    </DialogHeader>

                    <Show when={parsed()}>
                        {(target) => {
                            const when = () => {
                                const iso = target().exportedAt;
                                const at = iso ? exportedLabel(iso) : undefined;
                                return at ? `，导出于 ${at}` : '';
                            };

                            return (
                                <p class="text-xs leading-relaxed text-muted-foreground">
                                    {`备份里有 ${target().summary.pages} 页、${target().summary.cells} 个图标${when()}。`}
                                </p>
                            );
                        }}
                    </Show>

                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setParsed(null)}>
                            取消
                        </Button>
                        <Button variant="destructive" size="sm" onClick={confirmImport}>
                            覆盖并导入
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
