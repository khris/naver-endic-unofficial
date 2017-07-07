const modeIcons = [
  'icons/ic_mode_classic.png',
  'icons/ic_mode_std.png'
];
const modeName = [
  'Classic mode (Drag)',
  'Standard (Modifier Keys + Click)'
];

browser.storage.onChanged.addListener((changes, area) => {
  const wordSelectMode = changes.prefs.newValue.wordSelectMode;
  browser.browserAction.setIcon({
    path: modeIcons[wordSelectMode]
  });
  browser.browserAction.setTitle({
    title: `Naver English Dictionary (Unofficial)\n${modeName[wordSelectMode]}`
  });
});

browser.browserAction.onClicked.addListener((tab) => {
  browser.runtime.openOptionsPage();
});

let port = browser.runtime.connect({ name: 'sync-legacy-addon-data' });

port.onMessage.addListener((msg) => {
  if (msg) {
    browser.storage.local.set(msg);
  }
});

browser.commands.onCommand.addListener((cmd) => {
  if (cmd === 'toggle-mode') {
    browser.runtime.sendMessage({
      cmd: cmd
    });
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
