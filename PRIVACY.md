# 개인정보 처리 안내 / Privacy Policy

naver-endic-unofficial은 네이버와 무관한 비공식 확장입니다. / naver-endic-unofficial is an unofficial extension and is not affiliated with Naver.

## 한국어

### 전송되는 정보

- 사전 조회를 위해 **사용자가 선택하거나 클릭한 영어 단어(텍스트)** 가 네이버 영어사전(`en.dict.naver.com`)으로 전송됩니다. 조회 결과를 가져오는 데 필요한 최소한의 정보이며, 조회 기능에 꼭 필요합니다.
- 전송은 사용자가 단어를 선택하거나 보조키와 함께 클릭해 조회할 때만 일어납니다. 그 밖의 페이지 내용, 방문 기록, 입력한 정보는 읽거나 전송하지 않습니다.
- 전송된 텍스트는 네이버의 서비스 약관과 개인정보 처리방침에 따라 처리됩니다. 이 확장은 이를 통제하지 않습니다.

### 저장되는 정보

- 조회 방식과 보조키 설정(`wordSelectMode`, `useCtrl`, `useAlt`, `useMeta`)만 브라우저의 확장 저장소(`storage.sync`)에 저장됩니다. 브라우저 계정의 동기화를 켜 두었다면 브라우저가 이 설정을 동기화할 수 있습니다.
- 조회한 단어나 조회 결과는 저장하지 않습니다.

### 수집하지 않는 것

- 개발자는 어떤 정보도 수집하지 않으며, 별도 서버를 운영하지 않습니다.
- 분석, 광고, 추적 도구를 쓰지 않습니다.
- 제3자에게 정보를 판매하거나 공유하지 않습니다. 위에서 밝힌 네이버로의 전송이 유일한 외부 전송입니다.

### 권한

- 모든 사이트에서 동작(`<all_urls>`): 어느 페이지에서나 선택한 단어를 찾기 위해 필요합니다.
- `https://en.dict.naver.com/*`: 사전 조회 요청을 보내기 위해 필요합니다.
- `declarativeNetRequest`: 사전 조회 요청에 네이버가 요구하는 `Referer` 헤더를 설정하고 `Origin` 헤더를 제거하기 위해 필요합니다. 이 규칙은 네이버 사전 조회 요청에만 적용됩니다.
- `storage`: 위 설정을 저장하기 위해 필요합니다.

## English

### Data sent

- To look up a word, **the English word (text) you select or click** is sent to Naver's English dictionary (`en.dict.naver.com`). This is the minimum needed to fetch the result and is required for the extension to work.
- Text is sent only when you select a word, or click it with a modifier key, to look it up. The extension does not read or send other page content, browsing history, or anything you type.
- Once sent, the text is handled under Naver's terms of service and privacy policy. This extension does not control that.

### Data stored

- Only your lookup mode and modifier-key settings (`wordSelectMode`, `useCtrl`, `useAlt`, `useMeta`) are stored in the browser's extension storage (`storage.sync`). If browser sync is enabled, the browser may sync these settings.
- Looked-up words and results are not stored.

### What is not collected

- The developer collects no data and runs no server.
- No analytics, advertising, or tracking.
- No data is sold or shared with third parties. The transfer to Naver described above is the only external transfer.

### Permissions

- Access to all sites (`<all_urls>`): to detect the word you select on any page.
- `https://en.dict.naver.com/*`: to send the lookup request.
- `declarativeNetRequest`: to set the `Referer` header Naver requires and remove the `Origin` header on lookup requests only.
- `storage`: to save the settings above.
