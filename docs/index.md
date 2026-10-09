---
---

네이버 툴바가 Mozilla Firefox 지원을 중단한지 오래돼서 OpenAPI고 뭐고 작은창 띄우는게 편하다보니 대충 만들었습니다.

## 최신 버전

{% for item in site.github.releases limit:1 %}
{% include release.html item=item title_elem="h3" %}
{% endfor %}

<a href="{{ site.github.baseurl }}{% link history.md %}">이전 버전 보기</a>

## 사용법

사전에서 찾기 원하는 단어를 드래그 혹은 <kbd>Alt</kbd>+Click으로 선택하세요. <kbd>Alt</kbd> 대신 다른 키를 조합하고 싶으시면 확장기능 페이지(about:addons)에서 설정하실 수 있습니다.

### 모드

기능키와 함께 클릭한 단어를 검색해주는 스탠다드 모드와 드래그하여 선택한 단어를 검색해주는 클래식 모드의 두 가지 모드가 있습니다. 기본은 스탠다드 모드입니다.

모드를 전환하고 싶을때는 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>(MacOSX는 <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>)를 누르거나 툴바에 나타나는 아이콘을 클릭하면 됩니다. 혹은 확장기능 페이지(about:addons)에서 설정하실 수 있습니다.
