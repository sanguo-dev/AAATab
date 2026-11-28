import type { BackgroundSource } from './background';

export interface Settings {
  /** Name shown in the greeting. Empty means "朋友". */
  displayName: string;
  showClock: boolean;
  showDate: boolean;
  showGreeting: boolean;
  showPageDots: boolean;
  /** 新标签页的背景来源；默认值见 `lib/settings.ts`。 */
  background: BackgroundSource;
}
