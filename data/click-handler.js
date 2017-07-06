var enableClickHandler = true;
var modifierKeysEnabled = {
    'useCtrl': false,
    'useAlt': true,
    'useMeta': false
}

self.port.on('enableClickHandler', function (value) {
    enableClickHandler = value;
});

self.port.on('enableModifierKey', function (args) {
    name = args['name'];
    value = args['value'];
    modifierKeysEnabled[name] = value;
});

var NED_clickHandler = function (e) {
    if (!enableClickHandler) {
        return true;
    }
    var selection = e.view.getSelection();
    if (modifierKeysEnabled['useCtrl'] != e.ctrlKey) {
        return true;
    }
    if (modifierKeysEnabled['useAlt'] != e.altKey) {
        return true;
    }
    if (modifierKeysEnabled['useMeta'] != e.metaKey) {
        return true;
    }
    if (!e.target || !selection.containsNode(e.target, true)) {
        return true;
    } else {
        selection.modify("move", "backward", "word");
        selection.modify("extend", "forward", "word");
        for (var i = 0; i < selection.rangeCount; i++) {
            var range = selection.getRangeAt(i);
            var boundingRect = range.getBoundingClientRect();
            if (!(boundingRect.left <= e.clientX
                    && e.clientX <= boundingRect.right
                    && boundingRect.top <= e.clientY
                    && e.clientY <= boundingRect.bottom)) {
                selection.removeAllRanges();
                return true;
            }
        }
        self.port.emit('onSelectWord',
            {'word': selection.toString(), 'pos': [e.screenX - window.screenX, e.screenY - window.screenY]});
        selection.removeAllRanges();
        return false;
    }
};

var NED_attachHandlers_frame = function (idx, frame) {
    frame.contentDocument.body.style.MozUserSelect = 'text';
    $(frame.contentDocument).on('click', NED_clickHandler);
};

document.body.style.MozUserSelect = 'text';
$(document).on('click', NED_clickHandler);

var frames = $('frame');
if (frames) {
    frames.each(NED_attachHandlers_frame);
}

var iframes = $('iframe');
if (iframes) {
    iframes.each(NED_attachHandlers_frame);
}
