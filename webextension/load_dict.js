var qs  = window.location.search.replace('?', ''),
  _q  = qs.split('&'),
  q = {};

for (var i in _q) {
  var p = _q[i].split('=');
  q[p[0]] = p[1];
}

let iframe = document.querySelector('iframe');
iframe.src = 'http://endic.naver.com/popManager.nhn?m=search&query=' + q['text'];
