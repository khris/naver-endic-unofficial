const TOOLTIP_ID = '_ext_tooltip_34F75D';

let prefs = null;
let ignoreMouseEvent = false;

/* global defaultPrefs */
browser.storage.local.get('prefs', (rawItem) => {
  // see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/get
  const item = Array.isArray(rawItem) ? rawItem[0] : rawItem;
  prefs = item.prefs ? item.prefs : defaultPrefs;
});

browser.storage.onChanged.addListener((changes, area) => {
  prefs = changes.prefs.newValue;
});

let popup = document.createElement('div');
popup.style.cssText = 'position: absolute; left: 0; top: 0; z-index: 999999; background-color: white';

document.addEventListener('selectionchange', () => {
  ignoreMouseEvent = false;
});

document.addEventListener('mouseup', (e) => {
  if (!isTooltip(e.target)) {
    hideTooltip();
  }
  if (prefs === null || prefs.wordSelectMode != 0 || ignoreMouseEvent) {
    return;
  }
  let sel = document.getSelection();
  let text = sel.toString().trim();
  if (text.length < 1) {
    return;
  }
  let focusNode = sel.focusNode;
  if (focusNode.nodeName.toLowerCase() == 'textarea'
    || focusNode.nodeName.toLowerCase() == 'input') {
    return;
  }
  ignoreMouseEvent = true;
  showTooltipFromSelection(sel, text);
});

document.addEventListener('click', (e) => {
  if (prefs === null || prefs.wordSelectMode != 1) {
    return;
  }
  if (e.ctrlKey != prefs.useCtrl
    || e.altKey != prefs.useAlt
    || e.metaKey != prefs.useMeta) {
    return;
  }
  let oldSettings = enableTextSelection();
  try {
    let sel = document.getSelection();
    sel.removeAllRanges();
    let range = createRangeFromPoint(e.clientX, e.clientY);
    if (range === null) {
      return;
    }
    sel.addRange(range);
    sel.modify("move", "backward", "word");
    sel.modify("extend", "forward", "word");
    let text = sel.toString().trim();
    if (text.length < 1) {
      return;
    }
    showTooltipFromSelection(sel, text);
    sel.removeAllRanges();
  } finally {
    restoreTextSelection(oldSettings);
  }
});

function enableTextSelection() {
  let oldSettings = {};
  if (document.body.style.MozUserSelect !== null) {
    oldSettings['MozUserSelect'] = document.body.style.MozUserSelect;
    document.body.style.MozUserSelect = 'text';
  }
  document.addEventListener('selectstart', function (e) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    return true;
  }, {
      capture: true,
      once: true
    });
  return oldSettings;
}

function restoreTextSelection(oldSettings) {
  if (oldSettings['MozUserSelect'] !== undefined) {
    document.body.style.MozUserSelect = oldSettings['MozUserSelect'];
  }
}

function createRangeFromPoint(x, y) {
  let range = document.createRange();
  let textNode;
  let offset;

  if (document.caretPositionFromPoint) {
    let caretPos = document.caretPositionFromPoint(x, y);
    textNode = caretPos.offsetNode;
    offset = caretPos.offset;
    if (caretPos == null) {
      return null;
    }
  } else if (document.caretRangeFromPoint) {
    let caretRange = document.caretRangeFromPoint(x, y);
    if (caretRange == null) {
      return null;
    }
    textNode = caretRange.startContainer;
    offset = caretRange.startOffset;
  } else {
    return null;
  }
  range.setStart(textNode, offset);
  range.setEnd(textNode, offset);
  return range;
}

function showTooltipFromSelection(sel, text) {
  hideTooltip();
  let range = sel.getRangeAt(0);
  let bounds = range.getBoundingClientRect();
  showTooltip(text, {
    left: Math.trunc(window.pageXOffset + bounds.left),
    top: Math.trunc(window.pageYOffset + bounds.bottom)
  });
}

