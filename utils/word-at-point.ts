// 영어 단어를 이루는 글자. 아포스트로피와 하이픈은 단어 안에서만 허용한다
const WORD_CHAR = /[\p{L}\p{N}'’-]/u;

function caretFromPoint(x: number, y: number): { node: Node; offset: number } | null {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    return pos && { node: pos.offsetNode, offset: pos.offset };
  }
  // Chrome 127 이하
  const range = (
    document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }
  ).caretRangeFromPoint?.(x, y);
  return range ? { node: range.startContainer, offset: range.startOffset } : null;
}

/** 화면 좌표 아래의 단어와 그 영역. 텍스트가 아니거나 단어 위가 아니면 `null` */
export function wordAtPoint(x: number, y: number): { text: string; rect: DOMRect } | null {
  const caret = caretFromPoint(x, y);
  if (!caret || caret.node.nodeType !== Node.TEXT_NODE) return null;
  const text = caret.node.textContent ?? '';

  let start = caret.offset;
  let end = caret.offset;
  while (start > 0 && WORD_CHAR.test(text.charAt(start - 1))) start--;
  while (end < text.length && WORD_CHAR.test(text.charAt(end))) end++;
  // 단어 가장자리의 구두점 같은 문자는 뺀다
  while (start < end && /['’-]/.test(text.charAt(start))) start++;
  while (end > start && /['’-]/.test(text.charAt(end - 1))) end--;
  if (start === end) return null;

  const range = document.createRange();
  range.setStart(caret.node, start);
  range.setEnd(caret.node, end);
  const rect = range.getBoundingClientRect();
  // 캐럿은 가장 가까운 글자로 잡히므로, 실제로 단어 위를 클릭했는지 확인한다
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
  return { text: text.slice(start, end), rect };
}
