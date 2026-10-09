import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // WXT는 Firefox를 기본 MV2로 빌드하므로, 모든 브라우저를 MV3로 통일한다.
  manifestVersion: 3,
  manifest: () => ({
    // 기존에 배포된 Firefox 확장을 이어가기 위한 add-on ID. 변경하지 말 것.
    browser_specific_settings: {
      gecko: {
        id: 'jid0-4NyOrh90OO8ezy2B2j9O4zgrQdk@jetpack',
      },
    },
  }),
});
