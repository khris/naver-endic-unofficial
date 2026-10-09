import { SpeechBubble } from '@/components/speech-bubble';
import { DICT_WIDTH, isDictToParent, type ParentToDict } from '@/utils/dict-protocol';
import { computeBubblePosition } from '@/utils/bubble-position';
import { MATCHES } from '@/utils/matches';
import { loadSettings, matchesModifier, watchSettings } from '@/utils/settings';
import { wordAtPoint } from '@/utils/word-at-point';

export default defineContentScript({
  matches: MATCHES,
  async main(ctx) {
    let settings = await loadSettings();
    ctx.onInvalidated(watchSettings((s) => (settings = s)));

    const state: { anchor?: DOMRect; text?: string; ready: boolean; awaitingSize: boolean } = {
      ready: false,
      awaitingSize: false,
    };

    const iframe = document.createElement('iframe');
    iframe.src = browser.runtime.getURL('/dict.html');
    // 호스트 페이지의 color-scheme이 달라도 iframe 배경이 불투명해지지 않게 고정한다
    iframe.style.cssText = `display:block;border:0;width:${DICT_WIDTH}px;height:0;border-radius:10px;color-scheme:light`;
    const dictOrigin = new URL(iframe.src).origin;

    let bubble!: SpeechBubble;
    let wrapper!: HTMLElement;

    const ui = await createShadowRootUi(ctx, {
      name: 'endic-bubble',
      position: 'overlay',
      zIndex: 2147483647,
      onMount(container) {
        wrapper = document.createElement('div');
        wrapper.style.cssText =
          'position:fixed;left:0;top:0;visibility:hidden;--bubble-padding:0';
        container.append(wrapper);
        bubble = new SpeechBubble(wrapper, { content: iframe }, reposition);
        return bubble;
      },
      onRemove(b) {
        b?.destroy();
      },
    });
    ui.mount();

    // z-index는 이미 최댓값이라 더 올릴 수 없다. 모달 dialog나 전체 화면 요소는 z-index와
    // 무관하게 top layer에 올라가므로, 말풍선도 popover로 top layer에 올려 그보다 위에 둔다.
    // 이후 top layer에 들어오는 요소가 위로 오므로, 선택할 때마다 다시 올린다.
    const host = ui.shadowHost;
    host.popover = 'manual';
    // popover의 UA 기본 스타일(배경, 테두리, 여백, 가운데 정렬)을 지운다
    host.style.cssText += ';background:transparent;border:0;padding:0;margin:0;inset:auto;color:inherit';
    function raise() {
      try {
        if (host.matches(':popover-open')) host.hidePopover();
        host.showPopover();
      } catch {
        // popover를 지원하지 않으면 z-index만으로 둔다
      }
    }

    function post(message: ParentToDict) {
      iframe.contentWindow?.postMessage(message, dictOrigin);
    }

    function reposition() {
      const size = bubble.bodyBoxSize;
      if (!state.anchor || !size || state.awaitingSize) return;
      const pos = computeBubblePosition({
        anchor: state.anchor,
        bodyWidth: size.width,
        bodyHeight: size.height,
        tailSize: 12,
        tailWidth: 18,
        radius: 12,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      bubble.update({ placement: pos.placement, tailOffset: pos.tailOffset });
      wrapper.style.left = `${pos.x}px`;
      wrapper.style.top = `${pos.y}px`;
      wrapper.style.visibility = 'visible';
    }

    function show(anchor: DOMRect, text: string) {
      state.anchor = anchor;
      state.text = text;
      state.awaitingSize = true;
      wrapper.style.visibility = 'hidden';
      raise();
      if (state.ready) post({ type: 'dict:lookup', text });
    }

    function hide() {
      state.anchor = undefined;
      state.text = undefined;
      wrapper.style.visibility = 'hidden';
    }

    ctx.addEventListener(window, 'message', (event) => {
      // 페이지 스크립트도 메시지를 보낼 수 있으므로, 우리 iframe에서 온 것만 받는다
      if (event.source !== iframe.contentWindow || !isDictToParent(event.data)) return;
      const msg = event.data;
      if (msg.type === 'dict:ready') {
        state.ready = true;
        if (state.text !== undefined) post({ type: 'dict:lookup', text: state.text });
      } else if (state.anchor) {
        iframe.style.height = `${msg.height}px`;
        state.awaitingSize = false;
        bubble.remeasure();
        reposition();
      }
    });

    ctx.addEventListener(document, 'mouseup', (event) => {
      // 말풍선 안에서의 클릭은 무시한다
      if (event.composedPath().includes(ui.shadowHost)) return;
      if (settings.wordSelectMode === 1) {
        // 보조키를 누른 채 왼쪽 클릭한 위치의 단어를 조회한다
        if (event.button !== 0 || !matchesModifier(settings, event)) return;
        const word = wordAtPoint(event.clientX, event.clientY);
        if (word) show(word.rect, word.text);
        return;
      }
      // 선택이 mouseup 직후에 확정되므로 다음 틱에 읽는다
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!selection || !text || selection.rangeCount === 0) return hide();
        show(selection.getRangeAt(0).getBoundingClientRect(), text);
      });
    });
    ctx.addEventListener(document, 'mousedown', (event) => {
      if (!event.composedPath().includes(ui.shadowHost)) hide();
    });
    ctx.addEventListener(window, 'scroll', hide, { capture: true });
    ctx.addEventListener(window, 'resize', hide);
  },
});
