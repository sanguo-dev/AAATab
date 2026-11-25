import type { JSX } from '@solidjs/web';
import { createContext, createSignal, onSettled, useContext } from 'solid-js';

import { DEFAULT_SETTINGS, settingsItem, type Settings } from './settings';

interface SettingsStore {
    settings: () => Settings;
    update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsStore>();

export function SettingsProvider(props: { children: JSX.Element }) {
    let current: Settings = { ...DEFAULT_SETTINGS };
    const [settings, setSettings] = createSignal<Settings>(current);

    const apply = (value: Partial<Settings> | null | undefined) => {
        current = { ...DEFAULT_SETTINGS, ...(value ?? {}) };
        setSettings(current);
    };

    const update = (patch: Partial<Settings>) => {
        current = { ...current, ...patch };
        setSettings(current);
        void settingsItem.setValue(current);
    };

    onSettled(() => {
        let active = true;
        let receivedUpdate = false;

        const unwatch = settingsItem.watch((value) => {
            receivedUpdate = true;
            apply(value);
        });
        void settingsItem.getValue().then((value) => {
            // A storage change that arrived while loading is newer than this read.
            if (active && !receivedUpdate) apply(value);
        });

        return () => {
            active = false;
            unwatch();
        };
    });

    return <SettingsContext value={{ settings, update }}>{props.children}</SettingsContext>;
}

export function useSettings() {
    return useContext(SettingsContext);
}
