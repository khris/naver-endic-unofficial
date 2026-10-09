import { html, type TemplateResult } from 'lit';

type Inline = string | TemplateResult | Inline[];

function convert(node: Node): Inline {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element)) return '';
  const children = Array.from(node.childNodes, convert);
  if (node.tagName === 'STRONG') return html`<strong>${children}</strong>`;
  // 발음기호의 강세 표시
  if (node.tagName === 'SUB') return html`<sub>${children}</sub>`;
  if (node.tagName === 'SUP') return html`<sup>${children}</sup>`;
  if (node.classList.contains('related_word')) return html`<span class="related">${children}</span>`;
  // 그 밖의 태그는 벗기고 내용만 남긴다
  return children;
}

/**
 * 사전 API가 주는 HTML 조각을 안전하게 템플릿으로 바꾼다.
 * `<strong>`, `<sub>`, `<sup>`과 `related_word` 클래스만 살리고 나머지 태그와 속성은 버린다.
 */
export function inlineHtml(source: string): Inline {
  // DOMParser는 스크립트를 실행하거나 리소스를 불러오지 않는다
  const doc = new DOMParser().parseFromString(source, 'text/html');
  return Array.from(doc.body.childNodes, convert);
}
