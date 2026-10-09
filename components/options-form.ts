import { LitElement, css, html } from 'lit';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  watchSettings,
  type Settings,
} from '@/utils/settings';

/** 설정 페이지(options)용 컴포넌트. 바꾸는 즉시 저장한다 */
export class OptionsForm extends LitElement {
  static override properties = {
    settings: { state: true },
  };

  declare settings: Settings;

  private unwatch?: () => void;

  constructor() {
    super();
    this.settings = defaultSettings;
  }

  static override styles = css`
    :host {
      display: block;
      max-width: 480px;
      font: 14px/1.6 system-ui, sans-serif;
    }
    fieldset {
      margin: 0 0 16px;
      padding: 12px 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    legend {
      font-weight: 600;
    }
    label {
      display: block;
    }
    .hint {
      margin: 0 0 0 24px;
      color: #777;
      font-size: 12px;
    }
    .disabled {
      opacity: 0.5;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    void loadSettings().then((s) => (this.settings = s));
    this.unwatch = watchSettings((s) => (this.settings = s));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unwatch?.();
  }

  private change(patch: Partial<Settings>) {
    this.settings = { ...this.settings, ...patch };
    void saveSettings(this.settings);
  }

  private renderMode(value: 0 | 1, label: string, hint: string) {
    return html`
      <label>
        <input
          type="radio"
          name="mode"
          .checked=${this.settings.wordSelectMode === value}
          @change=${() => this.change({ wordSelectMode: value })}
        />
        ${label}
      </label>
      <p class="hint">${hint}</p>
    `;
  }

  private renderKey(key: 'useCtrl' | 'useAlt' | 'useMeta', label: string) {
    return html`
      <label>
        <input
          type="checkbox"
          .checked=${this.settings[key]}
          @change=${(e: Event) => this.change({ [key]: (e.target as HTMLInputElement).checked })}
        />
        ${label}
      </label>
    `;
  }

  override render() {
    const modifierOff = this.settings.wordSelectMode === 0;
    return html`
      <fieldset>
        <legend>조회 방식</legend>
        ${this.renderMode(1, '보조키와 함께 클릭', '보조키를 누른 채 단어를 클릭하면 그 단어를 조회합니다.')}
        ${this.renderMode(0, '클래식', '텍스트를 선택하면 바로 조회합니다.')}
      </fieldset>
      <fieldset class=${modifierOff ? 'disabled' : ''} ?disabled=${modifierOff}>
        <legend>보조키</legend>
        ${this.renderKey('useCtrl', 'Ctrl')} ${this.renderKey('useAlt', 'Alt (macOS: Option)')}
        ${this.renderKey('useMeta', 'Meta (macOS: Command, Windows: 윈도우 키)')}
      </fieldset>
    `;
  }
}

customElements.define('options-form', OptionsForm);
