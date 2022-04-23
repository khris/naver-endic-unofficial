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
  const encodedWord = encodeURIComponent(word);
  let dictUrl = `https://en.dict.naver.com/api3/enko/search?query=${encodedWord}&m=pc&range=all&shouldSearchVlive=true&lang=ko`;
  let dictPageUrl = `https://en.dict.naver.com/#/search?query=${encodedWord}&range=all`;
  let init = {
    headers: {
      'User-Agent': `${window.navigator.userAgent} NotAndroid`
    }
  };
  return fetch(dictUrl, init).then((response) => response.json())
      .then((data) => data.searchResultMap.searchResultListMap.WORD.items)
      .then((words) => {
        if (words.length < 1) {
          throw Error('No Result');
        }
        let pronounceUrls = [];
        let result = '';
        for (let word of words.slice(0, 4)) {
          let title = word.expEntry;
          result += `<dl><dt>${title}`

          let pronounces = word.searchPhoneticSymbolList.filter(pronounce => pronounce.symbolType !== 'accentia');
          for (let pronounce of pronounces) {
            if (pronounce.symbolFile === null || pronounce.symbolFile === '') {
              continue;
            }
            let country = pronounce.symbolType;
            let pronounceText = pronounce.symbolValue ? pronounce.symbolValue : '';

            result += ` <span class="tag">${country}</span> ${pronounceText}`;
            result += `<input id="pron-${pronounceUrls.length}" type="image" alt="발음듣기" src="icons/speech.png">`;
            pronounceUrls.push(pronounce.symbolFile);
          }
          result += '</dt><dd>';

          let descs = word.meansCollector.map(item => item.means.map(mean => {
            return {
              order: mean.order,
              part: item.partOfSpeech,
              value: mean.value,
            }
          })).flat();

          result += '<ul>';
          for (let desc of descs) {
            result += '<li>';
            if (desc.order) {
              result += `${desc.order}. `;
            }
            if (desc.part) {
              result += `<span class="tag">${desc.part}</span> `;
            }
            result += `${desc.value}</li>`;
          }
          result += '</dd></dl>';
        }
        result += '</ul>';
        result += `<p class="naver-link"><a href="${dictPageUrl}" target="_blank" rel="noopener noreferrer">네이버 사전 열기</a></p>`

        return {
          innerHtml: result,
          pronounceUrls: pronounceUrls
        };
      });
}
