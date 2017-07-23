let q = document.querySelector;

function restoreSelectElement(prefs, k) {
  q(`select[name="${k}"]>option[value="${prefs['k']}"]`).selected = true;
}

function restoreCheckElement(prefs, k) {
  q(`input[name="${k}"`).checked = prefs[k];
}

function restoreOptions() {
  const getting = browser.storage.local.get('prefs');
  getting.then(results => {
    const { prefs } = results;
    restoreSelectElement(prefs, 'wordSelectMode');
    restoreCheckElement(prefs, 'useCtrl');
    restoreCheckElement(prefs, 'useAlt');
    restoreCheckElement(prefs, 'useMeta');
  });
}

function saveOption(event) {
  /*
  if (event.target.type === 'radio' || event.target.type === 'checkbox') {
    alert(event.target.name);
    alert(event.target.checked);
  } else {
    alert(event.target.value);
  }
  */
}

document.addEventListener("DOMContentLoaded", restoreOptions);
q("input, option").addEventListener("change", saveOption)
