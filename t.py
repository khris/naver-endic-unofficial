import requests as req

res = req.get(url="https://en.dict.naver.com/api3/enko/search?query=hello&m=pc&range=all&shouldSearchVlive=true&lang=ko&hid=165717174723777100",headers={'User-Agent':
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0','Referer':
	'https://en.dict.naver.com/'})
print(res.text)