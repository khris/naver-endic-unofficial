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
  showPopupFromSelection(sel, text);
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
    showPopupFromSelection(sel, text);
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

function showPopupFromSelection(sel, text) {
  let range = sel.getRangeAt(0);
  let bounds = range.getBoundingClientRect();
  showPopup(text, {
    left: bounds.right,
    top: bounds.bottom
  });
}

function showPopup(text, pos) {
  /* 일단은 쓰지 않는다
  popup.innerHTML = `<iframe src="${browser.extension.getURL('dict.html')}?text=${encodeURI(text)}"></iframe>`;
  let iframe = popup.querySelector('iframe');
  iframe.style.cssText = 'width: 408px; height: 522px';
  document.body.appendChild(popup);
  */
  browser.runtime.sendMessage({
    cmd: 'show-popup',
    text: text,
    pos: pos
  });
}

function hidePopup() {
  document.body.removeChild(popup);
}