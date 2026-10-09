import { defineConfig } from 'wxt';
import { MATCHES } from './utils/matches';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // WXT는 Firefox를 기본 MV2로 빌드하므로, 모든 브라우저를 MV3로 통일한다.
  manifestVersion: 3,
  webExt: {
    // 개발용 Firefox에서 웹 페이지에 끼운 확장 iframe이 localhost dev 서버에 접근하도록 허용한다.
    firefoxPref: { 'network.lna.blocking': false },
  },
  manifest: () => ({
    // content script가 iframe으로 띄우는 사전 페이지
    web_accessible_resources: [{ resources: ['dict.html'], matches: MATCHES }],
    // 네이버 사전 API 호출과 그 요청의 Origin/Referer 헤더 보정, 설정 저장
    permissions: ['declarativeNetRequest', 'storage'],
    host_permissions: ['https://en.dict.naver.com/*'],
    // 기존에 배포된 Firefox 확장을 이어가기 위한 add-on ID. 변경하지 말 것.
    browser_specific_settings: {
      gecko: {
        id: 'jid0-4NyOrh90OO8ezy2B2j9O4zgrQdk@jetpack',
        // 선택한 텍스트가 사전 조회를 위해 네이버로 전송된다
        data_collection_permissions: {
          required: ['websiteContent'],
        },
      },
    },
  }),
});
