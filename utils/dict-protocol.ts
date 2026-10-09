/** content script(부모)와 사전 iframe 사이의 postMessage 규약 */

/** iframe의 고정 너비(px). 높이는 내용에 맞춰 iframe이 알려 준다 */
export const DICT_WIDTH = 320;

export type ParentToDict = { type: 'dict:lookup'; text: string };

export type DictToParent = { type: 'dict:ready' } | { type: 'dict:size'; height: number };

export function isDictToParent(data: unknown): data is DictToParent {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.type === 'dict:ready' || (d.type === 'dict:size' && typeof d.height === 'number');
}

export function isParentToDict(data: unknown): data is ParentToDict {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.type === 'dict:lookup' && typeof d.text === 'string';
}
