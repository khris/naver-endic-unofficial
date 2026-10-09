import { LitElement, css, html, nothing } from 'lit';
import { isParentToDict, type DictToParent } from '@/utils/dict-protocol';
import { searchDict, type DictEntry, type DictPronunciation } from '@/utils/dict-search';
import { inlineHtml } from '@/utils/inline-html';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; entries: DictEntry[] }
  | { status: 'error'; message: string };

/**
 * 사전 내용을 그리는 확장 페이지(iframe)용 컴포넌트.
 * 부모(content script)로부터 조회어를 받아 background에 조회하고, 내용 높이를 부모에 알린다.
 */
export class DictView extends LitElement {
  static override properties = {
    state: { state: true },
  };

  declare state: State;

  private readonly resizeObserver = new ResizeObserver(() => this.reportSize());
  /** 늦게 도착한 이전 조회 결과를 버리기 위한 번호 */
  private lookupId = 0;

  constructor() {
    super();
    this.state = { status: 'idle' };
  }

  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      max-height: 360px;
      overflow-y: auto;
      padding: 12px 16px;
      font: 14px/1.5 system-ui, sans-serif;
      color: #222;
    }
    .entry + .entry {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
    }
    .title {
      font-size: 18px;
    }
    .source {
      margin-left: 6px;
      font-size: 11px;
      color: #777;
    }
    .pron {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      color: #555;
    }
    .pron button {
      all: unset;
      cursor: pointer;
      color: #1a5fb4;
    }
    .pos {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }
    ol {
      margin: 2px 0 0;
      padding-left: 20px;
    }
    .example {
      font-size: 12px;
      color: #666;
    }
    .related {
      color: #777;
    }
    .message {
      color: #555;
    }
    .error {
      color: #b00020;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('message', this.onMessage);
    this.resizeObserver.observe(this);
    this.post({ type: 'dict:ready' });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', this.onMessage);
    this.resizeObserver.disconnect();
  }

  // 조회어가 같아 높이가 그대로여도 부모는 크기 응답을 기다리므로 렌더 뒤에 항상 알린다
  override updated() {
    this.reportSize();
  }

  private readonly onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent || !isParentToDict(event.data)) return;
    void this.lookup(event.data.text);
  };

  private async lookup(text: string) {
    const id = ++this.lookupId;
    this.state = { status: 'loading' };
    try {
      const entries = await searchDict(text);
      if (id === this.lookupId) this.state = { status: 'done', entries };
    } catch (error) {
      if (id === this.lookupId) {
        this.state = { status: 'error', message: error instanceof Error ? error.message : String(error) };
      }
    }
  }

  private reportSize() {
    this.post({ type: 'dict:size', height: Math.ceil(this.getBoundingClientRect().height) });
  }

  private post(message: DictToParent) {
    // 부모 페이지의 origin을 알 수 없으므로 '*'. 크기 같은 민감하지 않은 값만 보낸다
    window.parent.postMessage(message, '*');
  }

  private play(audio: string) {
    void new Audio(audio).play();
  }

  private renderPronunciation(p: DictPronunciation) {
    const text = html`${p.label}${p.symbol ? html` [${inlineHtml(p.symbol)}]` : nothing}`;
    return p.audio
      ? html`<button type="button" @click=${() => this.play(p.audio!)}>🔈 ${text}</button>`
      : html`<span>${text}</span>`;
  }

  private renderEntry(entry: DictEntry) {
    return html`<section class="entry">
      <div>
        <a class="title" href=${entry.url} target="_blank" rel="noreferrer">${inlineHtml(entry.title)}</a
        ><span class="source">${entry.source}</span>
      </div>
      ${entry.pronunciations.length
        ? html`<div class="pron">${entry.pronunciations.map((p) => this.renderPronunciation(p))}</div>`
        : nothing}
      ${entry.partsOfSpeech.map(
        (pos) => html`
          <div class="pos">${pos.label}</div>
          <ol>
            ${pos.meanings.map(
              (m) => html`<li>
                ${inlineHtml(m.html)}
                ${m.example
                  ? html`<div class="example">${inlineHtml(m.example.en)} ${m.example.ko}</div>`
                  : nothing}
              </li>`,
            )}
          </ol>
        `,
      )}
    </section>`;
  }

  override render() {
    const s = this.state;
    switch (s.status) {
      case 'idle':
      case 'loading':
        return html`<div class="message">찾는 중…</div>`;
      case 'error':
        return html`<div class="message error">${s.message}</div>`;
      case 'done':
        return s.entries.length
          ? s.entries.map((entry) => this.renderEntry(entry))
          : html`<div class="message">결과가 없습니다.</div>`;
    }
  }
}

customElements.define('dict-view', DictView);
