const modeIcons = [
  'icons/ic_mode_classic.png',
  'icons/ic_mode_std.png'
];
const modeName = [
  '옛날 방법 (드래그)',
  '표준 (기능키 + 클릭)'
];

function initBrowserAction(wordSelectMode) {
  browser.browserAction.setIcon({
    path: modeIcons[wordSelectMode]
  });
  browser.browserAction.setTitle({
    title: `Naver English Dictionary (Unofficial)\n${modeName[wordSelectMode]}`
  });
}

/* global defaultPrefs */
browser.storage.local.get({
  prefs: defaultPrefs
}).then((results) => {
  const { prefs } = results;
  initBrowserAction(prefs.wordSelectMode);
});

browser.storage.onChanged.addListener((changes, area) => {
  const wordSelectMode = changes.prefs.newValue.wordSelectMode;
  initBrowserAction(wordSelectMode);
});

browser.browserAction.onClicked.addListener((tab) => {
  browser.runtime.openOptionsPage();
});

browser.commands.onCommand.addListener((cmd) => {
  if (cmd === 'toggle-mode') {
    browser.runtime.sendMessage({
      cmd: cmd
    });
  }
});

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    browser.tabs.create({
      url: 'https://khris.github.io/naver-endic-unofficial/'
    })
  }
});

/* 일단 안씀
browser.webRequest.onHeadersReceived.addListener((e) => {
    for (var i = 0; i < e.responseHeaders.length; i++) {
      if (e.responseHeaders[i].name === 'X-Frame-Options') {
        e.responseHeaders.splice(i, 1);
        break;
      }
    }
    return { responseHeaders: e.responseHeaders };
  },
  { urls: ['http://endic.naver.com/*'] },
  ["blocking", "responseHeaders"]
);
*/
