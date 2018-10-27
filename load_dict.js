var qs  = window.location.search.replace('?', ''),
  _q  = qs.split('&'),
  q = {};

for (var i in _q) {
  var p = _q[i].split('=');
  q[p[0]] = p[1];
}

getWordMeaning(q['text']).then((result) => {
  document.body.innerHTML = result.innerHtml;
  for (const i in result.pronounceUrls) {
    let btn = document.body.querySelector(`#pron-${i}`);
    btn.addEventListener('click', function () {
      let audio = new Audio(result.pronounceUrls[i]);
      audio.play();
    })
  }
}).catch(() => {
  // do nothing
});

function getWordMeaning(word) {
  let dictUrl = `https://endic.naver.com/search.nhn?sLn=en&query=${encodeURIComponent(word)}&searchOption=entryIdiom&forceRedirect=`;
  let dictPageUrl = `https://endic.naver.com/search.nhn?sLn=kr&query=${encodeURIComponent(word)}`;
  let init = {
    headers: {
      'User-Agent': `${window.navigator.userAgent} NotAndroid`
    }
  };
  return fetch(dictUrl, init).then((response) => response.text())
      .then((text) => (new DOMParser()).parseFromString(text, 'text/html'))
      .then((doc) => {
        let cards = doc.body.querySelectorAll('div.section_card div.entry_search_word');
        if (cards.length < 1) {
          throw Error('No Result');
        }
        let pronounceUrls = [];
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
          result += `<dl><dt>${title.innerHTML}`
          let pronounces = card.querySelectorAll('div.pronun_area');
          for (let pronounce of pronounces) {
            let country = pronounce.querySelector('em.speech');
            let pronounceText = pronounce.querySelector('span.pronun');
            let pronounceButton = pronounce.querySelector('button.btn_listen');
            if (pronounceText === null) {
              continue;
            }
            result += ` ${country.innerHTML} ${pronounceText.innerHTML}`;
            if (pronounceButton !== null) {
              let chunks = pronounceButton.getAttribute('onclick').split("'");
              if (chunks.length < 2) {
                continue;
              }
              result += `<input id="pron-${pronounceUrls.length}" type="image" alt="발음듣기" src="icons/speech.png">`;
              pronounceUrls.push(chunks[1]);
            }
          }
          result += '</dt><dd>';
          if (descs.length > 1) {
            result += '<ol>';
            for (let desc of descs) {
              result += `<li>${desc.textContent}</li>`;
            }
            result += '</ol>'
          } else if (descs.length == 1) {
            result += descs[0].textContent;
          }
          result += '</dd></dl>';
          i++;
          if (i >=  5) {
            break;
          }
        }
        result += `<p class="naver-link"><a href="${dictPageUrl}" target="_blank" rel="noopener noreferrer">네이버 사전 열기</a></p>`
        return {
          innerHtml: result,
          pronounceUrls: pronounceUrls
        };
      });
}
