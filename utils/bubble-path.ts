export type BubblePlacement = 'top' | 'bottom' | 'left' | 'right';

export interface BubbleGeometryOptions {
  /** 꼬리를 제외한 본체(둥근 사각형)의 크기 */
  bodyWidth: number;
  bodyHeight: number;
  placement: BubblePlacement;
  /** 꼬리가 놓이는 변을 따라, 변의 시작(top/bottom은 왼쪽, left/right는 위쪽)에서 꼬리 중심까지의 거리. 생략하면 중앙 */
  tailOffset?: number;
  /** 꼬리가 본체 밖으로 튀어나오는 길이 */
  tailSize: number;
  /** 꼬리 밑변의 너비 */
  tailWidth: number;
  radius: number;
}

export interface BubbleGeometry {
  /** SVG path의 d 값. 좌표 원점은 꼬리 영역을 포함한 전체 영역의 좌상단 */
  path: string;
  /** 꼬리 영역을 포함한 전체 크기 */
  width: number;
  height: number;
  /** 꼬리 끝(앵커에 닿아야 하는 점)의 좌표 */
  tip: { x: number; y: number };
}

export function computeBubbleGeometry(o: BubbleGeometryOptions): BubbleGeometry {
  const { bodyWidth: bw, bodyHeight: bh, placement, tailSize: t, tailWidth, radius } = o;
  const r = Math.max(0, Math.min(radius, bw / 2, bh / 2));
  const half = tailWidth / 2;

  const ox = placement === 'left' ? t : 0;
  const oy = placement === 'top' ? t : 0;

  const horizontal = placement === 'top' || placement === 'bottom';
  const edgeLength = horizontal ? bw : bh;
  const min = r + half;
  const max = edgeLength - r - half;
  const center = edgeLength / 2;
  // 변이 꼬리를 담기에 너무 짧으면 중앙에 둔다
  const offset = max < min ? center : Math.min(Math.max(o.tailOffset ?? center, min), max);

  const tx = ox + offset;
  const ty = oy + offset;
  const right = ox + bw;
  const bottom = oy + bh;

  const segments = [`M${ox + r},${oy}`];
  let tip: { x: number; y: number };

  // 시계 방향으로 진행하며, 꼬리가 놓인 변에서만 꼬리를 끼워 넣는다
  if (placement === 'top') {
    segments.push(`L${tx - half},${oy}`, `L${tx},${oy - t}`, `L${tx + half},${oy}`);
    tip = { x: tx, y: oy - t };
  }
  segments.push(`L${right - r},${oy}`, `A${r},${r} 0 0 1 ${right},${oy + r}`);

  if (placement === 'right') {
    segments.push(`L${right},${ty - half}`, `L${right + t},${ty}`, `L${right},${ty + half}`);
    tip = { x: right + t, y: ty };
  }
  segments.push(`L${right},${bottom - r}`, `A${r},${r} 0 0 1 ${right - r},${bottom}`);

  if (placement === 'bottom') {
    segments.push(`L${tx + half},${bottom}`, `L${tx},${bottom + t}`, `L${tx - half},${bottom}`);
    tip = { x: tx, y: bottom + t };
  }
  segments.push(`L${ox + r},${bottom}`, `A${r},${r} 0 0 1 ${ox},${bottom - r}`);

  if (placement === 'left') {
    segments.push(`L${ox},${ty + half}`, `L${ox - t},${ty}`, `L${ox},${ty - half}`);
    tip = { x: ox - t, y: ty };
  }
  segments.push(`L${ox},${oy + r}`, `A${r},${r} 0 0 1 ${ox + r},${oy}`, 'Z');

  return {
    path: segments.join(' '),
    width: bw + (horizontal ? 0 : t),
    height: bh + (horizontal ? t : 0),
    tip: tip!,
  };
}
