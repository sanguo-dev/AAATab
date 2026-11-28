/**
 * 用户上传的图片库。
 *
 * 图片是二进制，塞不进 `storage.local` 的 JSON（还会被 base64 撑大三分之一），
 * 所以单独放在 IndexedDB 里；设置里只留一个 `ref`，渲染时读成 `blob:` 地址。
 * 目前只有新标签页背景在用，以后图标上传也走这里。
 */

const DB_NAME = 'aaatab';
const DB_VERSION = 1;
const STORE = 'uploads';

/** 单张图片的上传上限；再大就让用户自己压一下，扩展里不做图像处理。 */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/avif',
]);

export interface UploadHandle {
    /** `blob:` 地址，用完调 `dispose` 释放。 */
    url: string;
    dispose: () => void;
}

interface UploadRecord {
    ref: string;
    name: string;
    type: string;
    size: number;
    at: number;
    blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'ref' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('打不开本地图片库'));
    });

    return dbPromise;
}

async function run<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    const db = await openDb();

    return new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('本地图片库操作失败'));
    });
}

/** 选文件之后先跑这个，返回给人看的错误文案；没问题返回 `undefined`。 */
export function validateUpload(file: File): string | undefined {
    if (file.size === 0) return '这个文件是空的';
    if (file.size > MAX_UPLOAD_BYTES) return '图片太大了，请选 20MB 以内的';
    // 有的系统给不出 MIME，交给后面的图片解码去判断。
    if (file.type && !ACCEPTED_TYPES.has(file.type)) {
        return '只支持 PNG / JPEG / WebP / GIF / AVIF';
    }
    return undefined;
}

/** 存一张图片，返回库里的 `ref`（写进设置的就是它）。 */
export async function saveUpload(file: File): Promise<string> {
    const problem = validateUpload(file);
    if (problem) throw new Error(problem);

    const ref = `upload-${crypto.randomUUID()}`;
    const record: UploadRecord = {
        ref,
        name: file.name,
        type: file.type,
        size: file.size,
        at: Date.now(),
        blob: file,
    };

    await run('readwrite', (store) => store.put(record));
    return ref;
}

/** 读一张图片，返回可以直接塞进 CSS / `<img>` 的地址。 */
export async function readUpload(ref: string): Promise<UploadHandle | undefined> {
    const record = await run<UploadRecord | undefined>('readonly', (store) => store.get(ref));
    if (!record?.blob) return undefined;

    const url = URL.createObjectURL(record.blob);
    return { url, dispose: () => URL.revokeObjectURL(url) };
}

export async function removeUpload(ref: string): Promise<void> {
    await run('readwrite', (store) => store.delete(ref));
}

/** 只留下 `keep` 里的图片；背景只有一个槽位，换新图时把旧图清掉。 */
export async function pruneUploads(keep: readonly string[]): Promise<void> {
    const keys = await run<IDBValidKey[]>('readonly', (store) => store.getAllKeys());
    const stale = keys.filter((key): key is string => typeof key === 'string' && !keep.includes(key));

    await Promise.all(stale.map((key) => run('readwrite', (store) => store.delete(key))));
}
