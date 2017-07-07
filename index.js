const webext = require('sdk/webextension');
const Panel = require("sdk/panel").Panel;

let dictionaryPanel = null;

function createPrefsObject(sp) {
  return {
    prefs: {
      wordSelectMode: sp.prefs['wordSelectMode'],
      useCtrl: sp.prefs['useCtrl'],
      useAlt: sp.prefs['useAlt'],
      useMeta: sp.prefs['useMeta']
    }
  }
}

function setSyncLegacyDataPort (port) {
  const sp = require('sdk/simple-prefs');

  port.postMessage(createPrefsObject(sp));

  sp.on('', () => {
    port.postMessage(createPrefsObject(sp));
  });
};

function showPopup(word, pos) {
  if (dictionaryPanel) {
    dictionaryPanel.destroy();
  }

  dictionaryPanel = new Panel({
    width: 408,
    height: 517,
    position: pos,
    contentURL: 'http://endic.naver.com/popManager.nhn?m=search&query=' + encodeURI(word)
  });
  dictionaryPanel.show();
}

function toggleMode() {
  let sp = require('sdk/simple-prefs');
  switch (sp.prefs['wordSelectMode']) {
    case 0:
      sp.prefs['wordSelectMode'] = 1;
      break;

    case 1:
      sp.prefs['wordSelectMode'] = 0;
      break;
  }
}

webext.startup().then(({ browser }) => {
  browser.runtime.onConnect.addListener(port => {
    if (port.name === 'sync-legacy-addon-data') {
      setSyncLegacyDataPort(port);
    }
  });
  browser.runtime.onMessage.addListener((msg, sender, sendReply) => {
    switch (msg.cmd) {
      case 'toggle-mode':
        toggleMode();
        break;

      case 'show-popup':
        showPopup(msg.text, msg.pos);
        break;
    }
  });
});
