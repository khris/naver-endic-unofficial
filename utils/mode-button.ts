import { loadSettings, saveSettings, watchSettings, type Settings } from '@/utils/settings';

function title(s: Settings) {
  if (s.wordSelectMode === 0) return '조회 방식: 클래식 (텍스트 선택) — 클릭하면 보조키 방식으로 전환';
  const keys = [s.useCtrl && 'Ctrl', s.useAlt && 'Alt', s.useMeta && 'Meta'].filter(Boolean);
  return `조회 방식: ${keys.join('/') || '(보조키 없음)'} + 클릭 — 클릭하면 클래식으로 전환`;
}

async function render(s: Settings) {
  await browser.action.setIcon({ path: s.wordSelectMode === 1 ? 'mode/std.png' : 'mode/classic.png' });
  await browser.action.setTitle({ title: title(s) });
}

/** 툴바 버튼: 아이콘으로 현재 조회 방식을 보여 주고, 누르면 방식을 전환한다 */
export function setupModeButton() {
  browser.action.onClicked.addListener(async () => {
    const s = await loadSettings();
    await saveSettings({ ...s, wordSelectMode: s.wordSelectMode === 1 ? 0 : 1 });
  });
  // setIcon은 브라우저를 다시 켜면 사라지므로 background가 시작할 때마다 다시 적용한다
  void loadSettings().then(render);
  watchSettings(render);
}
