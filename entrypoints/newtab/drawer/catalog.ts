/**
 * 抽屉里图标面板的数据源。
 *
 * 全部是数据驱动的：加一个站点只要在某个分类的 `items` 里加一条，
 * 加一个分类就在 `CATEGORIES` 里加一项；页签、「全部」「最受喜爱」
 * 以及搜索都会自动跟着变，UI 不用改。
 */

export interface CatalogItem {
    /** 稳定的 id，用来做列表 key，不参与渲染。 */
    id: string;
    title: string;
    url: string;
    /** 是否出现在「最受喜爱」里。 */
    favorite?: boolean;
}

export interface CatalogCategory {
    id: string;
    title: string;
    items: CatalogItem[];
}

export const CATEGORIES: CatalogCategory[] = [
    {
        id: 'news',
        title: '新闻',
        items: [
            { id: 'zhihu', title: '知乎', url: 'https://www.zhihu.com', favorite: true },
            { id: 'weibo', title: '微博', url: 'https://weibo.com' },
            { id: '36kr', title: '36氪', url: 'https://36kr.com' },
            { id: 'sspai', title: '少数派', url: 'https://sspai.com' },
            { id: 'hackernews', title: 'Hacker News', url: 'https://news.ycombinator.com' },
        ],
    },
    {
        id: 'media',
        title: '影音',
        items: [
            { id: 'bilibili', title: '哔哩哔哩', url: 'https://www.bilibili.com', favorite: true },
            { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com', favorite: true },
            { id: 'netflix', title: 'Netflix', url: 'https://www.netflix.com' },
            { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com' },
            { id: 'doubanmovie', title: '豆瓣电影', url: 'https://movie.douban.com' },
        ],
    },
    {
        id: 'social',
        title: '社交',
        items: [
            { id: 'x', title: 'X', url: 'https://x.com', favorite: true },
            { id: 'reddit', title: 'Reddit', url: 'https://www.reddit.com' },
            { id: 'discord', title: 'Discord', url: 'https://discord.com' },
            { id: 'telegram', title: 'Telegram', url: 'https://web.telegram.org' },
            { id: 'instagram', title: 'Instagram', url: 'https://www.instagram.com' },
        ],
    },
    {
        id: 'tools',
        title: '工具',
        items: [
            { id: 'github', title: 'GitHub', url: 'https://github.com', favorite: true },
            { id: 'figma', title: 'Figma', url: 'https://www.figma.com' },
            { id: 'notion', title: 'Notion', url: 'https://www.notion.so' },
            { id: 'translate', title: 'Google 翻译', url: 'https://translate.google.com', favorite: true },
            { id: 'deepl', title: 'DeepL', url: 'https://www.deepl.com' },
        ],
    },
    {
        id: 'dev',
        title: '开发',
        items: [
            { id: 'gitlab', title: 'GitLab', url: 'https://gitlab.com' },
            { id: 'stackoverflow', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
            { id: 'npm', title: 'npm', url: 'https://www.npmjs.com' },
            { id: 'mdn', title: 'MDN', url: 'https://developer.mozilla.org' },
            { id: 'caniuse', title: 'Can I use', url: 'https://caniuse.com' },
        ],
    },
    {
        id: 'design',
        title: '设计',
        items: [
            { id: 'dribbble', title: 'Dribbble', url: 'https://dribbble.com' },
            { id: 'behance', title: 'Behance', url: 'https://www.behance.net' },
            { id: 'zcool', title: '站酷', url: 'https://www.zcool.com.cn' },
            { id: 'pinterest', title: 'Pinterest', url: 'https://www.pinterest.com' },
        ],
    },
    {
        id: 'learn',
        title: '学习',
        items: [
            { id: 'imooc', title: '慕课网', url: 'https://www.imooc.com' },
            { id: 'coursera', title: 'Coursera', url: 'https://www.coursera.org' },
            { id: 'khan', title: '可汗学院', url: 'https://zh.khanacademy.org' },
            { id: 'wikipedia', title: '维基百科', url: 'https://zh.wikipedia.org' },
        ],
    },
    {
        id: 'read',
        title: '阅读',
        items: [
            { id: 'weread', title: '微信读书', url: 'https://weread.qq.com' },
            { id: 'doubanbook', title: '豆瓣读书', url: 'https://book.douban.com' },
            { id: 'medium', title: 'Medium', url: 'https://medium.com' },
        ],
    },
    {
        id: 'shop',
        title: '购物',
        items: [
            { id: 'taobao', title: '淘宝', url: 'https://www.taobao.com' },
            { id: 'jd', title: '京东', url: 'https://www.jd.com' },
            { id: 'amazon', title: 'Amazon', url: 'https://www.amazon.com' },
        ],
    },
    {
        id: 'cloud',
        title: '云盘',
        items: [
            { id: 'aliyun', title: '阿里云盘', url: 'https://www.alipan.com' },
            { id: 'baidupan', title: '百度网盘', url: 'https://pan.baidu.com' },
            { id: 'gdrive', title: 'Google Drive', url: 'https://drive.google.com' },
            { id: 'onedrive', title: 'OneDrive', url: 'https://onedrive.live.com' },
        ],
    },
    {
        id: 'game',
        title: '游戏',
        items: [
            { id: 'steam', title: 'Steam', url: 'https://store.steampowered.com' },
            { id: 'epic', title: 'Epic', url: 'https://store.epicgames.com' },
            { id: 'itchio', title: 'itch.io', url: 'https://itch.io' },
        ],
    },
    {
        id: 'ai',
        title: 'AI',
        items: [
            { id: 'chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com', favorite: true },
            { id: 'claude', title: 'Claude', url: 'https://claude.ai', favorite: true },
            { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com' },
            { id: 'tongyi', title: '通义千问', url: 'https://tongyi.aliyun.com' },
        ],
    },
];

/** 「最受喜爱」：所有分类里标了 favorite 的。 */
export const FAVORITE_ITEMS: CatalogItem[] = CATEGORIES.flatMap((category) =>
    category.items.filter((item) => item.favorite),
);

/** 「全部」：所有分类的并集，保持分类顺序。 */
export const ALL_ITEMS: CatalogItem[] = CATEGORIES.flatMap((category) => category.items);