function showTooltip(text, pos) {
  let ret = getWordMeaning(text);
  ret.then((result) => {
    tooltip = result;
    tooltip.id = TOOLTIP_ID;
    tooltip.style.setProperty('position', `absolute`, 'important');
    tooltip.style.setProperty('top', `${pos.top}px`, 'important');
    tooltip.style.setProperty('left', `${pos.left}px`, 'important');
    tooltip.style.setProperty('display', `block`, 'important');
    tooltip.style.setProperty('width', `fit-content`, 'important');
    tooltip.style.setProperty('width', `-moz-fit-content`, 'important');
    tooltip.style.setProperty('width', `-webkit-fit-content`, 'important');
    tooltip.style.setProperty('height', `auto`, 'important');
    tooltip.style.setProperty('z-index', `${Number.MAX_SAFE_INTEGER}`, 'important');
    tooltip.style.setProperty('background-color', `white`, 'important');
    tooltip.style.setProperty('color', `black`, 'important');
    tooltip.style.setProperty('font', `normal 12px sans-serif`, 'important');
    tooltip.style.setProperty('border', `1px solid black`, 'important');
    tooltip.style.setProperty('margin', `0`, 'important');
    tooltip.style.setProperty('padding', `0`, 'important');
    document.body.appendChild(tooltip);
  }).catch(() => {
    // do nothing
  });
}

function hideTooltip() {
  let tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip != null) {
    document.body.removeChild(tooltip);
  }
}

function isTooltip(elem) {
  let tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip == null) {
    return false;
  }
  return (tooltip == elem || tooltip.contains(elem));
}

function getWordMeaning(word) {
  let dictUrl = `http://m.endic.naver.com/search.nhn?sLn=en&query=${encodeURIComponent(word)}&searchOption=entryIdiom&forceRedirect=`;
  let dictPageUrl = `http://endic.naver.com/search.nhn?sLn=kr&query=${encodeURIComponent(word)}`;
  return fetch(dictUrl).then((response) => response.text())
    .then((text) => (new DOMParser()).parseFromString(text, 'text/html'))
    .then((doc) => {
      let tooltip = document.createElement('div');
      let cards = doc.body.querySelectorAll('div.section_card div.entry_search_word');
      if (cards.length < 1) {
        throw Error('No Result');
      }
      let result = '';
      let i = 0;
      for (let card of cards) {
        let title = card.querySelector('div.h_word');
        for (let child of title.children) {
          if (child.classList.contains('link_wrap')) {
            child.remove();
          }
        }
        let descs = card.querySelectorAll('ul.desc_lst p.desc');
        let dl = document.createElement("dl");
        dl.style = "margin: 6px";
        dl.innerHTML = title.innerHTML;
        tooltip.appendChild(dl);
        let pronounces = card.querySelectorAll('div.pronun_area');
        let i = 0;
        for (let pronounce of pronounces) {
          let country = pronounce.querySelector('em.speech');
          let pronounceText = pronounce.querySelector('span.pronun');
          let pronounceButton = pronounce.querySelector('button.btn_listen');
          if (pronounceText === null) {
            continue;
          } else {
            dl.appendChild(country);
            dl.appendChild(pronounceText);

            if (pronounceButton != null) {
              let splittedPronounceButton = pronounceButton.outerHTML.split("'");
              if (splittedPronounceButton.length > 0) {
                let button = document.createElement("button");
                button.onclick = function () {
                  let audio = new Audio(splittedPronounceButton[1]);
                  audio.play();
                }
                button.innerHTML = "발음듣기";
                dl.appendChild(button);
              }
            }
          }
        }

        let dd = document.createElement("dd");
        dd.style = "margin-left: 1em";
        if (descs.length > 1) {
          let ol = document.createElement("ol");
          ol.style = "margin: 0; padding-left: 1em; list-style: decimal";
          for (let desc of descs) {
            let li = document.createElement("li");
            li.innerText = desc.textContent;
            ol.appendChild(li);
          }
        } else if (descs.length == 1) {
          dd.innerText = descs[0].textContent;
        }
        dl.appendChild(dd);
        i++;
        if (i >= 5) {
          break;
        }
      }
      let p = document.createElement("p")
      p.style = "margin: 6px; text-align: right";

      let a = document.createElement("a")
      a.href = "${dictPageUrl}";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerText = "네이버 사전 열기";

      p.appendChild(a);
      tooltip.appendChild(p);

      return tooltip;
    });
}
