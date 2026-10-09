# naver-endic

[WXT](https://wxt.dev) 프레임워크로 만드는 **크로스 브라우저 웹 확장(Web Extension)** 프로젝트입니다.
Firefox, Chrome 등 여러 웹 브라우저를 대상으로 합니다.

## 원칙

- 모든 확장 기능은 WXT 규약(`entrypoints/`, `defineConfig`, `defineBackground` 등)을 따릅니다.
- 특정 브라우저에서만 동작하는 코드를 피하고, 크로스 브라우저를 기본으로 합니다. 브라우저별 분기가 필요하면 WXT의 `import.meta.env.BROWSER` / `manifest: ({ browser }) => ...` 를 사용합니다.
- 확장 API는 `browser.*` (WXT가 제공하는 `wxt/browser`)를 사용하고 `chrome.*`를 직접 쓰지 않습니다.
- Firefox 전용 설정(`browser_specific_settings.gecko`)은 `wxt.config.ts`에서 관리합니다.

## UI

- 선언적·반응형 UI 라이브러리로 [Lit](https://lit.dev)을 사용합니다. UI는 Lit 웹 컴포넌트(`LitElement`, `html`, `@property`/`@state` 등 반응형 프로퍼티)로 작성하고, DOM을 직접 조작하는 명령형 코드는 피합니다.
- 컴포넌트는 `components/`에 둡니다.

## 디렉터리 구조

파일이나 디렉터리를 새로 만들 때는 `wxt-structure` skill([.claude/skills/wxt-structure/SKILL.md](.claude/skills/wxt-structure/SKILL.md))을 참조합니다. (WXT 공식 매뉴얼 기준)

## 명령어 (pnpm)

| 목적 | Chrome | Firefox |
| --- | --- | --- |
| 개발 | `pnpm dev` | `pnpm dev:firefox` |
| 빌드 | `pnpm build` | `pnpm build:firefox` |
| 패키징(zip) | `pnpm zip` | `pnpm zip:firefox` |

- 타입 검사: `pnpm compile`
- 빌드 결과물은 `.output/`, WXT 생성 파일은 `.wxt/`에 있으며 직접 수정하지 않습니다.

## 스택

TypeScript, Lit, Vite, WXT, web-ext
