import { storage } from 'wxt/utils/storage';

export interface Settings {
  /** Name shown in the greeting. Empty means "朋友". */
  displayName: string;
  showClock: boolean;
  showDate: boolean;
  showGreeting: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  displayName: '',
  showClock: true,
  showDate: true,
  showGreeting: true,
};

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 1,
});
