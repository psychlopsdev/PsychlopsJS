// now: https://qiita.com/horo/items/175c8fd7513138308930
// next: https://liginc.co.jp/370188
// next: https://lealog.hateblo.jp/entry/2017/01/05/211650


var VERSION = 1;
var STATIC_CACHE_NAME = 'static_' + VERSION;
var ORIGIN = location.protocol + '//' + location.hostname +
	(location.port ? ':' + location.port : '');

var STATIC_FILES = [
	ORIGIN + '/',
	ORIGIN + '/jpeg_encoder_basic.js',
	ORIGIN + '/?homescreen',
	ORIGIN + '/img/ic_photo_black_24px.svg',
	ORIGIN + '/img/ic_save_black_24px.svg',
	ORIGIN + '/img/ic_loop_black_24px.svg',
	ORIGIN + '/img/4pt.svg',
	ORIGIN + '/img/7pt.svg',
	ORIGIN + '/img/10pt.svg'];

var STATIC_FILE_URL_HASH = {};
STATIC_FILES.forEach(function (x) { STATIC_FILE_URL_HASH[x] = true; });

self.addEventListener('install', function (evt) {
	evt.waitUntil(
		caches.open(STATIC_CACHE_NAME).then(function (cache) {
			return Promise.all(STATIC_FILES.map(function (url) {
				return fetch(new Request(url)).then(function (response) {
					if (response.ok) {
						return cache.put(response.url, response);
					} else {
						return Promise.reject(
							'Invalid response.  URL:' + response.url +
							' Status: ' + response.status);
					}
				});
			}));
		}));
});

self.addEventListener('fetch', function (evt) {
	if (!STATIC_FILE_URL_HASH[evt.request.url]) {
		return;
	}
	evt.respondWith(caches.match(evt.request, { cacheName: STATIC_CACHE_NAME }));
});

self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then(function (keys) {
			var promises = [];
			keys.forEach(function (cacheName) {
				if (cacheName != STATIC_CACHE_NAME) {
					promises.push(caches.delete(cacheName));
				}
			});
			return Promise.all(promises);
		}));
});