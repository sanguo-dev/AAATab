import { storage } from 'wxt/utils/storage';

import type { Settings } from '@/types/settings';

export const DEFAULT_SETTINGS: Settings = {
  displayName: '',
  showClock: true,
  showDate: true,
  showGreeting: true,
  showPageDots: true,
};

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 1,
});
