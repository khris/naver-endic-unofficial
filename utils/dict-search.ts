/** 사전 페이지(iframe)와 background 사이의 조회 규약, 그리고 조회 결과 타입 */

export interface DictPronunciation {
  /** 예: 미국식, 영국식 */
  label: string;
  /** 발음기호. 없을 수 있다 */
  symbol: string;
  /** 발음 음성 URL. 없을 수 있다 */
  audio?: string;
}

export interface DictExample {
  /** 원문. 일부가 `<strong>`으로 강조되어 있다 */
  en: string;
  ko: string;
}

export interface DictMeaning {
  /** 뜻. `<strong>`, `<span class="related_word">`가 섞인 HTML 조각 */
  html: string;
  example?: DictExample;
}

export interface DictPartOfSpeech {
  /** 품사. 예: 명사 */
  label: string;
  meanings: DictMeaning[];
}

export interface DictEntry {
  /** 표제어. `<strong>`이 섞인 HTML 조각 */
  title: string;
  /** 출처 사전 이름 */
  source: string;
  /** 네이버 사전의 상세 페이지 */
  url: string;
  pronunciations: DictPronunciation[];
  partsOfSpeech: DictPartOfSpeech[];
}

export type DictSearchRequest = { type: 'dict:search'; query: string };

export type DictSearchResponse =
  | { ok: true; entries: DictEntry[] }
  | { ok: false; error: string };

export function isDictSearchRequest(data: unknown): data is DictSearchRequest {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.type === 'dict:search' && typeof d.query === 'string';
}

/** background에 조회를 요청한다 */
export async function searchDict(query: string): Promise<DictEntry[]> {
  const request: DictSearchRequest = { type: 'dict:search', query };
  const response: DictSearchResponse | undefined = await browser.runtime.sendMessage(request);
  if (!response) throw new Error('background가 응답하지 않았습니다.');
  if (!response.ok) throw new Error(response.error);
  return response.entries;
}
