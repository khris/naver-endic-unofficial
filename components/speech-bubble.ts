import { css, html, render, svg, type TemplateResult } from 'lit';
import {
  computeBubbleGeometry,
  type BubbleGeometry,
  type BubblePlacement,
} from '@/utils/bubble-path';

// Chrome의 content script(isolated world)에서는 `customElements`가 null이라
// LitElement를 쓸 수 없다. 그래서 커스텀 엘리먼트 없이 lit-html로 직접 그린다.

export interface SpeechBubbleProps {
  /** 꼬리가 놓이는 변 (꼬리는 그 변 바깥쪽을 향한다) */
  placement: BubblePlacement;
  /** 그 변을 따라 꼬리 중심이 놓이는 위치(px). 생략하면 중앙 */
  tailOffset?: number;
  tailSize: number;
  tailWidth: number;
  radius: number;
  borderWidth: number;
  /** 말풍선 안에 들어갈 내용. Node를 넘기면 다시 그려도 같은 노드가 유지된다(iframe 등) */
  content: TemplateResult | Node | string;
}

export const defaultSpeechBubbleProps: SpeechBubbleProps = {
  placement: 'bottom',
  tailSize: 12,
  tailWidth: 18,
  radius: 12,
  borderWidth: 2,
  content: '',
};

/**
 * 색상: `--bubble-bg`, `--bubble-border`, `--bubble-shadow`, `--bubble-padding`
 */
const styles = css`
  :host,
  .bubble {
    box-sizing: border-box;
  }
  .bubble {
    position: relative;
    display: inline-block;
  }
  svg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: visible;
    pointer-events: none;
    filter: drop-shadow(var(--bubble-shadow, 0 2px 6px rgb(0 0 0 / 0.25)));
  }
  path {
    fill: var(--bubble-bg, #fff);
    stroke: var(--bubble-border, #222);
    stroke-linejoin: round;
  }
  .body {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    padding: var(--bubble-padding, 8px 12px);
  }
`;

/**
 * 꼬리가 달린 둥근 사각형 말풍선. 모양만 담당하며 화면상의 위치는 정하지 않는다.
 *
 * `container`(보통 shadow root 안의 div)에 직접 렌더링한다.
 * `update()`로 속성을 바꾸면 다시 그리고, 내용 크기가 바뀌면 스스로 다시 그린다.
 */
export class SpeechBubble {
  private props: SpeechBubbleProps;
  private bodySize = { width: 0, height: 0 };
  private readonly resizeObserver = new ResizeObserver(() => this.measure());
  private observed: Element | null = null;

  constructor(
    private readonly container: HTMLElement,
    props: Partial<SpeechBubbleProps> = {},
    /** 본체 크기가 바뀌어 다시 그린 직후에 불린다 */
    private readonly onMeasure?: () => void,
  ) {
    this.props = { ...defaultSpeechBubbleProps, ...props };
    this.draw();
  }

  update(props: Partial<SpeechBubbleProps>) {
    this.props = { ...this.props, ...props };
    this.draw();
  }

  /** 꼬리 끝 좌표 (말풍선 영역 좌상단 기준). 아직 측정 전이면 `undefined` */
  get tipPoint(): { x: number; y: number } | undefined {
    return this.geometry()?.tip;
  }

  /** 꼬리를 제외한 본체 크기. 아직 측정 전이면 `undefined` */
  get bodyBoxSize(): { width: number; height: number } | undefined {
    const { width, height } = this.bodySize;
    return width && height ? { width, height } : undefined;
  }

  /** 본체 크기를 지금 바로 다시 잰다. 내용 크기를 코드로 바꾼 직후 동기적으로 반영할 때 쓴다 */
  remeasure() {
    this.measure();
  }

  destroy() {
    this.resizeObserver.disconnect();
    render(null, this.container);
  }

  private geometry(): BubbleGeometry | undefined {
    const { width, height } = this.bodySize;
    if (!width || !height) return undefined;
    const p = this.props;
    return computeBubbleGeometry({
      bodyWidth: width,
      bodyHeight: height,
      placement: p.placement,
      tailOffset: p.tailOffset,
      tailSize: p.tailSize,
      tailWidth: p.tailWidth,
      radius: p.radius,
    });
  }

  private measure() {
    const body = this.container.querySelector<HTMLElement>('.body');
    if (!body) return;
    const { offsetWidth: width, offsetHeight: height } = body;
    if (width !== this.bodySize.width || height !== this.bodySize.height) {
      this.bodySize = { width, height };
      this.draw();
      this.onMeasure?.();
    }
  }

  private draw() {
    const p = this.props;
    const geometry = this.geometry();
    // 꼬리가 놓인 쪽에 꼬리 길이만큼 여백을 둬서, 꼬리가 말풍선 영역 안에 들어오게 한다
    const t = p.tailSize;
    const margin = [
      p.placement === 'top' ? t : 0,
      p.placement === 'right' ? t : 0,
      p.placement === 'bottom' ? t : 0,
      p.placement === 'left' ? t : 0,
    ]
      .map((v) => `${v}px`)
      .join(' ');

    render(
      html`
        <style>
          ${styles}
        </style>
        <div class="bubble">
          <div class="body" style="margin:${margin}">${p.content}</div>
          ${geometry
            ? svg`<svg width=${geometry.width} height=${geometry.height}>
                <path d=${geometry.path} stroke-width=${p.borderWidth}></path>
              </svg>`
            : null}
        </div>
      `,
      this.container,
    );

    // render가 .body를 새로 만들지는 않지만, 처음 그린 직후에는 관찰을 시작해야 한다
    const body = this.container.querySelector('.body');
    if (body && body !== this.observed) {
      this.resizeObserver.disconnect();
      this.resizeObserver.observe(body);
      this.observed = body;
    }
  }
}
