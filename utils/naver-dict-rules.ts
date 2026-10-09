const RULE_ID = 1;

/**
 * 네이버 사전 API가 요구하는 요청 헤더를 맞추는 규칙을 등록한다.
 * `Origin`을 지우고 `Referer`를 네이버 사전으로 바꾼다.
 *
 * 네이버 사이트 자신의 요청은 건드리지 않도록 제외한다.
 */
export async function registerNaverDictRules() {
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'origin', operation: 'remove' },
            { header: 'referer', operation: 'set', value: 'https://en.dict.naver.com/' },
          ],
        },
        condition: {
          urlFilter: '||en.dict.naver.com/api3/',
          resourceTypes: ['xmlhttprequest'],
          excludedInitiatorDomains: ['naver.com'],
        },
      },
    ],
  });
}
