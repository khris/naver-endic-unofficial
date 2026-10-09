---
name: wxt-structure
description: WXT 프로젝트의 디렉터리 구조와 entrypoint 파일 명명 규칙. 새 파일/디렉터리를 만들거나 entrypoint(background, content script, popup, options, sidepanel 등)를 추가·이동할 때 반드시 참조한다.
---

# WXT 디렉터리 구조 가이드

출처: https://wxt.dev/guide/essentials/project-structure.html , https://wxt.dev/guide/essentials/entrypoints.html
(내용이 의심스러우면 공식 문서를 다시 확인한다.)

## 최상위 구조 (이 프로젝트는 flat 레이아웃, `srcDir` 기본값 `.`)

| 경로 | 용도 |
| --- | --- |
| `entrypoints/` | 확장에 번들되는 entrypoint. 아래 명명 규칙 참조 |
| `components/` | UI 컴포넌트 (Lit 컴포넌트는 여기). auto-import 대상 |
| `utils/` | 프로젝트 전반에서 쓰는 범용 유틸. auto-import 대상 |
| `assets/` | WXT(Vite)가 처리하는 CSS, 이미지 등 |
| `public/` | 처리 없이 출력물에 그대로 복사되는 파일 (아이콘 등) |
| `modules/` | 로컬 [WXT Modules](https://wxt.dev/guide/essentials/wxt-modules) |
| `app.config.ts` | 런타임 설정 |
| `wxt.config.ts` | WXT 메인 설정 |
| `web-ext.config.ts` | 개발 시 브라우저 시작 설정 |
| `.env`, `.env.publish` | 환경 변수 / 배포용 환경 변수 |
| `.output/`, `.wxt/` | 빌드 결과물 / WXT 생성 파일. **직접 수정·커밋 금지** |

- `composables/`(Vue), `hooks/`(React/Solid)는 이 프로젝트에서 쓰지 않는다 (Lit 사용).
- `srcDir: 'src'`로 바꾸면 `assets/ components/ entrypoints/ utils/ app.config.ts`가 `src/`로 이동한다. `public/ modules/ .output/ .wxt/ 설정 파일들`은 루트에 남는다.

## entrypoint 규칙

- entrypoint는 **단일 파일** 또는 **`index` 파일이 있는 디렉터리**이며, **이름이 타입을 결정**한다.
- `entrypoints/` 아래 **깊이는 0~1단계**만 허용. 관련 보조 파일(스타일, 헬퍼, 컴포넌트)을 `entrypoints/` 바로 아래에 두면 WXT가 entrypoint로 빌드하려 하므로, 보조 파일은 해당 entrypoint 디렉터리 안이나 `components/`, `utils/`에 둔다.

| Entrypoint | 단일 파일 | 디렉터리 | 출력 경로 |
| --- | --- | --- | --- |
| Background | `background.ts` | `background/index.ts` | `/background.js` |
| Content Script | `content.ts` | `content/index.ts` | `/content-scripts/content.js` |
| Content Script (이름 지정) | `{name}.content.ts` | `{name}.content/index.ts` | `/content-scripts/{name}.js` |
| Popup | `popup.html` | `popup/index.html` | `/popup.html` |
| Options | `options.html` | `options/index.html` | `/options.html` |
| Side Panel | `sidepanel.html` | `sidepanel/index.html` | `/sidepanel.html` |
| Side Panel (이름 지정) | `{name}.sidepanel.html` | `{name}.sidepanel/index.html` | `/{name}.html` |
| DevTools | `devtools.html` | `devtools/index.html` | `/devtools.html` |
| Newtab / Bookmarks / History | `newtab.html` 등 | `newtab/index.html` 등 | `/newtab.html` 등 |
| Sandbox (Chromium 전용) | `sandbox.html`, `{name}.sandbox.html` | `sandbox/index.html` | `/sandbox.html`, `/{name}.html` |
| Unlisted Page | `{name}.html` | `{name}/index.html` | `/{name}.html` |
| Unlisted Script | `{name}.ts` | `{name}/index.ts` | `/{name}.js` |
| Unlisted CSS | `{name}.css` (scss/sass/less/styl 가능) | `{name}/index.css` | `/{name}.css` |
| Content Script CSS | `content.css`, `{name}.content.css` | `content/index.css` | `/content-scripts/content.css`, `/content-scripts/{name}.css` |

## 정의 헬퍼와 주의점

- `defineBackground`, `defineContentScript`, `defineUnlistedScript`를 default export 한다.
- **런타임 코드는 반드시 `main` 안에** 둔다. `main` 밖의 코드는 빌드 시 Node에서 실행되므로 `browser.*` 등 런타임 API를 쓰면 안 된다.
- background의 `main`은 async 불가. content script의 `main`은 async 가능.
- unlisted script/page는 직접 로드해야 하고, 필요하면 `web_accessible_resources`에 추가한다. 런타임 경로는 `browser.runtime.getURL('/{name}.html')` / `'/{name}.js'`.
- HTML entrypoint의 옵션은 `<meta name="manifest.*">`로 지정한다 (예: `manifest.include`, `manifest.exclude`, popup의 `manifest.type`, options의 `manifest.open_in_tab`).

## 브라우저별 대상 지정 (크로스 브라우저)

- JS entrypoint: 헬퍼 옵션 `include` / `exclude`에 브라우저 배열 지정 (예: `exclude: ['firefox']`).
- HTML entrypoint: `<meta name="manifest.include" content="['chrome']">` / `manifest.exclude`.
- Sandbox는 Chromium 전용. Side Panel은 Chrome은 `side_panel` API, Firefox는 `sidebar_action`을 사용한다.
- Popup의 `manifest.default_area`, `manifest.theme_icons`는 Firefox 전용.

## 새 파일을 만들 때 체크리스트

1. entrypoint인가? → `entrypoints/`에 위 명명 규칙대로, 깊이 ≤ 1.
2. 재사용 UI(Lit 컴포넌트)인가? → `components/`.
3. 범용 로직인가? → `utils/`.
4. 번들 처리가 필요한 CSS/이미지인가? → `assets/`. 그대로 복사할 정적 파일은 `public/`.
5. 특정 entrypoint에서만 쓰는 보조 파일인가? → 그 entrypoint의 디렉터리 안(`{name}/`).
