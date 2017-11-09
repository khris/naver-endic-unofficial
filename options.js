function applyToFormElements(func) {
  for (const elem of document.querySelectorAll('input, select')) {
    func(elem);
  }
}

function getFormElementValue(elem) {
  if (elem.type === 'radio' || elem.type === 'checkbox') {
    return elem.checked;
  } else {
    return elem.value;
  }
}

function setFormElementValue(elem, value) {
  if (elem.type === 'radio' || elem.type === 'checkbox') {
    elem.checked = value;
  } else {
    elem.value = value;
  }
}

/* global defaultPrefs */
function restoreOptions() {
  browser.storage.local.get({
    prefs: defaultPrefs
  }).then((results) => {
    const { prefs } = results;
    applyToFormElements((elem) => {
      setFormElementValue(elem, prefs[elem.name]);
    });
  });
}

function saveOptions() {
  let newPrefs = {}
  applyToFormElements((elem) => {
    newPrefs[elem.name] = getFormElementValue(elem);
  });
  browser.storage.local.set({
    prefs: newPrefs
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
applyToFormElements((elem) => {
  elem.addEventListener('change', saveOptions);
});
