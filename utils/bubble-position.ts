import type { BubblePlacement } from './bubble-path';

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface BubblePositionOptions {
  /** 앵커(텍스트 선택 영역 등)의 뷰포트 기준 사각형. 좌표라면 크기 0인 사각형 */
  anchor: Rect;
  /** 꼬리를 제외한 말풍선 본체의 크기 */
  bodyWidth: number;
  bodyHeight: number;
  tailSize: number;
  tailWidth: number;
  radius: number;
  viewportWidth: number;
  viewportHeight: number;
  /** 선호하는 꼬리 변. 자리가 모자라면 반대편으로 뒤집는다. 기본 `top` (앵커 아래에 표시) */
  placement?: BubblePlacement;
  /** 앵커와 꼬리 끝 사이 간격 */
  gap?: number;
  /** 뷰포트 가장자리와 말풍선 사이 최소 간격 */
  margin?: number;
}

export interface BubblePosition {
  placement: BubblePlacement;
  /** `SpeechBubble`의 `tailOffset`으로 넘길 값 */
  tailOffset: number;
  /** 말풍선 영역 좌상단의 뷰포트 좌표 (`position: fixed` 기준) */
  x: number;
  y: number;
}

const OPPOSITE: Record<BubblePlacement, BubblePlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const clamp = (v: number, min: number, max: number) =>
  max < min ? (min + max) / 2 : Math.min(Math.max(v, min), max);

/**
 * 꼬리 끝이 앵커에 닿도록 말풍선 위치를 정한다.
 * 꼬리가 놓인 변은 앵커 쪽이므로, `placement: 'top'`이면 말풍선은 앵커 아래에 놓인다.
 */
export function computeBubblePosition(o: BubblePositionOptions): BubblePosition {
  const gap = o.gap ?? 4;
  const margin = o.margin ?? 8;
  const preferred = o.placement ?? 'top';
  const { anchor: a, bodyWidth: bw, bodyHeight: bh, tailSize: t } = o;

  const centerX = (a.left + a.right) / 2;
  const centerY = (a.top + a.bottom) / 2;

  // 꼬리가 놓인 변에 따라 꼬리 영역을 포함한 전체 크기가 달라진다
  const sizeFor = (p: BubblePlacement) =>
    p === 'top' || p === 'bottom' ? { w: bw, h: bh + t } : { w: bw + t, h: bh };

  // 꼬리 끝이 놓일 점
  const tipFor = (p: BubblePlacement) => {
    switch (p) {
      case 'top':
        return { x: centerX, y: a.bottom + gap };
      case 'bottom':
        return { x: centerX, y: a.top - gap };
      case 'left':
        return { x: a.right + gap, y: centerY };
      case 'right':
        return { x: a.left - gap, y: centerY };
    }
  };

  // 주 축 방향으로 뷰포트에 얼마나 삐져나가는지 (0이면 들어맞음)
  const overflowFor = (p: BubblePlacement) => {
    const tip = tipFor(p);
    const { w, h } = sizeFor(p);
    switch (p) {
      case 'top':
        return Math.max(0, tip.y + h + margin - o.viewportHeight);
      case 'bottom':
        return Math.max(0, margin - (tip.y - h));
      case 'left':
        return Math.max(0, tip.x + w + margin - o.viewportWidth);
      case 'right':
        return Math.max(0, margin - (tip.x - w));
    }
  };

  const placement =
    overflowFor(preferred) === 0 || overflowFor(preferred) <= overflowFor(OPPOSITE[preferred])
      ? preferred
      : OPPOSITE[preferred];

  const tip = tipFor(placement);
  const { w, h } = sizeFor(placement);
  const horizontal = placement === 'top' || placement === 'bottom';
  // 꼬리 중심이 놓일 수 있는 변 위의 범위
  const edge = horizontal ? w : h;
  const minOffset = o.radius + o.tailWidth / 2;
  const maxOffset = edge - o.radius - o.tailWidth / 2;

  let x: number;
  let y: number;
  let tailOffset: number;

  if (horizontal) {
    y = placement === 'top' ? tip.y : tip.y - h;
    // 앵커 중앙에 맞추되 뷰포트 안에 두고, 꼬리가 말풍선 변 밖으로 나가지 않게 한다
    const wanted = clamp(tip.x - w / 2, margin, o.viewportWidth - margin - w);
    x = clamp(wanted, tip.x - maxOffset, tip.x - minOffset);
    tailOffset = tip.x - x;
  } else {
    x = placement === 'left' ? tip.x : tip.x - w;
    const wanted = clamp(tip.y - h / 2, margin, o.viewportHeight - margin - h);
    y = clamp(wanted, tip.y - maxOffset, tip.y - minOffset);
    tailOffset = tip.y - y;
  }

  return { placement, tailOffset, x, y };
}
