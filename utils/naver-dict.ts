import type { DictEntry } from './dict-search';

const ORIGIN = 'https://en.dict.naver.com';

// 이 API가 쓰는 필드만 적는다. 공식 API가 아니라서 응답이 바뀔 수 있다.
interface WordItem {
  expEntry: string;
  sourceDictnameKO: string;
  destinationLink: string;
  searchPhoneticSymbolList?: { symbolType?: string | null; symbolValue?: string | null; symbolFile?: string | null }[];
  meansCollector?: {
    partOfSpeech?: string | null;
    means?: { value: string; exampleOri?: string | null; exampleTrans?: string | null }[];
  }[];
}

interface SearchResponse {
  searchResultMap?: { searchResultListMap?: { WORD?: { items?: WordItem[] } } };
}

/**
 * 네이버 영한사전에서 단어를 찾는다. background에서 호출한다.
 *
 * 이 API는 `Origin`이 없고 `Referer`가 네이버 도메인이어야만 응답한다.
 * 두 헤더는 `fetch`로 정할 수 없어서 `naver-dict-rules.ts`의 규칙이 대신 고친다.
 */
export async function searchNaverDict(query: string): Promise<DictEntry[]> {
  const params = new URLSearchParams({ query, m: 'mobile', range: 'all', lang: 'ko' });
  const response = await fetch(`${ORIGIN}/api3/enko/search?${params}`);
  if (!response.ok) throw new Error(`사전 서버가 ${response.status}를 응답했습니다.`);
  // 헤더 조건이 맞지 않으면 오류 없이 빈 본문이 온다
  const body = await response.text();
  if (!body) throw new Error('사전 서버가 빈 응답을 보냈습니다.');

  const data = JSON.parse(body) as SearchResponse;
  const items = data.searchResultMap?.searchResultListMap?.WORD?.items ?? [];

  return items.map((item) => ({
    title: item.expEntry,
    source: item.sourceDictnameKO,
    url: new URL(item.destinationLink, `${ORIGIN}/`).href,
    pronunciations: (item.searchPhoneticSymbolList ?? [])
      .filter((p) => p.symbolValue || p.symbolFile)
      .map((p) => ({
        label: p.symbolType ?? '',
        symbol: p.symbolValue ?? '',
        audio: p.symbolFile || undefined,
      })),
    partsOfSpeech: (item.meansCollector ?? []).map((c) => ({
      label: c.partOfSpeech ?? '',
      meanings: (c.means ?? []).map((m) => ({
        html: m.value,
        example: m.exampleOri ? { en: m.exampleOri, ko: m.exampleTrans ?? '' } : undefined,
      })),
    })),
  }));
}
