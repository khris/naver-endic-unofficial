import { storage } from 'wxt/utils/storage';

/** 기존 Firefox 확장의 `defaultPrefs`와 같은 이름·값을 쓴다 */
export interface Settings {
  /** 0: 클래식(텍스트를 선택하면 조회), 1: 보조키를 누른 채 클릭하면 조회 */
  wordSelectMode: 0 | 1;
  useCtrl: boolean;
  useAlt: boolean;
  useMeta: boolean;
}

export const defaultSettings: Settings = {
  wordSelectMode: 1,
  useCtrl: false,
  useAlt: true,
  useMeta: false,
};

const settingsItem = storage.defineItem<Partial<Settings>>('sync:settings', { fallback: {} });

export async function loadSettings(): Promise<Settings> {
  return { ...defaultSettings, ...(await settingsItem.getValue()) };
}

export async function saveSettings(settings: Settings) {
  await settingsItem.setValue(settings);
}

/** 설정이 바뀔 때마다 불린다. 반환된 함수로 구독을 해제한다 */
export function watchSettings(callback: (settings: Settings) => void) {
  return settingsItem.watch((value) => callback({ ...defaultSettings, ...value }));
}

/** 클릭 시 눌린 보조키가 설정에서 켠 보조키인지 */
export function matchesModifier(settings: Settings, event: MouseEvent) {
  return (
    (settings.useCtrl && event.ctrlKey) ||
    (settings.useAlt && event.altKey) ||
    (settings.useMeta && event.metaKey)
  );
}
