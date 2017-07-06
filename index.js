let { Ci, Cc } = require("chrome");
let data = require("sdk/self").data;
let { Hotkey } = require("sdk/hotkeys");
let Panel = require("sdk/panel").Panel;
let Buttons = require("sdk/ui/button/action");
let selection = require("sdk/selection");
let pageMod = require("sdk/page-mod");

const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].
                       getService(Ci.nsIWindowMediator);

let doTrack = true;
let node_ = null;
let dictionaryPanel = null;
let workers = [];

function detachWorker(worker, workerArray) {
  let index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

function enableClickHandlers(value, workerArray) {
    for (let worker of workerArray) {
        worker.port.emit('enableClickHandler', value);
    }
}

function enableModifierKey(name, value, workerArray) {
    for (let worker of workerArray) {
        worker.port.emit('enableModifierKey', {'name': name, 'value': value});
    }
}

function context() {
  return windowMediator.getMostRecentWindow("navigator:browser").document.
         commandDispatcher.focusedWindow;
}

function trimStr(src) {
    return src.replace(/^[\0\s]+|[\0\s]+$/g,'');
}

exports.main = function() {
    let toggleMode = function () {
        let mode = require('sdk/simple-prefs').prefs['wordSelectMode'];
        switch (mode) {
            case 0: // Classic mode
                require('sdk/simple-prefs').prefs['wordSelectMode'] = 1;
            break;

            case 1: // Standard mode
                require('sdk/simple-prefs').prefs['wordSelectMode'] = 0;
            break;
        }
    };

    let onModePrefChange = function (prefName) {
        let mode = require('sdk/simple-prefs').prefs[prefName];
        switch (mode) {
            case 0: // Classic mode
                selection.on('select', onSelection);
                enableClickHandlers(false, workers);
                dictionaryWidget.contentURL = data.url("icon64-classic.png");
            break;

            case 1: // Standard mode
                selection.removeListener('select', onSelection);
                enableClickHandlers(true, workers);
                dictionaryWidget.contentURL = data.url("icon64.png");
            break;
        }
    };

    require('sdk/simple-prefs').on('wordSelectMode', onModePrefChange);

    let onModifierKeyPrefChange = function (prefName) {
        let isKeyEnabled = require('sdk/simple-prefs').prefs[prefName];
        enableModifierKey(prefName, isKeyEnabled, workers);
    };

    require('sdk/simple-prefs').on('useCtrl', onModifierKeyPrefChange);
    require('sdk/simple-prefs').on('useAlt', onModifierKeyPrefChange);
    require('sdk/simple-prefs').on('useMeta', onModifierKeyPrefChange);

    let setupConfig = function () {
        onModePrefChange('wordSelectMode');
        onModifierKeyPrefChange('useCtrl');
        onModifierKeyPrefChange('useAlt');
        onModifierKeyPrefChange('useMeta');
    };

    pageMod.PageMod({
        include: '*',
        attachTo: ["existing", "top"],
        contentScriptFile: [data.url('zepto.min.js'), data.url('click-handler.js')],
        onAttach: function (worker) {
            workers.push(worker);
            worker.on('detach', function () {
                detachWorker(this, workers);
            });
            worker.port.on('onSelectWord', function (e) {
                let mode = require('sdk/simple-prefs').prefs['wordSelectMode'];
                if (mode != 1) {
                    return;
                }
                if (dictionaryPanel) {
                    dictionaryPanel.destroy();
                }
                dictionaryPanel = new Panel({
                    width: 405,
                    height: 513,
                    contentURL: 'http://endic.naver.com/popManager.nhn?m=search&query=' + encodeURI(e.word),
                    contentScriptFile: [data.url('zepto.min.js'), data.url('postload.js')],
                    contentScriptWhen: 'end',
                    onShow: function () {
                        let innerHeight = parseInt(dictionaryPanel.innerHeight);
                        let correctHeight = 415 - (513 - innerHeight);
                        dictionaryPanel.port.emit('height-calculated', correctHeight);
                    }
                });
                dictionaryPanel.show(e.pos);
            });
            setupConfig();
        }
    });

    let onSelection = function () {
        if (typeof(selection.text) == 'string') {
            var selected_text = trimStr(selection.text);
            if (selected_text.length > 0) {
                let window_ = context();
                let selection_ = window_.getSelection();
                if (selection_.rangeCount < 1) {
                    return;
                }
                let curElement = window_.document.activeElement;
                if (curElement.nodeName.toLowerCase() == 'textarea'
                    || curElement.nodeName.toLowerCase() == 'input') {
                    return;
                }
                let range_ = selection_.getRangeAt(0);
                try {
                    if (node_ && node_.parentNode) {
                        node_.parentNode.removeChild(node_);
                    } else {
                        node_ = window_.document.createElement("span");
                    }
                } catch (e if e instanceof TypeError) {
                    node_ = window_.document.createElement("span");
                } finally {
                    range_.insertNode(node_);
                    if (dictionaryPanel) {
                        dictionaryPanel.destroy();
                    }
                    dictionaryPanel = new Panel({
                        width: 405,
                        height: 513,
                        contentURL: 'http://endic.naver.com/popManager.nhn?m=search&query=' + encodeURI(selected_text),
                        contentScriptFile: [data.url('zepto.min.js'), data.url('postload.js')],
                        contentScriptWhen: 'end',
                        onShow: function () {
                            let innerHeight = parseInt(dictionaryPanel.innerHeight);
                            let correctHeight = 415 - (513 - innerHeight);
                            dictionaryPanel.port.emit('height-calculated', correctHeight);
                        },
                        onHide: function () {
                            if (node_ && node_.parentNode) {
                                node_.parentNode.removeChild(node_);
                            }
                        }
                    });
                    dictionaryPanel.show(node_);
                }
            }
        }
    };

    let dictionaryWidget = new Buttons.ActionButton({
        id: "dictionaryWidget",
        label: "Naver English Dictionary",
        icon: {
            "16": "./icon64.png",
            "32": "./icon64.png",
            "64": "./icon64.png"
        },
        onClick: function () {
            toggleMode();
        }
    });

    let toggleHotKey = Hotkey({
        combo: "control-alt-e",
        onPress: function() {
            toggleMode();
        }
    });

    setupConfig();
};
