import { isDictSearchRequest, type DictSearchResponse } from '@/utils/dict-search';
import { searchNaverDict } from '@/utils/naver-dict';
import { registerNaverDictRules } from '@/utils/naver-dict-rules';

export default defineBackground(() => {
  registerNaverDictRules().catch((error) => console.error('헤더 규칙 등록 실패', error));

  // Promise를 돌려주는 방식은 Chrome에서 쓸 수 없어서 sendResponse와 `return true`를 쓴다
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isDictSearchRequest(message)) return;
    searchNaverDict(message.query).then(
      (entries): DictSearchResponse => ({ ok: true, entries }),
      (error): DictSearchResponse => ({ ok: false, error: String(error?.message ?? error) }),
    ).then(sendResponse);
    return true;
  });
});
